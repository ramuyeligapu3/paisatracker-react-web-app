from backend.app.common.utils import *
from backend.app.core.config import settings
from backend.app.core.security import verify_refresh_token
from backend.app.core.email import send_email_async, render_welcome_html
from .schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest, ProfileUpdate
from .service import AuthService
from .repository import UserRepository

auth_router = APIRouter()

def get_auth_service():
    return AuthService(UserRepository())


@auth_router.get("/me")
async def get_me(current_user: str = Depends(get_current_user), service: AuthService = Depends(get_auth_service)):
    user = await service.repo.get_by_id(current_user)
    if not user:
        raise AppException(message="User not found", status_code=404)
    return ORJSONResponse(
        status_code=200,
        content=response(
            True,
            {"email": user.email, "display_name": user.display_name or "", "currency": user.currency or "INR"},
            "Profile fetched",
        ),
    )


@auth_router.patch("/profile")
async def update_profile(
    body: ProfileUpdate,
    current_user: str = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    user = await service.repo.get_by_id(current_user)
    if not user:
        raise AppException(message="User not found", status_code=404)
    await service.repo.update_profile(user, display_name=body.display_name, currency=body.currency)
    return ORJSONResponse(status_code=200, content=response(True, None, "Profile updated"))

@auth_router.post("/signup")
async def signup(user: UserCreate, service: AuthService = Depends(get_auth_service)):
    await service.register(user)
    login_url = f"{settings.FRONTEND_URL.rstrip('/')}/login"
    welcome_html = render_welcome_html(user.email, settings.APP_NAME, login_url)
    await send_email_async(user.email, f"Welcome to {settings.APP_NAME}", welcome_html)
    return ORJSONResponse(
        status_code=200,
        content=response(True, None, "User created successfully")
    )

   
@auth_router.post("/login")
async def login(credentials: UserLogin, service: AuthService = Depends(get_auth_service)):
    user = await service.authenticate(credentials)
    res=ORJSONResponse(status_code=200, content=response(True, {"userId":user.get("userId"),"accessToken":user.get("accessToken")}, "Login Successful"))
    # Use secure=False when frontend is localhost so cookie is sent over HTTP
    is_local = "localhost" in settings.FRONTEND_URL or "127.0.0.1" in settings.FRONTEND_URL
    res.set_cookie(
            key="refreshToken",
            value=user["refreshToken"],
            httponly=True,
            secure=not is_local,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,  # 7 days
        )
    return res

@auth_router.post("/refresh")
async def refresh_token(request: Request):
    refresh_token_val = request.cookies.get("refreshToken")
    if not refresh_token_val:
        raise AppException(message="Refresh token missing", status_code=401)
    payload = verify_refresh_token(refresh_token_val)
    user_id = payload.get("sub")
    if not user_id:
        raise AppException(message="Invalid token", status_code=401)
    new_access_token = create_access_token(data={"sub": user_id})
    return ORJSONResponse(
        status_code=200,
        content=response(True, {"accessToken": new_access_token}, "Token refreshed"),
    )


@auth_router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    await service.forgot_password(body.email)
    return ORJSONResponse(
        status_code=200,
        content=response(True, message="If an account exists with this email, you will receive a reset link.")
    )


@auth_router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    await service.reset_password(body.token, body.new_password)
    return ORJSONResponse(
        status_code=200,
        content=response(True, message="Password has been reset. You can sign in with your new password.")
    )

    