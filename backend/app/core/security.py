import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
import jwt  # PyJWT
from .config import settings

def get_password_hash(password: str) -> str:
    """Хэширование пароля с солью"""
    salt = secrets.token_hex(16)
    if len(password) > 72:
        password = password[:72]
    hash_obj = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${hash_obj.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    if not hashed_password or '$' not in hashed_password:
        return False
    salt, stored_hash = hashed_password.split('$', 1)
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    hash_obj = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return secrets.compare_digest(hash_obj.hex(), stored_hash)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # PyJWT требует строку для ключа
    encoded_jwt = jwt.encode(to_encode, str(settings.SECRET_KEY), algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Верификация JWT токена"""
    try:
        # PyJWT требует строку для ключа
        payload = jwt.decode(token, str(settings.SECRET_KEY), algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None