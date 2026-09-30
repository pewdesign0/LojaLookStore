"""Store pricing rules: coupons, PIX discount, shipping thresholds. Single source of truth."""

from datetime import datetime, timedelta, timezone

FREE_SHIPPING_THRESHOLD = 499.00
FREE_SHIPPING_STATES = {"SC", "SP", "PR", "RS", "MG", "RJ"}
STANDARD_SHIPPING = 24.90
PIX_DISCOUNT_RATE = 0.05
COUPONS: dict[str, float] = {"GBVIP": 0.10}


def coupon_rate(code: str | None) -> float | None:
    """Discount rate for a coupon code. None = invalid/unknown code; 0.0 = no code."""
    if not code:
        return 0.0
    return COUPONS.get(code.strip().upper())


def shipping_for(subtotal: float, state: str | None) -> float:
    """Free above the threshold for Sul/Sudeste regions, else the flat standard fee."""
    if subtotal >= FREE_SHIPPING_THRESHOLD and (state or "").upper() in FREE_SHIPPING_STATES:
        return 0.0
    return STANDARD_SHIPPING


def estimated_delivery(days: int = 7) -> str:
    """Delivery estimate anchored on the server clock (pod is UTC)."""
    return (datetime.now(timezone.utc) + timedelta(days=days)).strftime("%d/%m/%Y")
