import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Codal Fund Portfolio Aggregator"
    API_V1_STR: str = "/api/v1"

    DATA_DIR: str = os.path.join(os.getcwd(), "data")
    DOWNLOADS_DIR: str = os.path.join(os.getcwd(), "data", "downloads")
    UNPROTECTED_DIR: str = os.path.join(os.getcwd(), "data", "unprotected")
    OUTPUT_DIR: str = os.path.join(os.getcwd(), "data", "output")
    DATABASE_URL: str = f"sqlite:///{os.path.join(os.getcwd(), 'data', 'app.db')}"

    class Config:
        case_sensitive = True


settings = Settings()

for path in [settings.DATA_DIR, settings.DOWNLOADS_DIR, settings.UNPROTECTED_DIR, settings.OUTPUT_DIR]:
    os.makedirs(path, exist_ok=True)