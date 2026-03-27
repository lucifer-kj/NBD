from ninja import Router

router = Router()

@router.post("/chat/", response={503: dict})
def chat(request):
    return 503, {"error": "Coming soon", "code": 503}
