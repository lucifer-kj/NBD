from ninja import Router
from ninja.security import HttpBearer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .schemas import UserOut, RegisterIn, LoginIn, TokenOut
from .models import CustomUser
from ninja.errors import HttpError

router = Router()

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except (InvalidToken, TokenError):
            return None

@router.post("/register/", response={201: UserOut})
def register(request, payload: RegisterIn):
    if CustomUser.objects.filter(email=payload.email).exists():
        raise HttpError(400, "Email already registered")
    user = CustomUser.objects.create(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number
    )
    user.set_password(payload.password)
    user.save()
    return 201, user

@router.post("/login/", response=TokenOut)
def login(request, payload: LoginIn):
    user = authenticate(request, email=payload.email, password=payload.password)
    if not user:
        raise HttpError(401, "Invalid credentials")
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}

@router.get("/me/", response=UserOut, auth=AuthBearer())
def me(request):
    return request.auth
