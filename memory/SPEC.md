# gata-commerce — SPEC

Clone e-commerce da Gatabakana (moda feminina BR, baseado em gatabakana.com.br), em PT-BR, com fluxo de compra completo.

## Stack
FastAPI + motor (Mongo `app`) | Vite + React 19 + Tailwind v4 + shadcn (base-nova) | TanStack Query | Playfair Display + DM Sans.

## Data model (Mongo collections)
- `products` — id (uuid), slug (unique), name, reference, category (slug), line (Trendy/Glam/Superjeans/Basic/Beachwear/Mais Gata), price (SALE price), old_price (original, nullable), images[], colors[{name,hex}], sizes[{size,stock}], description, composition, flags: novidade/mais_vendida/destaque/trends/jeans, created_at
- `categories` — slug (unique), name, image, order (8 docs, incl. pseudo `novidades` e `outlet` tratadas no router por flag/old_price)
- `orders` — id (uuid), number `GB######` (unique), items[], customer{...}, payment_method (pix|credit_card), coupon_code, credit_card{holder,last4,installments}, subtotal, coupon_discount, pix_discount, shipping, total, status, estimated_delivery, created_at
- `newsletter_subscribers` — email (unique)

## API (todas sob /api)
- GET /catalog/categories
- GET /catalog/products?category&line&q&flag(novidade|mais_vendida|destaque|trends)&jeans&sort(relevance|newest|price_asc|price_desc)&limit
- GET /catalog/products/{slug}
- POST /orders (201) — preços SEMPRE recalculados no servidor a partir de products
- GET /orders/{id}
- POST /coupons/validate — só `GBVIP` (10%)
- POST /newsletter
- (template) GET/POST /status

## Regras de preço (backend/lib/pricing.py — espelhadas em frontend/src/lib/format.ts)
- GBVIP: 10% off subtotal (cupom inválido → 400 no POST /orders)
- PIX: 5% off após cupom
- Frete: grátis se subtotal pós-descontos ≥ R$499 E estado em SC,SP,PR,RS,MG,RJ; senão R$24,90
- Parcelamento: 6x sem juros

## Fluxos
Home (hero carousel, tiles, 4 vitrines, newsletter, SEO) → catálogo (/produtos, /categoria/:slug, /novidades, /outlet, /busca?q= com facetas client-side: tamanho/cor/linha/preço + sort server-side) → PDP (/produto/:slug: galeria, cor, tamanho, CEP simulado) → carrinho (context + localStorage, drawer Sheet + página, cupom) → checkout (dados, endereço, PIX com QR simulado / cartão 6x) → confirmação (/pedido/:id com chave PIX copiável).

## Seed
`cd /app/backend && python seed.py` — 30 produtos + 8 categorias (dropa e reinseri products/categories; idempotente).

## Auth
Não há login/contas — loja aberta, sem credenciais.
