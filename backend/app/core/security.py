from jose import jwt,JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

SECRET_KEY = "YOUR_SECRET_KEY"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user_id(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")