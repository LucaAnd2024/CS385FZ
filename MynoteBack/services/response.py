from typing import Any, Optional


def success(data: Any = None, message: str = "ok", code: int = 0):
    return {"code": code, "message": message, "data": data}


def error(message: str = "error", code: int = 1, data: Optional[Any] = None):
    return {"code": code, "message": message, "data": data}
