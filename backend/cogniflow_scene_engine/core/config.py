from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings management backed by environment variables."""

    gemini_api_key: str = Field(default="", validation_alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-3.6-flash", validation_alias="GEMINI_MODEL")
    engine_env: str = Field(default="development", validation_alias="ENGINE_ENV")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    max_retries: int = Field(default=3, validation_alias="MAX_RETRIES")
    retry_delay_seconds: float = Field(default=2.0, validation_alias="RETRY_DELAY_SECONDS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()