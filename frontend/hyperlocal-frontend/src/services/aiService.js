import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { ITEM_CATEGORIES } from '../schemas/marketplaceSchema';

// ── Configuration ─────────────────────────────────────────────────────────────
//
// AI service runs on a separate FastAPI process (default: port 8000).
// The Spring Boot backend runs on port 8080 — these are intentionally different.
//
// VITE_AI_API_URL must be set in .env for non-local deployments.
// VITE_AI_API_KEY must match the AI_API_KEY env var on the FastAPI side.
const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || 'hy3rL0c@l_ai_2026';

// Default timeout for fast ML endpoints (category, price).
// Capped at the global API_CONFIG.TIMEOUT (10 s) to stay consistent.
const AI_TIMEOUT_MS = Math.min(API_CONFIG.TIMEOUT, 10_000);

// The Ollama description endpoint has a backend timeout of 30 s (OLLAMA_TIMEOUT).
// Use a slightly longer client-side timeout so we always hear the backend error
// rather than aborting before it can respond.
const AI_DESCRIPTION_TIMEOUT_MS = 35_000;

// ── Category normalisation helpers ────────────────────────────────────────────
//
// The backend returns category labels in UPPERCASE (e.g. "ELECTRONICS",
// "LIKE_NEW") because that is what the DistilBERT id2label map contains.
// ITEM_CATEGORIES uses proper-case (e.g. "Electronics"). The helpers below
// bridge the two representations without hard-coding any mapping here —
// if a new label is added to the model config.json it only needs to be added
// to ITEM_CATEGORIES in marketplaceSchema.js.

const toComparableCategory = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const toProperCase = (value) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Maps a raw backend category label (any casing) to the matching entry in
 * ITEM_CATEGORIES, or returns null when no match exists.
 *
 * Strategy:
 *  1. Strip non-alphanumeric chars and compare lower-case — handles UPPER_CASE,
 *     Title Case, kebab-case, etc.
 *  2. Fall back to a proper-case conversion and direct array lookup.
 *
 * @param {string | undefined} value - Raw category string from the backend.
 * @returns {string | null} A valid ITEM_CATEGORIES entry or null.
 */
const normalizeCategory = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const normalized = toComparableCategory(trimmed);
  const matchedCategory = ITEM_CATEGORIES.find(
    (category) => toComparableCategory(category) === normalized,
  );

  if (matchedCategory) return matchedCategory;

  const properCase = toProperCase(trimmed);
  return ITEM_CATEGORIES.includes(properCase) ? properCase : null;
};

// ── Auth header ───────────────────────────────────────────────────────────────
//
// The FastAPI AI service uses its own X-API-Key header for authentication and
// does not require a JWT. The Authorization header is sent as a courtesy in
// case a reverse-proxy in front of the AI service validates it, but is not
// required by the FastAPI routes themselves.

const getAuthHeader = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const resolvedToken = adminToken || token;

  return resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {};
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Makes a POST request to the AI FastAPI service.
 *
 * Error handling surface:
 *  - AbortError (timeout)      → friendly timeout message
 *  - HTTP 403                  → auth/key failure
 *  - HTTP 422                  → payload validation failure (Pydantic)
 *  - Other non-2xx             → generic message with status code
 *  - Network errors            → re-thrown as-is
 *
 * @param {string} endpoint - Path relative to AI_BASE_URL (e.g. '/predict/category').
 * @param {object} payload  - JSON body to send.
 * @param {number} [timeoutMs=AI_TIMEOUT_MS] - Abort timeout in milliseconds.
 * @returns {Promise<object>} Parsed JSON response body.
 */
const callAiApi = async (endpoint, payload, timeoutMs = AI_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AI_API_KEY,
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Attempt to surface the backend's detail message (FastAPI HTTPException
      // format: { "detail": "..." }).
      let detail = '';
      try {
        const errBody = await response.json();
        detail = errBody?.detail ? ` — ${errBody.detail}` : '';
      } catch {
        // response body not JSON; ignore
      }

      if (response.status === 403) {
        throw new Error(`AI service authentication failed (403)${detail}. Check VITE_AI_API_KEY.`);
      }
      if (response.status === 422) {
        throw new Error(`AI service rejected the request (422)${detail}. Check request payload.`);
      }
      throw new Error(`AI service request failed (${response.status})${detail}.`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI service timed out. Please try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Category Suggestion — powered by the fine-tuned DistilBERT model.
 *
 * Backend endpoint : POST /predict/category
 * Request payload  : { item_name: string }
 * Response shape   : { category: string (UPPERCASE), confidence: number (0-100) }
 *
 * The raw `category` label (UPPERCASE, e.g. "ELECTRONICS") is normalised to
 * the proper-case ITEM_CATEGORIES entry (e.g. "Electronics") before returning.
 * The `confidence` field is intentionally not returned here — callers receive
 * only the normalised category string for direct use in form state.
 *
 * @param {{ itemName: string }} params
 * @returns {Promise<string>} A valid ITEM_CATEGORIES entry.
 */
export const suggestCategory = async ({ itemName }) => {
  const item_name = itemName?.trim();
  if (!item_name) {
    throw new Error('Item title is required for category suggestion.');
  }

  const response = await callAiApi('/predict/category', { item_name });
  const category = normalizeCategory(response?.category);

  if (!category) {
    throw new Error(
      `AI service returned an unrecognised category: "${response?.category}". Please select manually.`,
    );
  }

  return category;
};

/**
 * Price Suggestion — powered by the XGBoost price model.
 *
 * Backend endpoint : POST /predict/price
 * Request payload  : { item_name: string, category: string, condition: string }
 * Response shape   : { price: number }
 *
 * The backend normalises both `category` and `condition` internally, so
 * passing the frontend's proper-case values (e.g. "Electronics", "Good") is
 * safe — they will be mapped to the internal enum ("ELECTRONICS", "GOOD").
 *
 * @param {{ itemName: string, category: string, condition: string }} params
 * @returns {Promise<number>} Predicted rent price per day (₹).
 */
export const suggestPrice = async ({ itemName, category, condition }) => {
  const item_name = itemName?.trim();

  if (!item_name || !category || !condition) {
    throw new Error('Item title, category, and condition are required for price suggestion.');
  }

  const response = await callAiApi('/predict/price', {
    item_name,
    category,
    condition,
  });

  const price = Number(response?.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('AI service returned an invalid price suggestion.');
  }

  return price;
};

/**
 * Description Generator — powered by Qwen3 1.7B via Ollama.
 *
 * Backend endpoint : POST /ai/listing-enhancement
 * Request payload  : { title: string, category: string, condition: string }
 * Response shape   : { description: string }
 *                    On Ollama error also includes: { error: string }
 *
 * Uses a longer client-side timeout (AI_DESCRIPTION_TIMEOUT_MS = 35 s) to
 * accommodate the Ollama model's generation latency (backend: 30 s max).
 *
 * @param {{ title: string, category: string, condition: string }} params
 * @returns {Promise<string>} Generated marketplace description.
 */
export const suggestDescription = async ({ title, category, condition }) => {
  const trimmedTitle = title?.trim();

  if (!trimmedTitle || !category || !condition) {
    throw new Error('Item title, category, and condition are required for description generation.');
  }

  const response = await callAiApi(
    '/ai/listing-enhancement',
    { title: trimmedTitle, category, condition },
    AI_DESCRIPTION_TIMEOUT_MS,
  );

  const description = response?.description?.trim();
  if (!description) {
    throw new Error(response?.error || 'AI service returned an empty description.');
  }

  return description;
};
