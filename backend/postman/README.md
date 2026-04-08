# Midnight Bistro – Postman API

Import the collection into Postman to call the backend API.

## Import

1. Open Postman.
2. **Import** → **Upload Files** → select `Midnight-Bistro-API.postman_collection.json`.
3. The collection **Midnight Bistro API** appears in the sidebar.

## Variables

- **baseUrl**: `http://localhost:3001` (change if your backend runs elsewhere).
- **token**: Leave empty; set it after logging in (see below).

## Admin requests (Bearer token)

1. Run **Auth → Login** with an admin email/password.
2. Copy the `token` from the response.
3. In the collection, open **Variables** and set **token** to that value (or use a test script to save it automatically).

All requests under **Admin** use `Authorization: Bearer {{token}}`.

## Folders

| Folder | Description |
|--------|-------------|
| Health | Server health check |
| Auth | Register, Login |
| Categories (public) | List / get categories |
| Menu items (public) | List / get menu items (optional `categoryId` query) |
| Orders | Orders CRUD |
| Reservations | List, get, create reservation |
| Users | Users CRUD |
| Gallery (public) | List / get gallery images |
| Admin | Admin-only endpoints (categories, menu items, gallery, upload, users/orders/reservations read) |

## Upload image (Admin)

**Admin → Upload image** uses **form-data** with key `image` and type **File**. Choose a file in Postman’s Body → form-data.
