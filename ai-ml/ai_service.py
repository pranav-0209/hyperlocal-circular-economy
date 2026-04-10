import pandas as pd
import numpy as np
import joblib
import pathlib
import os
import math
import logging
from logging.handlers import RotatingFileHandler
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBRegressor
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, mean_squared_error, r2_score
from pydantic import BaseModel
from scipy.sparse import hstack, csr_matrix

BASE_DIR = pathlib.Path(__file__).parent
DATA_PATH = BASE_DIR / "hyperlocal_dataset_25000.csv"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)
AI_API_KEY = os.getenv("AI_API_KEY", "hy3rL0c@l_ai_2026")
LOG_PATH = BASE_DIR / "api_requests.log"
FEATURE_VERSION = 4

CONDITION_ORDER = ["LIKE_NEW", "GOOD", "FAIR"]
DEFAULT_CONDITION = "GOOD"

CATEGORY_ENUM_MAP = {
    "fashion": "FASHION",
    "sports": "SPORTS",
    "tools": "TOOLS",
    "vehicles": "VEHICLES",
    "appliances": "APPLIANCES",
    "electronics": "ELECTRONICS",
    "furniture": "FURNITURE",
    "other": "OTHER",
    # Fold categories not present in project enums into OTHER.
    "books": "OTHER",
    "kids": "OTHER",
}

CONDITION_ENUM_MAP = {
    "excellent": "LIKE_NEW",
    "new": "LIKE_NEW",
    "like new": "LIKE_NEW",
    "likenew": "LIKE_NEW",
    "good": "GOOD",
    "fair": "FAIR",
    "poor": "FAIR",
}

CATEGORY_RULE_KEYWORDS = {
    "ELECTRONICS": [
        "phone", "iphone", "android", "mobile", "laptop", "macbook", "tablet", "ipad",
        "camera", "headphone", "earbuds", "speaker", "monitor", "tv", "motherboard", "gpu", "cpu"
    ],
    "APPLIANCES": ["fridge", "refrigerator", "microwave", "oven", "washing machine", "mixer", "grinder"],
    "FURNITURE": ["sofa", "chair", "table", "bed", "mattress", "wardrobe", "cabinet", "desk"],
    "VEHICLES": ["bike", "bicycle", "scooter", "car", "motorcycle", "porsche", "bmw", "audi"],
    "TOOLS": ["drill", "hammer", "saw", "toolkit", "wrench", "spanner"],
    "SPORTS": ["cricket", "football", "bat", "racket", "treadmill", "dumbbell", "yoga"],
    "FASHION": ["shirt", "jeans", "dress", "jacket", "shoe", "shoes", "sneaker", "watch", "bag"],
}

CATEGORY_RESPONSE_MAP = {
    "ELECTRONICS": "Electronics",
    "VEHICLES": "Vehicles",
    "FURNITURE": "Furniture",
    "APPLIANCES": "Appliances",
    "BOOKS": "Books",
    "FASHION": "Fashion",
    "TOOLS": "Tools",
    "SPORTS": "Sports",
    "KIDS": "Kids",
    "OTHER": "Other",
}

ARTIFACT_PATHS = {
    "category_model": MODELS_DIR / "category_model.pkl",
    "price_model": MODELS_DIR / "price_model.pkl",
    "vectorizer": MODELS_DIR / "vectorizer.pkl",
    "encoder": MODELS_DIR / "encoder.pkl",
    "cat_encoder": MODELS_DIR / "cat_encoder.pkl",
    "metadata": MODELS_DIR / "metadata.pkl",
}

category_model = None
price_model = None
vectorizer = None
encoder = None
cat_encoder = None
metadata = {}
model_metrics = {
    "category_model": {
        "accuracy": "N/A",
        "classification_report": "N/A",
    },
    "price_model": {
        "mae": None,
        "rmse": None,
        "r2_score": None,
    }
}


def setup_logger():
    logger = logging.getLogger("ai_service")
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        "%Y-%m-%d %H:%M:%S"
    )

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(LOG_PATH, maxBytes=2_000_000, backupCount=3)
    file_handler.setFormatter(formatter)

    logger.addHandler(stream_handler)
    logger.addHandler(file_handler)
    logger.propagate = False
    return logger


logger = setup_logger()


def normalize_condition(condition: str) -> str:
    normalized = " ".join(str(condition).strip().lower().replace("-", " ").replace("_", " ").split())
    return CONDITION_ENUM_MAP.get(normalized, DEFAULT_CONDITION)


def normalize_category(category: str) -> str:
    normalized = " ".join(str(category).strip().lower().replace("-", " ").replace("_", " ").split())
    return CATEGORY_ENUM_MAP.get(normalized, "OTHER")


def apply_rule_based_category_correction(item_name: str, category: str) -> str:
    lowered_name = str(item_name).strip().lower()
    for mapped_category, keywords in CATEGORY_RULE_KEYWORDS.items():
        if any(keyword in lowered_name for keyword in keywords):
            return mapped_category
    return category


def clean_item_name(item_name: str) -> str:
    return " ".join(str(item_name).strip().lower().split())


def preprocess_price_dataset(raw_data: pd.DataFrame) -> pd.DataFrame:
    data = raw_data.copy()
    data["Item_Name_clean"] = data["Item_Name"].astype(str).apply(clean_item_name)
    data["Category_norm"] = data["Category"].astype(str).apply(normalize_category)
    data["Category_norm"] = data.apply(
        lambda row: apply_rule_based_category_correction(row["Item_Name_clean"], row["Category_norm"]),
        axis=1
    )
    data["Condition_norm"] = data["Condition"].astype(str).apply(normalize_condition)
    data["Rent_Price_Per_Day"] = pd.to_numeric(data["Rent_Price_Per_Day"], errors="coerce")
    data = data.dropna(subset=["Rent_Price_Per_Day", "Item_Name_clean", "Category_norm", "Condition_norm"])

    group_cols = ["Item_Name_clean", "Category_norm", "Condition_norm"]
    data["Rent_Price_Per_Day"] = data.groupby(group_cols)["Rent_Price_Per_Day"].transform("median")

    q1 = data["Rent_Price_Per_Day"].quantile(0.25)
    q3 = data["Rent_Price_Per_Day"].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    data = data[
        (data["Rent_Price_Per_Day"] >= lower_bound)
        & (data["Rent_Price_Per_Day"] <= upper_bound)
    ].copy()

    return data


def build_price_signal_maps(train_data: pd.DataFrame) -> dict:
    category_avg_map = (
        train_data.groupby("Category_norm")["Rent_Price_Per_Day"]
        .mean()
        .to_dict()
    )
    condition_avg_map = (
        train_data.groupby("Condition_norm")["Rent_Price_Per_Day"]
        .mean()
        .to_dict()
    )
    global_avg_price = float(train_data["Rent_Price_Per_Day"].mean())

    return {
        "category_avg_price_map": {k: float(v) for k, v in category_avg_map.items()},
        "condition_avg_price_map": {k: float(v) for k, v in condition_avg_map.items()},
        "global_avg_price": global_avg_price,
    }


def add_price_signal_features(data: pd.DataFrame, price_signal_maps: dict) -> pd.DataFrame:
    enriched = data.copy()
    category_avg_map = price_signal_maps.get("category_avg_price_map", {})
    condition_avg_map = price_signal_maps.get("condition_avg_price_map", {})
    global_avg_price = float(price_signal_maps.get("global_avg_price", float(enriched["Rent_Price_Per_Day"].mean())))

    enriched["Category_avg_price"] = (
        enriched["Category_norm"].map(category_avg_map).fillna(global_avg_price).astype(float)
    )
    enriched["Condition_avg_price"] = (
        enriched["Condition_norm"].map(condition_avg_map).fillna(global_avg_price).astype(float)
    )
    return enriched


def build_structured_feature_frame(data: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Category": data["Category_norm"].astype(str),
            "Condition": data["Condition_norm"].astype(str),
            "Category_avg_price": data["Category_avg_price"].astype(float),
            "Condition_avg_price": data["Condition_avg_price"].astype(float),
        }
    )


def apply_condition_multiplier(base_price: float, normalized_condition: str, condition_multipliers: dict | None = None) -> float:
    if condition_multipliers is None:
        condition_multipliers = metadata.get("condition_multipliers", {})
    multiplier = condition_multipliers.get(
        normalized_condition,
        condition_multipliers.get(DEFAULT_CONDITION, 1.0)
    )
    return float(base_price) * float(multiplier)


def build_condition_multipliers(data: pd.DataFrame) -> dict[str, float]:
    condition_medians = (
        data.groupby("Condition_norm")["Rent_Price_Per_Day"]
        .median()
        .to_dict()
    )

    like_new_baseline = condition_medians.get("LIKE_NEW", float(data["Rent_Price_Per_Day"].median()))
    multipliers: dict[str, float] = {}
    previous = 1.0

    for idx, cond in enumerate(CONDITION_ORDER):
        if idx == 0:
            value = 1.0
        elif cond in condition_medians and like_new_baseline > 0:
            value = float(condition_medians[cond] / like_new_baseline)
        else:
            value = previous * 0.9

        # Enforce monotonic pricing by condition: LIKE_NEW >= GOOD >= FAIR.
        value = min(value, previous)
        value = max(value, 0.3)
        multipliers[cond] = round(value, 4)
        previous = value

    multipliers["LIKE_NEW"] = max(multipliers.get("LIKE_NEW", 1.0), multipliers.get("GOOD", 1.0), multipliers.get("FAIR", 1.0))
    multipliers["GOOD"] = min(multipliers.get("LIKE_NEW", 1.0), max(multipliers.get("GOOD", 0.9), multipliers.get("FAIR", 0.8)))
    multipliers["FAIR"] = min(multipliers.get("GOOD", 0.9), multipliers.get("FAIR", 0.8))

    return multipliers


def train_and_save_models():
    data = preprocess_price_dataset(pd.read_csv(DATA_PATH))

    train_data, test_data = train_test_split(
        data,
        test_size=0.2,
        random_state=42
    )

    price_signal_maps = build_price_signal_maps(train_data)
    train_data = add_price_signal_features(train_data, price_signal_maps)
    test_data = add_price_signal_features(test_data, price_signal_maps)

    local_cat_encoder = LabelEncoder()
    local_cat_encoder.fit(train_data["Category_norm"])
    train_data["Category_encoded"] = local_cat_encoder.transform(train_data["Category_norm"])
    test_data["Category_encoded"] = local_cat_encoder.transform(test_data["Category_norm"])

    local_vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=4000
    )
    Xtext_train = local_vectorizer.fit_transform(train_data["Item_Name_clean"])
    Xtext_test = local_vectorizer.transform(test_data["Item_Name_clean"])

    Xstruct_train = build_structured_feature_frame(train_data)
    Xstruct_test = build_structured_feature_frame(test_data)

    ycat_train = train_data["Category_encoded"]
    ycat_test = test_data["Category_encoded"]
    yprice_test = test_data["Rent_Price_Per_Day"].astype(float)
    yprice_log_train = np.log1p(train_data["Rent_Price_Per_Day"].astype(float))

    local_encoder = OneHotEncoder(handle_unknown="ignore")
    Xstruct_train_enc = local_encoder.fit_transform(Xstruct_train[["Category", "Condition"]])
    Xstruct_test_enc = local_encoder.transform(Xstruct_test[["Category", "Condition"]])

    Xstruct_train_num = csr_matrix(
        Xstruct_train[["Category_avg_price", "Condition_avg_price"]].to_numpy(dtype=float)
    )
    Xstruct_test_num = csr_matrix(
        Xstruct_test[["Category_avg_price", "Condition_avg_price"]].to_numpy(dtype=float)
    )

    Xprice_train = hstack((Xtext_train, Xstruct_train_enc, Xstruct_train_num))
    Xprice_test = hstack((Xtext_test, Xstruct_test_enc, Xstruct_test_num))

    local_category_model = RandomForestClassifier(n_estimators=150)
    local_price_model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        objective="reg:squarederror",
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
        n_jobs=-1
    )

    local_category_model.fit(Xtext_train, ycat_train)
    local_price_model.fit(Xprice_train, yprice_log_train)

    condition_multipliers = build_condition_multipliers(train_data)

    cat_pred = local_category_model.predict(Xtext_test)
    price_pred_log = local_price_model.predict(Xprice_test)
    base_price_pred = np.expm1(price_pred_log)
    condition_series = Xstruct_test["Condition"].tolist()
    price_pred = [
        apply_condition_multiplier(price, condition, condition_multipliers)
        for price, condition in zip(base_price_pred, condition_series)
    ]

    cat_accuracy = accuracy_score(ycat_test, cat_pred)
    cat_report = classification_report(
        ycat_test,
        cat_pred,
        target_names=local_cat_encoder.classes_,
        zero_division=0
    )

    price_mae = mean_absolute_error(yprice_test, price_pred)
    price_rmse = math.sqrt(mean_squared_error(yprice_test, price_pred))
    price_r2 = r2_score(yprice_test, price_pred)

    computed_metrics = {
        "category_model": {
            "accuracy": f"{cat_accuracy * 100:.2f}%",
            "classification_report": cat_report,
        },
        "price_model": {
            "mae": round(float(price_mae), 2),
            "rmse": round(float(price_rmse), 2),
            "r2_score": round(float(price_r2), 2),
        }
    }

    print("\nMODEL TRAINED SUCCESSFULLY")
    print("--------------------------")
    print("Category Accuracy:", computed_metrics["category_model"]["accuracy"])
    print("Price MAE:", computed_metrics["price_model"]["mae"])
    print("Price RMSE:", computed_metrics["price_model"]["rmse"])
    print("Price R2:", computed_metrics["price_model"]["r2_score"])

    model_metadata = {
        "feature_version": FEATURE_VERSION,
        "condition_multipliers": condition_multipliers,
        "price_signal_maps": price_signal_maps,
        "model_metrics": computed_metrics,
    }

    joblib.dump(local_category_model, ARTIFACT_PATHS["category_model"])
    joblib.dump(local_price_model, ARTIFACT_PATHS["price_model"])
    joblib.dump(local_vectorizer, ARTIFACT_PATHS["vectorizer"])
    joblib.dump(local_cat_encoder, ARTIFACT_PATHS["cat_encoder"])
    joblib.dump(local_encoder, ARTIFACT_PATHS["encoder"])
    joblib.dump(model_metadata, ARTIFACT_PATHS["metadata"])


def load_models():
    global category_model, price_model, vectorizer, cat_encoder, encoder, metadata, model_metrics
    category_model = joblib.load(ARTIFACT_PATHS["category_model"])
    price_model = joblib.load(ARTIFACT_PATHS["price_model"])
    vectorizer = joblib.load(ARTIFACT_PATHS["vectorizer"])
    cat_encoder = joblib.load(ARTIFACT_PATHS["cat_encoder"])
    encoder = joblib.load(ARTIFACT_PATHS["encoder"])
    metadata = joblib.load(ARTIFACT_PATHS["metadata"])
    model_metrics = metadata.get("model_metrics", model_metrics)


def has_valid_model_metrics(metrics: dict) -> bool:
    category_metrics = metrics.get("category_model", {})
    price_metrics = metrics.get("price_model", {})

    return (
        category_metrics.get("accuracy") not in (None, "N/A")
        and category_metrics.get("classification_report") not in (None, "N/A")
        and price_metrics.get("mae") is not None
        and price_metrics.get("rmse") is not None
        and price_metrics.get("r2_score") is not None
    )


def evaluate_models_with_saved_artifacts() -> dict:
    data = preprocess_price_dataset(pd.read_csv(DATA_PATH))

    _, test_data = train_test_split(
        data,
        test_size=0.2,
        random_state=42
    )

    price_signal_maps = metadata.get("price_signal_maps")
    if not price_signal_maps:
        train_data, _ = train_test_split(
            data,
            test_size=0.2,
            random_state=42
        )
        price_signal_maps = build_price_signal_maps(train_data)

    test_data = add_price_signal_features(test_data, price_signal_maps)

    X_text = vectorizer.transform(test_data["Item_Name_clean"])
    X_struct = build_structured_feature_frame(test_data)

    y_category = cat_encoder.transform(test_data["Category_norm"])
    y_price = test_data["Rent_Price_Per_Day"].astype(float)

    Xstruct_enc = encoder.transform(X_struct[["Category", "Condition"]])
    Xstruct_num = csr_matrix(
        X_struct[["Category_avg_price", "Condition_avg_price"]].to_numpy(dtype=float)
    )
    Xprice_test = hstack((X_text, Xstruct_enc, Xstruct_num))

    condition_multipliers = metadata.get("condition_multipliers", {})

    cat_pred = category_model.predict(X_text)
    price_pred_log = price_model.predict(Xprice_test)
    base_price_pred = np.expm1(price_pred_log)
    condition_series = X_struct["Condition"].tolist()
    price_pred = [
        apply_condition_multiplier(price, condition, condition_multipliers)
        for price, condition in zip(base_price_pred, condition_series)
    ]

    cat_accuracy = accuracy_score(y_category, cat_pred)
    cat_report = classification_report(
        y_category,
        cat_pred,
        target_names=cat_encoder.classes_,
        zero_division=0
    )

    price_mae = mean_absolute_error(y_price, price_pred)
    price_rmse = math.sqrt(mean_squared_error(y_price, price_pred))
    price_r2 = r2_score(y_price, price_pred)

    return {
        "category_model": {
            "accuracy": f"{cat_accuracy * 100:.2f}%",
            "classification_report": cat_report,
        },
        "price_model": {
            "mae": round(float(price_mae), 2),
            "rmse": round(float(price_rmse), 2),
            "r2_score": round(float(price_r2), 2),
        }
    }


def print_model_metrics_to_console():
    category_accuracy = model_metrics.get("category_model", {}).get("accuracy", "N/A")
    price_metrics = model_metrics.get("price_model", {})

    print("\nMODEL METRICS")
    print("-------------")
    print("Category Accuracy:", category_accuracy)
    print("Price MAE:", price_metrics.get("mae", "N/A"))
    print("Price RMSE:", price_metrics.get("rmse", "N/A"))
    print("Price R2:", price_metrics.get("r2_score", "N/A"))


def initialize_models():
    global model_metrics
    feature_mismatch = False
    if ARTIFACT_PATHS["metadata"].exists():
        saved_metadata = joblib.load(ARTIFACT_PATHS["metadata"])
        feature_mismatch = saved_metadata.get("feature_version") != FEATURE_VERSION

    missing_artifacts = [
        str(path.name) for path in ARTIFACT_PATHS.values() if not path.exists()
    ]

    if missing_artifacts or feature_mismatch:
        print("Missing model artifacts in models/:", ", ".join(missing_artifacts))
        if feature_mismatch:
            print("Model feature version mismatch. Retraining required.")
        print("Starting training pipeline...")
        train_and_save_models()
    else:
        print("All model artifacts found in models/. Skipping training.")

    load_models()

    if not has_valid_model_metrics(model_metrics):
        print("Saved model metrics missing. Computing metrics from existing artifacts...")
        computed_metrics = evaluate_models_with_saved_artifacts()
        metadata["model_metrics"] = computed_metrics
        joblib.dump(metadata, ARTIFACT_PATHS["metadata"])
        model_metrics = computed_metrics

    print_model_metrics_to_console()


initialize_models()

# ------------------------------
# Prediction Functions
# ------------------------------
def predict_category(item_name):
    normalized_item_name = clean_item_name(item_name)
    rule_based_category = apply_rule_based_category_correction(normalized_item_name, "OTHER")
    if rule_based_category != "OTHER":
        return {
            "category": str(rule_based_category).upper()
        }

    item_vec = vectorizer.transform([normalized_item_name])
    category_encoded = category_model.predict(item_vec)[0]
    predicted_category = cat_encoder.inverse_transform([category_encoded])[0]

    return {
        "category": str(predicted_category).upper()
    }


def predict_price(item_name, category, condition):

    item_vec = vectorizer.transform([clean_item_name(item_name)])
    normalized_category = apply_rule_based_category_correction(item_name, normalize_category(category))
    normalized_condition = normalize_condition(condition)
    price_signal_maps = metadata.get("price_signal_maps", {})
    category_avg_map = price_signal_maps.get("category_avg_price_map", {})
    condition_avg_map = price_signal_maps.get("condition_avg_price_map", {})
    global_avg_price = float(price_signal_maps.get("global_avg_price", 0.0))

    category_avg_price = float(category_avg_map.get(normalized_category, global_avg_price))
    condition_avg_price = float(condition_avg_map.get(normalized_condition, global_avg_price))

    struct_input = pd.DataFrame(
        [{
            "Category": normalized_category,
            "Condition": normalized_condition,
            "Category_avg_price": category_avg_price,
            "Condition_avg_price": condition_avg_price,
        }]
    )
    struct_vec = encoder.transform(struct_input[["Category", "Condition"]])
    struct_num = csr_matrix(
        struct_input[["Category_avg_price", "Condition_avg_price"]].to_numpy(dtype=float)
    )
    price_input = hstack((item_vec, struct_vec, struct_num))

    predicted_log_price = float(price_model.predict(price_input)[0])
    base_price = float(np.expm1(predicted_log_price))
    price = apply_condition_multiplier(base_price, normalized_condition)

    return {
        "price": round(float(price), 2)
    }

# ------------------------------
# FastAPI
# ------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemRequest(BaseModel):
    item_name: str


class PriceRequest(BaseModel):
    item_name: str
    category: str
    condition: str


def verify_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    if x_api_key != AI_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")


@app.post("/predict/category")
def ai_predict_category(request: ItemRequest, _: None = Depends(verify_api_key)):
    result = predict_category(request.item_name)
    logger.info(
        "endpoint=/predict/category input=%s output=%s",
        request.model_dump(),
        result
    )
    return result


@app.post("/predict/price")
def ai_predict_price(request: PriceRequest, _: None = Depends(verify_api_key)):
    result = predict_price(
        request.item_name,
        request.category,
        request.condition
    )
    logger.info(
        "endpoint=/predict/price input=%s output=%s",
        request.model_dump(),
        result
    )
    return result


@app.get("/model/accuracy")
def get_model_accuracy():
    return model_metrics