# Midnight Bistro – Backend

Node.js (Express) API for the Midnight Bistro frontend.

## Folder structure

```
src/
  app.js
  server.js
  config/
  common/
    middlewares/
    utils/
    errors/
  modules/
    auth/
    users/
    categories/
    menu/
    orders/
  infrastructure/
    database/
    mail/
    cache/
  tests/
```

## Setup

1. **PostgreSQL** – Create a database (e.g. with `createdb midnight_bistro` or via psql).
2. **Env** – Copy `.env.example` to `.env` and set `DATABASE_URL` (default: `postgresql://localhost:5432/midnight_bistro`), plus `JWT_SECRET`, `ADMIN_SECRET` if needed.

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
```

Tables (`users`, `categories`, `menu_items`, `orders`, `reservations`) are created automatically on server start from `src/infrastructure/database/schema.sql`. If an existing `products` table is found, it is migrated into `categories` and `menu_items`.

## Run

```bash
npm run dev    # development with --watch
npm start      # production
```

Server runs at **http://localhost:3001** by default.

## API

### Health

| Method | Path     | Description   |
|--------|----------|---------------|
| GET    | `/health` | Health check |

### Auth

| Method | Path                 | Description        |
|--------|----------------------|--------------------|
| POST   | `/api/auth/register` | Register (email, password, name?) |
| POST   | `/api/auth/login`    | Login (email, password) → `{ user, token }` |

### Users

| Method | Path              | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/users`      | List users         |
| GET    | `/api/users/:id`  | Get user by id     |
| POST   | `/api/users`      | Create (email, password, name?) |
| PATCH  | `/api/users/:id`  | Update (name?, email?, password?) |
| DELETE | `/api/users/:id`  | Delete user        |

### Categories

| Method | Path                   | Description        |
|--------|------------------------|--------------------|
| GET    | `/api/categories`      | List categories    |
| GET    | `/api/categories/:id`  | Get category by id |

### Menu items

| Method | Path                      | Description        |
|--------|----------------------------|--------------------|
| GET    | `/api/menu-items`          | List menu items (optional `?categoryId=`) |
| GET    | `/api/menu-items/:id`      | Get menu item by id |

### Orders

| Method | Path               | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/orders`      | List orders        |
| GET    | `/api/orders/:id`  | Get order by id    |
| POST   | `/api/orders`      | Create (userId?, items[], tableNumber?, notes?) |
| PATCH  | `/api/orders/:id`  | Update (status?, items?) |

### Reservations

| Method | Path                      | Description        |
|--------|---------------------------|--------------------|
| GET    | `/api/reservations`       | List reservations   |
| GET    | `/api/reservations/:id`   | Get by id          |
| POST   | `/api/reservations`       | Create (name, email, phone, date, time, guests, occasion?, notes?) |

Data is stored in PostgreSQL.

### Admin dashboard

- **First admin:** Set `ADMIN_SECRET` in `.env`. In the admin UI at `/admin/login`, click “First time? Register as admin”, enter email, password, name, and the same `ADMIN_SECRET`. That account will have role `admin` and can sign in at `/admin`.
- **Admin APIs** (require `Authorization: Bearer <token>` and user role `admin`):
  - `GET /api/admin/me` – current user
  - `GET|POST|PATCH|DELETE /api/admin/categories` – categories CRUD
  - `GET|POST|PATCH|DELETE /api/admin/menu-items` – menu items CRUD
  - `GET /api/admin/orders` – list orders
  - `GET /api/admin/reservations` – list reservations
  - `GET /api/admin/users` – list users
