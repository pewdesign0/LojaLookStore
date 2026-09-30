"""Storefront extras: coupon validation and newsletter signup."""

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

from lib.db import db
from lib.pricing import COUPONS

router = APIRouter(tags=["storefront"])


class CouponIn(BaseModel):
    code: str


class CouponOut(BaseModel):
    valid: bool
    discount_pct: float
    message: str


@router.post("/coupons/validate", response_model=CouponOut)
async def validate_coupon(payload: CouponIn):
    code = payload.code.strip().upper()
    rate = COUPONS.get(code)
    if rate:
        return CouponOut(valid=True, discount_pct=rate * 100, message=f"Cupom {code} aplicado: {rate * 100:.0f}% de desconto!")
    return CouponOut(valid=False, discount_pct=0, message="Cupom inválido ou expirado.")


class NewsletterIn(BaseModel):
    email: EmailStr


class NewsletterOut(BaseModel):
    email: str
    message: str


@router.post("/newsletter", response_model=NewsletterOut, status_code=201)
async def subscribe_newsletter(payload: NewsletterIn):
    email = payload.email.lower()
    existing = await db.newsletter_subscribers.find_one({"email": email})
    if existing:
        return NewsletterOut(email=email, message="Você já faz parte do time #GBLovers!")
    await db.newsletter_subscribers.insert_one({"email": email})
    return NewsletterOut(
        email=email,
        message="Seja bem-vinda ao universo Gatabakana! Use o cupom GBVIP e ganhe 10% OFF na primeira compra.",
    )
