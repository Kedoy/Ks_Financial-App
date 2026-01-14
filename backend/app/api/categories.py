# Добавь в начало файла
from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, status

# Определи oauth2_scheme локально
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")