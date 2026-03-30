import os
from sqlalchemy import create_all,create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 優先讀取環境變數中的 DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitness.db")

# Render/Supabase 的修正邏輯
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 建立 Engine
# 只有 SQLite 需要 check_same_thread
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL 不需要額外參數
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,    # 每次使用前先「敲門」，避免 EOF 錯誤
        pool_recycle=300,      # 每 5 分鐘回收連線，避免被雲端防火牆強制切斷
        # 限制連線數
        pool_size=5,           
        max_overflow=10,
        # 設定連線逾時，如果資料庫真的掛了，不要讓前端等太久
        connect_args={"connect_timeout": 10}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()