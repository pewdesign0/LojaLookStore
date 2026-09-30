"""Catalog domain models: categories and products."""

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field


def _uuid() -> str:
    return str(uuid.uuid4())


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


class ColorVariant(BaseModel):
    name: str
    hex: str


class SizeStock(BaseModel):
    size: str
    stock: int = 0


class Product(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    reference: str = ""
    category: str
    line: str
    price: float
    old_price: float | None = None
    images: list[str] = []
    colors: list[ColorVariant] = []
    sizes: list[SizeStock] = []
    description: str = ""
    composition: str = ""
    novidade: bool = False
    mais_vendida: bool = False
    destaque: bool = False
    trends: bool = False
    jeans: bool = False
    created_at: datetime = Field(default_factory=_now_utc)


class Category(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    image: str = ""
    order: int = 0


class ProductCreate(BaseModel):
    name: str = Field(min_length=3)
    category: str
    price: float = Field(gt=0)
    old_price: float | None = None
    line: str = "Trendy"
    reference: str = ""
    images: list[str] = []
    colors: list[ColorVariant] = []
    sizes: list[SizeStock] = []
    description: str = ""
    composition: str = ""
    novidade: bool = False
    mais_vendida: bool = False
    destaque: bool = False
    trends: bool = False
    jeans: bool = False


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, gt=0)
    old_price: float | None = None
    line: str | None = None
    reference: str | None = None
    images: list[str] | None = None
    colors: list[ColorVariant] | None = None
    sizes: list[SizeStock] | None = None
    description: str | None = None
    composition: str | None = None
    novidade: bool | None = None
    mais_vendida: bool | None = None
    destaque: bool | None = None
    trends: bool | None = None
    jeans: bool | None = None
