"""Order routes: create (with server-side pricing) and read one order."""

import random

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from lib.db import db
from lib.pricing import coupon_rate, estimated_delivery, shipping_for, PIX_DISCOUNT_RATE
from models.orders import Order, OrderCreate, OrderItemOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=Order, status_code=201)
async def create_order(payload: OrderCreate):
    # Never trust client prices: recompute every line from the stored product.
    ids = [item.product_id for item in payload.items]
    docs = await db.products.find({"id": {"$in": ids}}).to_list(100)
    by_id = {doc["id"]: doc for doc in docs}

    items_out: list[OrderItemOut] = []
    for item in payload.items:
        doc = by_id.get(item.product_id)
        if not doc:
            raise HTTPException(status_code=400, detail=f"Produto indisponível: {item.name}")
        price = round(float(doc["price"]), 2)
        line = item.model_dump() | {"price": price, "line_total": round(price * item.quantity, 2)}
        items_out.append(OrderItemOut(**line))

    subtotal = round(sum(item.line_total for item in items_out), 2)

    coupon_code = (payload.coupon_code or "").strip().upper() or None
    rate = coupon_rate(coupon_code)
    if rate is None:
        raise HTTPException(status_code=400, detail="Cupom inválido ou expirado")
    coupon_discount = round(subtotal * rate, 2)

    after_coupon = subtotal - coupon_discount
    pix_discount = round(after_coupon * PIX_DISCOUNT_RATE, 2) if payload.payment_method == "pix" else 0.0
    shipping = shipping_for(after_coupon - pix_discount, payload.customer.state)
    total = round(after_coupon - pix_discount + shipping, 2)

    now = datetime.now(timezone.utc)
    order = Order(
        number=f"GB{random.randint(100000, 999999)}",
        items=items_out,
        customer=payload.customer,
        payment_method=payload.payment_method,
        coupon_code=coupon_code if rate else None,
        credit_card=payload.credit_card if payload.payment_method == "credit_card" else None,
        subtotal=subtotal,
        coupon_discount=coupon_discount,
        pix_discount=pix_discount,
        shipping=shipping,
        total=total,
        estimated_delivery=estimated_delivery(),
        created_at=now,
    )
    await db.orders.insert_one(order.model_dump())
    return order


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
    return Order(**doc)
