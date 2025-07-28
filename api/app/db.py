import os
from app import settings as config
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# CRITICAL: Railway-aware database connection
# Check for Railway's DATABASE_URL first, then fall back to individual variables
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Railway managed PostgreSQL (preferred)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    print("✅ Using Railway DATABASE_URL for PostgreSQL connection")
else:
    # Individual environment variables (fallback)
    DATABASE_USERNAME = config.DATABASE_USERNAME
    DATABASE_PASSWORD = config.DATABASE_PASSWORD
    DATABASE_HOST = config.DATABASE_HOST
    DATABASE_NAME = config.DATABASE_NAME
    SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"
    print("✅ Using individual PostgreSQL environment variables")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Provides a database session for dependency injection.

    This function is used to obtain a new database session instance from the
    `SessionLocal` factory. It is intended to be used with dependency injection
    in FastAPI to manage database sessions.

    Yields:
        Session: A SQLAlchemy database session.

    Notes:
        The session is automatically closed after use to ensure proper resource management.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
