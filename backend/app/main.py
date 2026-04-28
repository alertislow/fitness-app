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
    # allow_origins=["*"],  # 或 ["http://localhost:3000"],["http://localhost:5173"]
    # 如果 allow_credentials 設定為 True，則 allow_origins 不能使用通配符 *必須明確寫出網址
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://fitness-app-drab-nine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 純粹用來喚醒Render減少讀取時間，不做任何功能
@app.get("/ping")
async def ping():
    # 這個路由不呼叫 get_db，不查詢 SQL
    # 對 Render 來說，只要有 HTTP Request 進來，它就會啟動
    return {"status": "ok", "message": "Backend is awake"}