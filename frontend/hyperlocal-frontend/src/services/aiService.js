import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { ITEM_CATEGORIES } from '../schemas/marketplaceSchema';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || 'hy3rL0c@l_ai_2026';
const AI_TIMEOUT_MS = Math.min(API_CONFIG.TIMEOUT, 10000);

const toComparableCategory = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '');

const toProperCase = (value) => value
  .toLowerCase()
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeCategory = (value) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = toComparableCategory(trimmed);
  const matchedCategory = ITEM_CATEGORIES.find(
    (category) => toComparableCategory(category) === normalized
  );

  if (matchedCategory) {
    return matchedCategory;
  }

  const properCase = toProperCase(trimmed);
  return ITEM_CATEGORIES.includes(properCase) ? properCase : null;
};

const getAuthHeader = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const resolvedToken = adminToken || token;

  return resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {};
};

const callAiApi = async (endpoint, payload) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

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
      throw new Error('AI service request failed.');
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

export const suggestCategory = async ({ itemName }) => {
  const item_name = itemName?.trim();
  if (!item_name) {
    throw new Error('Item title is required for category suggestion.');
  }

  const response = await callAiApi('/predict/category', { item_name });
  const category = normalizeCategory(response?.category);

  if (!category) {
    throw new Error('AI service returned an invalid category suggestion.');
  }

  return category;
};

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
  if (!Number.isFinite(price)) {
    throw new Error('AI service returned an invalid price suggestion.');
  }

  return price;
};
