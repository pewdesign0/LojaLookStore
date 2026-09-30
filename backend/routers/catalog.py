"""Catalog routes: categories and product listing/detail."""

import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.catalog import Category, Product

router = APIRouter(prefix="/catalog", tags=["catalog"])

# Pseudo-categories the storefront exposes as links but don't exist as documents.
PSEUDO_CATEGORIES = {"novidades": {"novidade": True}, "outlet": {"old_price": {"$ne": None}}}

SORTS: dict[str, list[tuple]] = {
    "relevance": [("mais_vendida", -1), ("created_at", -1)],
    "newest": [("created_at", -1)],
    "price_asc": [("price", 1)],
    "price_desc": [("price", -1)],
}


def product_from_doc(doc: dict) -> Product:
    # Motor hands back naive datetimes — normalise to aware UTC before Pydantic serialises.
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
    return Product(**doc)


@router.get("/categories", response_model=list[Category])
async def list_categories():
    docs = await db.categories.find().sort("order", 1).to_list(100)
    return [Category(**doc) for doc in docs]


@router.get("/products", response_model=list[Product])
async def list_products(
    category: str | None = None,
    line: str | None = None,
    q: str | None = None,
    flag: str | None = Query(default=None, description="novidade|mais_vendida|destaque|trends"),
    jeans: bool = False,
    sort: str = "relevance",
    limit: int = Query(default=60, ge=1, le=200),
):
    query: dict = {}
    if category:
        if category in PSEUDO_CATEGORIES:
            query.update(PSEUDO_CATEGORIES[category])
        else:
            query["category"] = category
    if line:
        query["line"] = line
    if q:
        query["name"] = {"$regex": re.escape(q.strip()), "$options": "i"}
    if flag in {"novidade", "mais_vendida", "destaque", "trends"}:
        query[flag] = True
    if jeans:
        query["jeans"] = True

    docs = await db.products.find(query).sort(SORTS.get(sort, SORTS["relevance"])).to_list(limit)
    return [product_from_doc(doc) for doc in docs]


@router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product_from_doc(doc)
