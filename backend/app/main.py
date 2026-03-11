
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from fastapi import HTTPException 
from . import models, schemas
from fastapi.middleware.cors import CORSMiddleware
from .auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Tracker API")

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


