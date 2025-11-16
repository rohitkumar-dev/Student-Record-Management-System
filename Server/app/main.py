from fastapi import FastAPI, Depends, HTTPException
from .routes import auth as auth_router, students as students_router
from .auth_utils import get_current_user
from .config import settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Student Record Management")

# CORS setub
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(students_router.router)


from .auth_utils import verify_password, hash_password
from .db import users_collection

@app.post("/auth/change-password-auth")
async def change_password_auth(current_password: str, new_password: str, user=Depends(get_current_user)):

    if not verify_password(current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    hashed = hash_password(new_password)
    await users_collection.update_one({"_id": user["_id"]}, {"$set": {"password": hashed}})
    return {"msg": "Password changed successfully"}

