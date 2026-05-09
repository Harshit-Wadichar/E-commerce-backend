# 🖥️ E-Commerce Backend

A robust, production-ready REST API backend built with **Node.js**, **Express 5**, and **TypeScript**. It powers the e-commerce platform with features including product management, order processing, Stripe payments, coupon/discount handling, Redis caching, and Cloudinary image storage.

---

## 📦 Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MongoDB (via Mongoose ODM) |
| Cache | Redis (via ioredis) |
| Image Storage | Cloudinary |
| Payments | Stripe |
| File Uploads | Multer |
| Authentication | Firebase UID (stateless) |
| HTTP Logging | Morgan |
| Env Config | dotenv |
| Validation | validator |
| ID Generation | uuid |
| Dev Runner | tsx (watch mode) |

---

## 📁 Project Structure

```
src/
├── app.ts                   # Entry point — Express setup, middleware, routes, DB connections
│
├── controllers/             # Business logic handlers
│   ├── user.ts              # Register, get user, get all users, delete user
│   ├── product.ts           # Product CRUD, search/filter, categories, reviews
│   ├── order.ts             # Order creation, listing, processing, deletion
│   ├── payment.ts           # Stripe payment intent, coupon management
│   └── stats.ts             # Admin dashboard analytics & statistics
│
├── routes/                  # Express route definitions
│   ├── user.ts              # /api/v1/user
│   ├── products.ts          # /api/v1/product
│   ├── order.ts             # /api/v1/order
│   ├── payment.ts           # /api/v1/payment
│   └── stats.ts             # /api/v1/dashboard
│
├── models/                  # Mongoose schema definitions
│   ├── user.ts              # User model (name, email, photo, role, gender, dob)
│   ├── product.ts           # Product model (name, photos[], price, stock, category, reviews)
│   ├── order.ts             # Order model (items, shippingInfo, payment, status)
│   ├── coupon.ts            # Coupon model (code, amount/percentage)
│   └── review.ts            # Review model (rating, comment, product ref)
│
├── middlewares/
│   ├── auth.ts              # adminOnly — role-based access guard
│   ├── error.ts             # Global error handler middleware
│   └── multer.ts            # Multer config for multi-image file upload
│
├── types/
│   └── types.ts             # Shared TypeScript interfaces & request types
│
└── utils/
    ├── feature.ts           # connectDb, connectRedis, cache helpers, revalidate
    └── utility-class.ts     # Custom ErrorHandler class
```

---

## 🔄 How It Works

### 1. Server Startup (`app.ts`)
On startup, the server:
1. Loads environment variables via `dotenv`
2. Connects to **MongoDB** (`connectDb`)
3. Connects to **Redis** (`connectRedis`)
4. Configures **Cloudinary** with cloud credentials
5. Initializes the **Stripe** client
6. Registers global middleware: `express.json()`, `morgan`, `cors`
7. Mounts all route modules under `/api/v1/`
8. Serves uploaded files statically from `/uploads`
9. Applies the global error-handling middleware last

### 2. Authentication Strategy
- The backend is **stateless** — it does not manage sessions or JWT tokens.
- Firebase handles login on the client side. The client sends the user's **Firebase UID** with requests.
- The `adminOnly` middleware checks the requesting user's `role` field in MongoDB to gate admin routes.

### 3. Redis Caching
- Redis is used to cache expensive DB queries (dashboard stats, product lists).
- Cached data has a configurable TTL (default: **4 hours**, set via `REDIS_TTL` env var).
- Cache is invalidated (revalidated) whenever mutating operations (create/update/delete) occur on Products, Orders, etc.

### 4. Image Handling (Cloudinary + Multer)
- **Multer** receives `multipart/form-data` file uploads in memory.
- Files are then uploaded to **Cloudinary** which returns a `public_id` and `url`.
- Both are saved in the product's `photos` array in MongoDB.
- On product deletion or update, old images are removed from Cloudinary using `public_id`.

### 5. Payments (Stripe)
- `POST /api/v1/payment/create` creates a **Stripe Payment Intent** and returns the `clientSecret` to the frontend.
- The frontend uses this secret to complete payment via Stripe Elements.
- Coupons offer either a **fixed amount** or **percentage** discount. They're validated server-side before checkout.

### 6. Error Handling
- A custom `ErrorHandler` class (extends `Error`) carries an HTTP `statusCode`.
- The global `errorMiddleware` catches all errors (sync via `try/catch`, async via `express-async-errors` or wrapper), formats the response, and sends appropriate JSON error messages.
- Mongoose `CastError` (invalid ObjectId), `ValidationError`, and duplicate key errors are handled automatically.

---

## 🛤️ API Routes

### 👤 Users — `/api/v1/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/new` | Public | Register a new user (synced from Firebase) |
| GET | `/all` | Admin | Get all registered users |
| GET | `/:id` | Public | Get a single user by Firebase UID |
| DELETE | `/:id` | Admin | Delete a user |

### 📦 Products — `/api/v1/product`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/new` | Admin | Create a new product (with image upload) |
| GET | `/all` | Public | Get all products with search, filter & pagination |
| GET | `/latest` | Public | Get the 5 most recently added products |
| GET | `/categories` | Public | Get all unique product categories |
| GET | `/admin-products` | Admin | Get all products for admin table view |
| GET | `/:id` | Public | Get a single product by ID |
| PUT | `/:id` | Admin | Update a product (with image upload) |
| DELETE | `/:id` | Admin | Delete a product (removes Cloudinary images) |
| GET | `/review/:id` | Public | Get all reviews for a product |
| POST | `/review/new/:id` | Auth | Submit a new review |
| DELETE | `/review/:id` | Auth | Delete a review |

### 🧾 Orders — `/api/v1/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/new` | Auth | Place a new order |
| GET | `/my` | Auth | Get orders for the logged-in user |
| GET | `/all` | Admin | Get all orders (admin) |
| GET | `/:id` | Auth | Get a single order by ID |
| PUT | `/:id` | Admin | Process/update order status |
| DELETE | `/:id` | Admin | Delete an order |

### 💳 Payments — `/api/v1/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create` | Auth | Create a Stripe Payment Intent |
| POST | `/discount` | Auth | Validate and apply a coupon code |
| POST | `/coupon/new` | Admin | Create a new coupon |
| GET | `/coupon/all` | Admin | Get all active coupons |
| GET | `/coupon/:id` | Admin | Get a single coupon |
| PUT | `/coupon/:id` | Admin | Update a coupon |
| DELETE | `/coupon/:id` | Admin | Delete a coupon |

### 📊 Dashboard — `/api/v1/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Overall stats (revenue, users, orders, products) |
| GET | `/pie` | Admin | Pie chart data (categories, order status, stock) |
| GET | `/bar` | Admin | Bar chart data (orders & revenue by month) |
| GET | `/line` | Admin | Line chart data (sales trends) |

---

## 🗄️ Database Models

### `User`
| Field | Type | Notes |
|---|---|---|
| `_id` | String | Firebase UID |
| `name` | String | Required |
| `email` | String | Unique, validated |
| `photo` | String | Profile photo URL |
| `role` | Enum | `"user"` or `"admin"` |
| `gender` | Enum | `"male"` or `"female"` |
| `dob` | Date | Used to compute virtual `age` |

### `Product`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `photos` | Array | `[{ public_id, url }]` — Cloudinary |
| `price` | Number | Required |
| `stock` | Number | Required |
| `category` | String | Required |
| `description` | String | Required |
| `ratings` | Number | Avg rating, default `0` |
| `numOfReviews` | Number | Review count, default `0` |

### `Order`
Fields include: `shippingInfo`, `orderItems[]`, `user`, `subtotal`, `tax`, `shippingCharges`, `discount`, `total`, `status` (Processing → Shipped → Delivered)

### `Coupon`
| Field | Type | Notes |
|---|---|---|
| `code` | String | Unique coupon code |
| `amount` | Number | Discount value |

### `Review`
| Field | Type | Notes |
|---|---|---|
| `user` | String | Firebase UID |
| `product` | ObjectId | Ref to Product |
| `rating` | Number | 1–5 |
| `comment` | String | Review text |

---

## ⚙️ Environment Variables

Create a `.env` file in the root of `E-commerce-backend/`:

```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce

STRIPE_KEY=sk_test_your_stripe_secret_key

REDIS_URI=redis://localhost:6379
REDIS_TTL=14400

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server (with hot reload via tsx)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Watch TypeScript compilation
npm run watch
```

The API server runs on `http://localhost:4000` by default.

---

## 🐳 Docker

```bash
# Development
docker build -f Dockerfile.dev -t ecommerce-backend-dev .

# Production
docker build -t ecommerce-backend .
```

Also managed via `compose.yaml` at the root of the monorepo for running both frontend and backend together.