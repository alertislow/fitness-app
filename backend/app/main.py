from fastapi import FastAPI
from .database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.workout import router as workout_router
from app.routers.exercise import router as exercise_router

# 建表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness App API")

# include routers
app.include_router(auth_router)
app.include_router(workout_router)
app.include_router(exercise_router)
# CORS設定，允許前端應用訪問 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或 ["http://localhost:3000"],["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
