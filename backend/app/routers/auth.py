from fastapi import Depends, HTTPException, APIRouter
# from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User
# from fastapi.security import HTTPBearer
from app.core.security import SECRET_KEY, ALGORITHM # 你的 JWT secret/algorithm
from app import schemas

router = APIRouter(prefix="/auth", tags=["auth"])
# 密碼加密設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# 註冊
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_pwd = pwd_context.hash(user.password)
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

# 使用JWT回傳當前用戶的 ID，供其他 API 使用
# security = HTTPBearer()

# def get_current_user_id(token=Depends(security)) -> int:
#     """
#     從 JWT token 解析 user_id
#     """
#     try:
#         payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = int(payload.get("sub"))
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token: no user id")
#         return user_id
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")