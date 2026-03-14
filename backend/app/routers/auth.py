from fastapi import FastAPI, Depends, HTTPException, APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.database import SessionLocal, engine
from app.models import Base, User
from fastapi.middleware.cors import CORSMiddleware
from .. import schemas

# 建立資料表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Auth API")

SECRET_KEY = "YOUR_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

# 密碼加密設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.include_router(router)  # 匯入 router，讓註冊、登入等功能成為 API 的一部分，而不是獨立的模組，（後續說要加的，若有bug要刪）

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

# Pydantic Schemas
class UserCreate(BaseModel):
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

# 註冊
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_pwd = pwd_context.hash(user.password)
    db_user = User(email=user.email, password=hashed_pwd, role=user.role) # 使用者註冊時可以指定角色，預設為"user"
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # return {"id": db_user.id, "email": db_user.email, "role": db_user.role}
    return db_user  # 返回完整的用戶對象，包括角色信息

# 登入
@router.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 在JWT中加入角色信息
    payload = {
        "sub": str(db_user.id),
        "exp": expire,
        "role": db_user.role  
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# 取得所有會員
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


# 刪除會員
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}