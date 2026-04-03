from ninja import Router
from ninja.security import HttpBearer
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .schemas import UserOut, RegisterIn, LoginIn, TokenOut, UserAddressSchema, AddressCreateIn, GoogleAuthIn
from .models import CustomUser, UserAddress
from ninja.errors import HttpError
from typing import List

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


@router.get("/addresses/", response=List[UserAddressSchema], auth=AuthBearer())
def list_addresses(request):
    return UserAddress.objects.filter(user=request.auth).order_by("-is_default", "-created_at")


@router.post("/addresses/", response=UserAddressSchema, auth=AuthBearer())
def create_address(request, payload: AddressCreateIn):
    addr = UserAddress.objects.create(
        user=request.auth,
        label=payload.label,
        street=payload.street,
        city=payload.city,
        state=payload.state,
        pin_code=payload.pin_code,
        is_default=payload.is_default,
    )
    return addr


@router.post("/google/", response=TokenOut)
def google_auth(request, payload: GoogleAuthIn):
    if not getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", None):
        raise HttpError(503, "Google Sign-In is not configured on the server")

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
    except ImportError as e:
        raise HttpError(503, "Google auth library not installed") from e

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError:
        raise HttpError(401, "Invalid Google credential")

    email = (idinfo.get("email") or "").strip().lower()
    if not email:
        raise HttpError(400, "Google did not provide an email address")

    sub = idinfo.get("sub")
    first_name = (idinfo.get("given_name") or "").strip() or "User"
    last_name = (idinfo.get("family_name") or "").strip() or " "

    user = CustomUser.objects.filter(email__iexact=email).first()
    if user:
        if sub and user.google_sub and user.google_sub != sub:
            raise HttpError(400, "This email is linked to a different Google account")
        if sub and not user.google_sub:
            user.google_sub = sub
            user.save(update_fields=["google_sub"])
    else:
        user = CustomUser(
            email=email,
            first_name=first_name,
            last_name=last_name,
            google_sub=sub,
        )
        user.set_unusable_password()
        user.save()

    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
