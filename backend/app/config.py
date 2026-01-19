from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent   # -> backend/
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    GEMINI_API_KEY: str

    ACCESS_TOKEN_MINUTES: int = 60
    JWT_ALGO: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        extra="ignore"
    )

settings = Settings()
