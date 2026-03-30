from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.models import User
from app.core.security import SECRET_KEY, ALGORITHM # 你的 JWT secret/algorithm
from app import schemas
from app.core.security import get_current_user_id
from app.schemas import UserRead # 取得會員資料時過濾密碼

router = APIRouter(prefix="/auth", tags=["auth"])
# 密碼加密設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# 註冊
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    raw_password = user.password
    if isinstance(raw_password, str):
        # 確保不超過 72 字元並轉成 utf-8
        raw_password = raw_password[:71] 

    hashed_pwd = pwd_context.hash(raw_password)
    db_user = User(email=user.email, password=hashed_pwd, role=user.role) # 使用者註冊時可以指定角色，預設為"user"
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user  # 返回完整的用戶對象，包括角色信息

# 登入
@router.post("/login")
def login(user: schemas.LoginSchema, db: Session = Depends(get_db)):
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
@router.get("/users",response_model=List[UserRead])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    # 雖然這裡回傳的是包含 password 的 User 物件
    # 但 FastAPI 會根據 UserRead 自動幫你把 password 過濾掉！
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

    # 登出
@router.post("/logout")
def logout(current_user_id: int = Depends(get_current_user_id)):
# 這裡可以做 token 黑名單、紀錄登出時間等
    return {"message": "Logged out successfully"}