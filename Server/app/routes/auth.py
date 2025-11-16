from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from ..models import UserCreate, Token, OTPVerify, LoginModel
from ..db import users_collection, otps_collection
from ..auth_utils import hash_password, verify_password, create_access_token, get_user_by_email, get_current_user
from ..email_utils import create_and_send_otp
from datetime import datetime
from bson.objectid import ObjectId
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    return {
        "email": user["email"],
        "role": user.get("role", "user")
    }

@router.post("/register")
async def register(user: UserCreate, background_tasks: BackgroundTasks):
    existing = await get_user_by_email(user.email)
    
    if existing:
   
        if existing.get("is_active") is False:
            raise HTTPException(status_code=400, detail="User exists but is not activated. Verify OTP.")
      
        raise HTTPException(status_code=400, detail="Email already registered")

   
    hashed = hash_password(user.password)
    res = await users_collection.insert_one({
        "email": user.email,
        "password": hashed,
        "role": "user",     # default role
        "is_active": False,
        "created_at": datetime.utcnow()
    })

    background_tasks.add_task(create_and_send_otp, user.email, "registration")
    return {"msg": "User created. An OTP has been sent to your email. Verify to activate."}


@router.post("/verify-otp")
async def verify_otp(payload: OTPVerify):
    email = payload.email
    otp = payload.otp
    purpose = payload.purpose

    record = await otps_collection.find_one({"email": email, "purpose": purpose})

    if not record:
        raise HTTPException(status_code=400, detail="No OTP request found")

    if record.get("otp") != otp or record.get("expires_at") < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

  
    if purpose == "registration":
        await users_collection.update_one({"email": email}, {"$set": {"is_active": True}})

    await otps_collection.delete_one({"email": email, "purpose": purpose})

    return {"msg": "OTP verified successfully."}



@router.post("/login", response_model=Token)
async def login(payload: LoginModel):
    email = payload.email
    password = payload.password

    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.get("is_active"):
        raise HTTPException(status_code=400, detail="Account is not active. Verify OTP.")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user.get("role", "user")})

    #return {"access_token": token, "token_type": "bearer"}
    response = JSONResponse({
        "access_token": token,
        "token_type": "bearer",
        "msg": "Login successful",
        "role": user.get("role", "user")
    })
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,    
        samesite="Lax",
        max_age=60*60
    )
    return response

@router.post("/request-reset")
async def request_reset(email: str, background_tasks: BackgroundTasks):
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=400, detail="If account exists, an OTP will be sent")  
    background_tasks.add_task(create_and_send_otp, email, "reset")
    return {"msg": "If account exists, an OTP will be sent to the registered email."}

@router.post("/reset-password")
async def reset_password(email: str, otp: str, new_password: str):
    record = await otps_collection.find_one({"email": email, "purpose": "reset"})
    if not record or record.get("otp") != otp or record.get("expires_at") < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    hashed = hash_password(new_password)
    await users_collection.update_one({"email": email}, {"$set": {"password": hashed}})
    await otps_collection.delete_one({"email": email, "purpose": "reset"})
    return {"msg": "Password reset successful."}

@router.post("/change-password")
async def change_password(current_password: str, new_password: str, user=Depends(lambda: None)):
   
    raise HTTPException(status_code=501, detail="Use /auth/change-password-auth for logged in users")


@router.post("/logout")
async def logout():
    response = JSONResponse({"msg": "Logged out"})
    response.delete_cookie("access_token")
    return response
