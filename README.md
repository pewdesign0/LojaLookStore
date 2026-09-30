# Loja Look Store

E-commerce de moda feminina completo — vitrine, catálogo, carrinho, checkout e painel
administrativo. Projeto full-stack com **FastAPI + MongoDB** no backend e
**React 19 + Vite + TypeScript + Tailwind CSS v4** no frontend, com interface em
português (pt-BR) e preços em real.

> Projeto demonstrativo, criado para fins de estudo. O checkout é simulado —
> nenhum pagamento real é processado e nenhum dado de cartão é armazenado.

---

## Funcionalidades

**Loja**
- Home com barra de avisos rotativa, carrossel editorial, tiles de categoria e quatro
  vitrines de produtos (Mais Vendidas, Coleção Jeans, Destaque e Trends)
- Catálogo com filtros de tamanho, cor, linha e faixa de preço, além de ordenação
  (mais vendidos, lançamentos, menor e maior preço)
- Página de produto com galeria, seleção de cor e tamanho, cálculo de frete por CEP e
  abas de descrição, composição e trocas
- Busca com sugestões ao vivo (miniatura + preço enquanto você digita)
- Lista de favoritos com contador no cabeçalho, persistida no navegador
- Sacola em drawer lateral e página completa, com medidor de frete grátis
- Checkout com dados pessoais, endereço, PIX (5% de desconto) ou cartão em até 6x
- Confirmação do pedido com número, previsão de entrega e chave PIX copiável
- Cupom de desconto, newsletter, banner de cookies (LGPD) e botão de WhatsApp

**Painel administrativo** (`/admin`)
- Login por senha com sessão em cookie `httpOnly`
- Cadastro, edição e exclusão de produtos
- Controle de quais vitrines da home exibem cada produto

**Regras de negócio** (centralizadas em `backend/lib/pricing.py`)
- Cupom `GBVIP`: 10% de desconto no subtotal
- PIX: 5% de desconto aplicado após o cupom
- Frete grátis acima de R$ 499 para SC, SP, PR, RS, MG e RJ; senão R$ 24,90
- Parcelamento em até 6x sem juros

Os preços são **sempre recalculados no servidor** a partir do banco de dados no momento
em que o pedido é criado — valores enviados pelo navegador nunca são confiados.

---

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | FastAPI, Motor (MongoDB async), Pydantic v2, Uvicorn |
| Frontend | React 19, Vite, TypeScript (strict), Tailwind CSS v4, shadcn/ui, TanStack Query, React Router, Motion |
| Banco | MongoDB |
| Tipografia | Playfair Display + DM Sans (via `@fontsource`) |

Requisitos: **Node 20+** (desenvolvido no 24), **Python 3.11+** e uma instância de
**MongoDB** acessível.

---

## Instalação

```bash
git clone https://github.com/pewdesign0/LojaLookStore.git
cd LojaLookStore
```

### 1. Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # depois edite os valores
```

Preencha o `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="app"
CORS_ORIGINS="*"
ADMIN_PASSWORD="escolha-uma-senha"
```

Popule o catálogo (30 produtos e 8 categorias). O script é idempotente — pode rodar
novamente sempre que quiser restaurar os dados iniciais:

```bash
python seed.py
```

Suba a API:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

A documentação interativa fica em `http://localhost:8001/docs`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
yarn install
yarn dev
```

A loja abre em **http://localhost:3000**. O Vite encaminha `/api/*` para a porta 8001,
então o frontend usa apenas caminhos relativos — não há URL de backend fixa no código.

### 3. Acesso ao painel

Abra `http://localhost:3000/admin` e entre com a senha definida em `ADMIN_PASSWORD`.

---

## Comandos

**Frontend** (dentro de `frontend/`)

```bash
yarn dev          # servidor de desenvolvimento
yarn build        # build de produção em dist/
yarn typecheck    # checagem de tipos do TypeScript
yarn lint         # análise estática (oxlint)
```

**Backend** (dentro de `backend/`)

```bash
uvicorn server:app --reload --port 8001   # servidor de desenvolvimento
python seed.py                            # recria o catálogo
pytest                                    # testes da API
```

---

## Estrutura

```
backend/
  server.py          bootstrap do FastAPI; monta o router /api
  seed.py            popula produtos e categorias
  lib/
    db.py            cliente MongoDB compartilhado e índices
    pricing.py       cupons, desconto PIX e regras de frete
    dates.py         datas ancoradas no servidor
  models/            modelos Pydantic (catálogo e pedidos)
  routers/           catalog, orders, misc e admin
  tests/             testes com pytest

frontend/
  src/
    App.tsx          tabela de rotas
    pages/           Home, Catalog, ProductDetail, Cart, Checkout,
                     OrderSuccess, Favorites, Admin, NotFound
    components/
      layout/        cabeçalho, rodapé, sacola, busca e avisos
      home/          carrossel, tiles e newsletter
      product/       card e carrossel de produtos
      ui/            componentes shadcn/ui
    lib/
      api.ts         camada de fetch tipada sobre /api
      cart.tsx       estado da sacola (context + localStorage)
      favorites.tsx  estado dos favoritos
      format.ts      formatação em BRL e constantes de preço
      types.ts       interfaces que espelham os modelos Pydantic
    index.css        tema Tailwind, fontes e animações
```

Toda rota do backend vive sob o prefixo `/api`, e o frontend a consome por caminho
relativo através da camada em `src/lib/api.ts`.

---

## API

Todos os endpoints usam o prefixo `/api`.

### Catálogo

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/catalog/categories` | Lista as categorias |
| `GET` | `/catalog/products` | Lista produtos com filtros |
| `GET` | `/catalog/products/{slug}` | Detalhe de um produto |

Parâmetros de `/catalog/products`: `category`, `line`, `q`, `jeans`, `limit`,
`flag` (`novidade`, `mais_vendida`, `destaque` ou `trends`) e
`sort` (`relevance`, `newest`, `price_asc` ou `price_desc`).

### Pedidos e loja

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/orders` | Cria o pedido e recalcula os preços no servidor |
| `GET` | `/orders/{id}` | Consulta um pedido |
| `POST` | `/coupons/validate` | Valida um cupom |
| `POST` | `/newsletter` | Inscreve um e-mail |

### Administração

Exigem o cookie de sessão; sem ele a resposta é `401`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/admin/login` | Autentica e define o cookie |
| `GET` | `/admin/me` | Informa se a sessão é válida |
| `POST` | `/admin/logout` | Encerra a sessão |
| `GET` | `/admin/products` | Lista todos os produtos |
| `POST` | `/admin/products` | Cria um produto |
| `PATCH` | `/admin/products/{id}` | Atualiza um produto |
| `DELETE` | `/admin/products/{id}` | Remove um produto |

---

## Rotas da loja

| Caminho | Tela |
|---|---|
| `/` | Home |
| `/produtos` | Todos os produtos |
| `/categoria/:slug` | Produtos de uma categoria |
| `/novidades` | Lançamentos |
| `/outlet` | Peças com desconto |
| `/busca?q=` | Resultados da busca |
| `/produto/:slug` | Detalhe do produto |
| `/favoritos` | Lista de desejos |
| `/carrinho` | Sacola |
| `/checkout` | Finalização |
| `/pedido/:id` | Confirmação |
| `/admin` | Painel administrativo |

---

## Segurança

- O `backend/.env` **não** é versionado. Use o `backend/.env.example` como modelo.
- Troque o `ADMIN_PASSWORD` antes de publicar a loja.
- Em produção, defina `CORS_ORIGINS` com o domínio real em vez de `*`.
- O checkout é uma simulação: não há integração com adquirente e nenhum dado de
  cartão é persistido.
