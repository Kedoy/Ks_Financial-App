from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, status

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")