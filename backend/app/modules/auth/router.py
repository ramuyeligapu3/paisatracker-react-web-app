from backend.app.common.utils import *
from .schemas import UserCreate, UserLogin
from .service import AuthService
from .repository import UserRepository
from backend.app.models.models import TransactionModel

auth_router = APIRouter()

def get_auth_service():
    return AuthService(UserRepository())

@auth_router.post("/signup")
async def signup(user: UserCreate, service: AuthService = Depends(get_auth_service)):
    res= await service.register(user)
    print(res,'(((((((((((((((((((((((((((((((signup)))))))))))))))))))))))))))))))')

    return ORJSONResponse(
        status_code=200,
        content=response(True,None, "User created successfull")
    )

   
@auth_router.post("/login")
async def login(credentials: UserLogin, service: AuthService = Depends(get_auth_service)):
    user = await service.authenticate(credentials)
    res=ORJSONResponse(status_code=200, content=response(True, {"userId":user.get("userId"),"accessToken":user.get("accessToken")}, "Login Successful"))
    res.set_cookie(
            key="refreshToken",
            value=user["refreshToken"],
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=60*60*24*7,  # 7 days
        )
    return res

@auth_router.post("/refresh")
async def refresh_token(request: Request):
    refresh_token = request.cookies.get("refreshToken")

    print("((((((((((((((((((((refresh_token))))))))))))))))))))",refresh_token)

    if not refresh_token:
        raise AppException(message="Refresh token missing",status_code=401,)
    payload = verify_token(refresh_token)  # ✅ Validate refresh token
    user_id = payload.get("sub")

    if not user_id:
        raise AppException(message="Invalid token",status_code=401)

    new_access_token = create_access_token(
        data={"sub": user_id}
    )
    print("((((((((((((((((((((((new_access_token))))))))))))))))))))))",new_access_token)

    return ORJSONResponse(
        status_code=200,
        content=response(True, {"accessToken": new_access_token}, "Token refreshed")
    )



# @auth_router.get("/transactionsall")
# async def get_all_transactions_by_category():
#     uid = ObjectId("6882555894e15b6c9794d489")

    