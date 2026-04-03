import uuid


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        response = self.get_response(request)
        response.headers["X-Request-Id"] = request.request_id
        return response
