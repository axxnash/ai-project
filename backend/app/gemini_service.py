import json
from google import genai
from google.genai import types
from app.config import settings

EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "event_type": {"type": "string"},
        "keywords": {"type": "array", "items": {"type": "string"}},
        "summary": {"type": "string"},
    },
    "required": ["event_type", "keywords", "summary"],
}

_client = None

def get_client():
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing. Put it in .env")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

def extract_event_fields(title: str, description: str) -> dict:
    prompt = f"""
Extract:
1) event_type (Workshop/Talk/Competition/Seminar/Career Talk etc.)
2) 5-10 keywords (lowercase)
3) 1-line summary

Return ONLY valid JSON.

TITLE: {title}
DESCRIPTION: {description}
"""

    client = get_client()
    resp = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EXTRACT_SCHEMA,
        ),
    )
    return json.loads(resp.text)

def embed_text(text: str) -> list[float]:
    client = get_client()
    res = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
    )
    return res.embeddings[0].values
