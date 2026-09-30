"""Order domain models."""

import uuid
from datetime import datetime, timezone

from email_validator import validate_email  # noqa: F401  (EmailStr needs it installed)
from pydantic import BaseModel, EmailStr, Field
from typing import Literal


def _uuid() -> str:
    return str(uuid.uuid4())


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


class OrderItem(BaseModel):
    product_id: str
    slug: str
    name: str
    size: str
    color: str
    image: str = ""
    price: float
    quantity: int = Field(default=1, ge=1)


class CustomerInfo(BaseModel):
    name: str = Field(min_length=3)
    email: EmailStr
    phone: str = ""
    cpf: str = ""
    cep: str = ""
    street: str = ""
    number: str = ""
    complement: str = ""
    district: str = ""
    city: str = ""
    state: str = ""


class CreditCardInfo(BaseModel):
    holder: str = ""
    last4: str = ""
    installments: int = Field(default=1, ge=1, le=6)


class OrderCreate(BaseModel):
    items: list[OrderItem] = Field(min_length=1)
    customer: CustomerInfo
    payment_method: Literal["pix", "credit_card"]
    coupon_code: str | None = None
    credit_card: CreditCardInfo | None = None


class OrderItemOut(OrderItem):
    line_total: float = 0


class Order(BaseModel):
    id: str = Field(default_factory=_uuid)
    number: str = ""
    items: list[OrderItemOut] = []
    customer: CustomerInfo
    payment_method: str
    coupon_code: str | None = None
    credit_card: CreditCardInfo | None = None
    subtotal: float = 0
    coupon_discount: float = 0
    pix_discount: float = 0
    shipping: float = 0
    total: float = 0
    status: str = "confirmado"
    estimated_delivery: str = ""
    created_at: datetime = Field(default_factory=_now_utc)
