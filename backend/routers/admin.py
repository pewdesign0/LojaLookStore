"""Admin routes: cookie-based login + product CRUD for the /admin panel."""

import hashlib
import os
import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from pymongo import ReturnDocument

from lib.db import db
from models.catalog import Product, ProductCreate, ProductUpdate
from routers.catalog import product_from_doc

router = APIRouter(prefix="/admin", tags=["admin"])

COOKIE_NAME = "gata_admin"


def _token() -> str:
    return hashlib.sha256(f"gata-admin::{os.environ.get('ADMIN_PASSWORD', '')}".encode()).hexdigest()


def require_admin(request: Request) -> None:
    if request.cookies.get(COOKIE_NAME) != _token():
        raise HTTPException(status_code=401, detail="Não autorizado")


def slugify(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-") or "produto"


class AdminLoginIn(BaseModel):
    password: str


@router.post("/login")
async def admin_login(payload: AdminLoginIn, response: Response):
    if payload.password != os.environ.get("ADMIN_PASSWORD", ""):
        raise HTTPException(status_code=401, detail="Senha incorreta")
    response.set_cookie(
        COOKIE_NAME, _token(), httponly=True, samesite="lax", max_age=60 * 60 * 24 * 7
    )
    return {"ok": True}


@router.get("/me")
async def admin_me(request: Request):
    return {"authenticated": request.cookies.get(COOKIE_NAME) == _token()}


@router.post("/logout")
async def admin_logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}


@router.get("/products", response_model=list[Product])
async def admin_list_products(_: None = Depends(require_admin)):
    docs = await db.products.find().sort("created_at", -1).to_list(500)
    return [product_from_doc(doc) for doc in docs]


@router.post("/products", response_model=Product, status_code=201)
async def admin_create_product(payload: ProductCreate, _: None = Depends(require_admin)):
    data = payload.model_dump()
    base_slug = slugify(payload.name)
    slug, n = base_slug, 2
    while await db.products.find_one({"slug": slug}):
        slug = f"{base_slug}-{n}"
        n += 1
    product = Product(**data, slug=slug)
    await db.products.insert_one(product.model_dump())
    return product


@router.patch("/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, payload: ProductUpdate, _: None = Depends(require_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nada para atualizar")
    doc = await db.products.find_one_and_update(
        {"id": product_id}, {"$set": updates}, return_document=ReturnDocument.AFTER
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product_from_doc(doc)


@router.delete("/products/{product_id}", status_code=204)
async def admin_delete_product(product_id: str, _: None = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return None
