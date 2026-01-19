import json
import math

def cosine(a, b) -> float:
    # cosine similarity between two vectors
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    return dot / (na * nb + 1e-12)

def load_vec(embedding_json: str):
    if not embedding_json:
        return None
    return json.loads(embedding_json)

def build_why(interests: list[str], ai_keywords_csv: str) -> str:
    kws = [k.strip().lower() for k in (ai_keywords_csv or "").split(",") if k.strip()]
    inter = [i.strip().lower() for i in interests if i.strip()]
    matched = [i for i in inter if i in set(kws)]
    if matched:
        return f"Recommended because it matches your interests: {', '.join(matched)} and fits your availability."
    return "Recommended because it fits your availability and is semantically similar to your interests."
