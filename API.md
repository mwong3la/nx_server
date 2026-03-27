# Nexbridge API reference

Base URL (default local server):

```text
http://localhost:4000
```

All JSON APIs expect `Content-Type: application/json` unless noted.

---

## Authentication

Only **staff with the `admin` role** can sign in. **Customers** (people receiving shipments) do **not** get accounts; they only use a **tracking number** on the public endpoints.

### Bearer token

After login, send the JWT on protected routes:

```http
Authorization: Bearer <access_token>
```

---

## First admin (bootstrap)

On first database sync, the server seeds **one admin** if no user exists with the configured email.

Set these environment variables before starting the app (optional):

| Variable | Default |
|----------|---------|
| `SEED_ADMIN_EMAIL` | `admin@nexbridge.local` |
| `SEED_DEFAULT_PASSWORD` | `ChangeMe123!` |

Check server logs for: `Seeded admin user: ...`

**Change the password** in production (e.g. log in and add a new admin, then deactivate the seed account if you implement that later).

---

## Creating additional admins (API)

You must already be logged in as an admin.

**Endpoint:** `POST /api/v1/admin/admins`

**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**

| Field | Required | Description |
|-------|----------|-------------|
| `email` | Yes | Login email (stored lowercased). |
| `password` | Yes | Password for the new admin. |
| `name` | No | Display name (defaults to part of email before `@`). |
| `phone` | No | Phone string. |

**Example:**

```bash
curl -s -X POST http://localhost:4000/api/v1/admin/admins \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"ops@example.com","password":"SecurePass1!","name":"Operations"}'
```

**Response:** `201` with `id`, `email`, `name`, `role`, `phone`, `createdAt`.

---

## Endpoints overview

| Area | Method | Path |
|------|--------|------|
| Health | GET | `/` |
| Auth | POST | `/api/v1/auth/login` |
| Auth | POST | `/api/v1/auth/signup` *(disabled)* |
| Auth | POST | `/api/v1/auth/logout` |
| Auth | GET | `/api/v1/auth/me` *(requires Bearer)* |
| Staff | GET | `/api/v1/users` *(admin)* |
| Staff | GET | `/api/v1/users/:id` *(admin)* |
| Public tracking | GET | `/api/v1/public/tracking` |
| Public tracking | GET | `/api/v1/public/tracking/:trackingNumber` |
| Admin | POST | `/api/v1/admin/customers` |
| Admin | GET | `/api/v1/admin/customers` |
| Admin | GET | `/api/v1/admin/customers/:id` |
| Admin | PATCH | `/api/v1/admin/customers/:id` |
| Admin | POST | `/api/v1/admin/admins` |
| Admin | GET | `/api/v1/admin/shipments` |
| Admin | POST | `/api/v1/admin/shipments` |
| Admin | PATCH | `/api/v1/admin/shipments/:id` |

---

## Auth routes

### `POST /api/v1/auth/login`

**Body:**

```json
{ "email": "admin@nexbridge.local", "password": "ChangeMe123!" }
```

**Response:** `user`, `token`, `expiresAt`.

Non-admin accounts (if any exist in the DB) receive `403` — only admins may sign in.

---

### `POST /api/v1/auth/signup`

Always returns `403` — public registration is disabled.

---

### `POST /api/v1/auth/logout`

No body required. Returns `{ "ok": true }` (client discards the token).

---

### `GET /api/v1/auth/me`

**Headers:** `Authorization: Bearer <token>`

Returns the current admin user.

---

## Staff user listing (admin)

### `GET /api/v1/users`

**Headers:** `Authorization: Bearer <token>`

**Query:** `page`, `limit` (optional pagination).

**Response:** `{ "users": [...], "total": number }` — admin accounts only.

---

### `GET /api/v1/users/:id`

**Headers:** `Authorization: Bearer <token>`

Returns one admin by `id`, or `404`.

---

## Public tracking (no auth)

Anyone with a **tracking number** can check status — no login.

### `GET /api/v1/public/tracking`

**Query (one of):**

- `number` — e.g. `NB-XXXXXXXX`
- `q` — same
- `tracking` — same

You can paste the code with or without the `NB-` prefix (8 characters after the prefix are stored in the system).

**Example:**

```text
GET /api/v1/public/tracking?number=NB-A1B2C3D4
```

---

### `GET /api/v1/public/tracking/:trackingNumber`

Same lookup as a path segment (useful for shareable links).

**Example:**

```text
GET /api/v1/public/tracking/NB-A1B2C3D4
```

---

### Public response shape

Typical JSON fields:

| Field | Description |
|-------|-------------|
| `trackingNumber` | Unique code (e.g. `NB-...`). |
| `title` | Shipment title. |
| `description` | Optional details. |
| `status` | Machine-readable status (see below). |
| `statusLabel` | Short human-readable label. |
| `progressNote` | Latest note from admin. |
| `currentLocation` | Where the shipment is (e.g. city, hub). |
| `lastUpdated` | ISO timestamp. |

---

## Admin — customers

Customers are **records without passwords** (name/contact). Assign shipments to them via `customerId`. One customer can have many shipments.

All routes below require admin Bearer token.

### `POST /api/v1/admin/customers`

**Body:**

```json
{ "name": "Jane Doe", "email": "jane@example.com", "phone": "+254700000000" }
```

`name` is required; `email` and `phone` are optional.

---

### `GET /api/v1/admin/customers`

**Query:** `page`, `limit` (optional).

---

### `GET /api/v1/admin/customers/:id`

Returns one customer.

---

### `PATCH /api/v1/admin/customers/:id`

**Body (any fields to update):** `name`, `email`, `phone`.

---

## Admin — shipments

All routes require admin Bearer token.

### `GET /api/v1/admin/shipments`

**Query:**

| Param | Description |
|-------|-------------|
| `page`, `limit` | Pagination. |
| `customerId` | Filter shipments for one customer. |

---

### `POST /api/v1/admin/shipments`

Creates a shipment and assigns a new **unique** `trackingNumber` automatically.

**Body:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Short label. |
| `description` | No | Longer text. |
| `customerId` | No | UUID of a customer (optional). |
| `status` | No | One of `ShipmentStatus` values (default `pending`). |

---

### `PATCH /api/v1/admin/shipments/:id`

**Body (optional fields):**

| Field | Description |
|-------|-------------|
| `status` | See enum below. |
| `progressNote` | Text update visible on public tracking. |
| `currentLocation` | Where the shipment has reached. |
| `title` | Update title. |
| `description` | Update description. |
| `customerId` | Assign or reassign customer. |

---

### Shipment `status` values

Use these string values in JSON:

- `pending`
- `processing`
- `packed`
- `shipped`
- `in_transit`
- `delivered`
- `cancelled`

---

## Error responses

Common patterns:

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation. |
| `401` | Missing or invalid token. |
| `403` | Forbidden (e.g. not admin). |
| `404` | Resource not found. |
| `500` | Server error. |

---

## Environment variables (summary)

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `4000`). |
| `JWT_SECRET` | Secret for signing tokens (set in production). |
| `SEED_ADMIN_EMAIL` | Email for first seeded admin. |
| `SEED_DEFAULT_PASSWORD` | Password for first seeded admin. |
| Database vars | See `src/database/config/config.ts` for Postgres connection. |
