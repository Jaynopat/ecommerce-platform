# Multi-Vendor E-Commerce Platform
### Microservices Architecture | Node.js | MongoDB | RabbitMQ | Docker

---

## 📌 Project Overview

A scalable multi-vendor e-commerce platform built using microservices architecture. It supports three user roles (Buyer, Seller, Admin), multi-seller orders, event-driven workflows, OAuth2 authentication with JWT, and an escrow-based payment system.

Designed following **GRASP (General Responsibility Assignment Software Patterns)** principles to ensure clean separation of concerns, low coupling, and high cohesion across all services.

---

## 🏗️ System Architecture

                        ┌─────────────────────────────────┐
                        │          CLIENTS                 │
                        │  Browser / Mobile / Dashboard    │
                        └──────────────┬──────────────────┘
                                       │ HTTPS
                        ┌──────────────▼──────────────────┐
                        │         API GATEWAY :3000        │
                        │  JWT Validation | Rate Limiting  │
                        │  Route Proxying | CORS/Helmet    │
                        └──┬──────┬──────┬────────────────┘
                           │      │      │
              ┌────────────▼─┐ ┌──▼───┐ ┌▼──────────┐
              │ Auth Service │ │Cat.  │ │Order Svc  │
              │    :3001     │ │:3002 │ │  :3003    │
              └────────────┬─┘ └──┬───┘ └─────┬─────┘
                           │      │            │
                    ┌──────▼──────▼────────────▼──────┐
                    │     EVENT BUS (RabbitMQ)         │
                    │     Exchange: ecommerce_events   │
                    └─────────────────────────────────┘

Each service has its own dedicated MongoDB database.
No service accesses another service's database directly.

---

## 🧩 Services

| Service | Port | Responsibility |
|---|---|---|
| API Gateway | 3000 | JWT validation, rate limiting, route proxying |
| Auth Service | 3001 | Register, login, OAuth2, JWT issuance |
| Catalog Service | 3002 | Product CRUD, search, filtering |
| Order Service | 3003 | Multi-seller orders, state machine |
| Payment Service | 3004 | Escrow hold and release per seller |
| Inventory Service | 3005 | Stock management, reservation on order |
| Shipping Service | 3006 | Carrier integration, tracking updates |
| Review Service | 3007 | Verified purchase reviews |
| Notification Service | 3008 | Event-driven email alerts |
| Seller Service | 3009 | Store management, seller dashboards |
| Analytics Service | 3010 | Revenue and order insights |
| Search Service | 3011 | Full-text product search |
| Messaging Service | 3012 | Real-time WebSocket chat (Socket.io) |
| Frontend | 8080 | HTML/JS buyer and seller UI |
| RabbitMQ | 5672 | Asynchronous event bus |
| RabbitMQ UI | 15672 | Management dashboard |

---

## 🧠 GRASP Principles Applied

### 1. Controller
**Where:** API Gateway (`api-gateway/src/routes/proxy.routes.js`)

The API Gateway acts as the single controller for all incoming HTTP requests. No client ever communicates directly with a microservice.

```javascript
app.use('/api/auth',     createProxyMiddleware({ target: AUTH_SERVICE_URL }));
app.use('/api/products', verifyToken, createProxyMiddleware({ target: CATALOG_SERVICE_URL }));
app.use('/api/orders',   verifyToken, createProxyMiddleware({ target: ORDER_SERVICE_URL }));
```

### 2. Information Expert
**Where:** Each microservice owns its domain logic

- **Auth Service** owns user creation and JWT issuance
- **Order Service** owns the order state machine
- **Catalog Service** owns product validation

```javascript
const transition = (order, newStatus) => {
  if (!canTransition(order.status, newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`);
  }
  order.status = newStatus;
};
```

### 3. Creator
**Where:** Auth Service creates Users. Order Service creates Orders.

```javascript
const user = new User({ email, passwordHash: password, role, storeId });
await user.save();
const token = issueToken(user);
```

### 4. Low Coupling
**Where:** Event Bus (`shared/eventBus/index.js`)

Services never call each other's APIs or databases directly.

```javascript
await publish(EVENTS.ORDER_PLACED, { orderId, buyerId, totalAmount, sellerGroups });
```

### 5. High Cohesion
**Where:** Every microservice folder

Each service has exactly one responsibility, its own MongoDB database, its own Node.js process, and its own Dockerfile.

### 6. Indirection
**Where:** API Gateway + Event Bus

Client → Gateway → Service       (HTTP indirection via Gateway)
Service → EventBus → Service     (event indirection via RabbitMQ)

### 7. Protected Variations
**Where:** Payment Service adapter pattern

The payment integration is isolated behind a controller interface. Swapping payment providers only requires changing the payment adapter — no other service is affected.

### 8. Polymorphism
**Where:** Role-based access control in all services

```javascript
if (role === 'buyer')  query = { buyerId: userId };
if (role === 'seller') query = { 'sellerGroups.sellerId': userId };
if (role === 'admin')  query = {};
```

---

## 🔄 Event-Driven Flows
order.placed
└──► Payment Service   → captures funds, creates escrow
└──► Inventory Service → reserves stock
└──► Notification Svc  → emails buyer confirmation
payment.captured
└──► Order Service     → transitions order: pending → paid
└──► Seller notified
shipment.delivered
└──► Payment Service   → releases escrow to seller
└──► Review Service    → unlocks verified review for buyer

## 🗄️ Database Design
auth-db         → users: { email, passwordHash, role, storeId }
catalog-db      → products: { name, price, category, sellerId, storeId }
order-db        → orders: { buyerId, sellerGroups[], totalAmount, status }
payment-db      → escrows: { orderId, buyerId, sellerEntries[], status }
inventory-db    → inventory: { productId, storeId, quantity, reserved }
shipping-db     → shipments: { orderId, carrier, trackingNumber, status }
review-db       → reviews: { orderId, productId, buyerId, rating, comment }
notification-db → notifications: { userId, type, message, read }
seller-db       → stores: { sellerId, storeName, description }
analytics-db    → events: { type, orderId, amount, timestamp }
search-db       → search index: { productId, name, category, tags }
messaging-db    → messages: { orderId, senderId, senderRole, content }

---

## 🔐 Security

- JWT validation at the API Gateway
- Role-based access (buyer, seller, admin scopes in JWT)
- storeId validation — sellers only modify their own products/orders
- Password hashing with bcrypt (salt rounds: 12)
- Rate limiting — 100 requests per 15 minutes per IP
- Helmet HTTP security headers on the gateway

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running

### Run the Platform

```bash
cd ecommerce-platform
docker-compose up --build
```

### Access
Frontend:       http://localhost:8080
API Gateway:    http://localhost:3000
RabbitMQ UI:    http://localhost:15672  (admin / password)

### Stop

```bash
docker-compose down
```

---

## 🧪 API Testing (Postman)

### Register
POST http://localhost:3000/api/auth/register
{ "email": "buyer@test.com", "password": "Password123", "role": "buyer" }

### Login
POST http://localhost:3000/api/auth/login
{ "email": "buyer@test.com", "password": "Password123" }

### Create a Product (Seller token required)
POST http://localhost:3000/api/products
Authorization: Bearer <seller_token>
{ "name": "Wireless Headphones", "price": 149.99, "category": "Electronics", "stock": 50 }

### Place an Order (Buyer token required)
POST http://localhost:3000/api/orders
Authorization: Bearer <buyer_token>
{
"items": [{ "productId": "...", "productName": "...", "quantity": 1,
"unitPrice": 149.99, "sellerId": "...", "storeId": "..." }],
"shippingAddress": { "street": "123 Main St", "city": "Toronto",
"province": "ON", "postalCode": "M5V 2T6", "country": "CA" }
}

---

## 📁 Folder Structure
ecommerce-platform/
├── docker-compose.yml
├── README.md
├── .gitignore
├── frontend/
│   ├── Dockerfile
│   └── index.html
├── api-gateway/
│   ├── Dockerfile
│   └── src/
│       ├── index.js
│       ├── middleware/auth.middleware.js
│       └── routes/proxy.routes.js
├── shared/
│   ├── eventBus/index.js
│   └── constants/events.js
└── services/
├── auth-service/
├── catalog-service/
├── order-service/
├── payment-service/
├── inventory-service/
├── shipping-service/
├── review-service/
├── notification-service/
├── seller-service/
├── analytics-service/
├── search-service/
└── messaging-service/

---

## 👩‍💻 Technology Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Service runtime and HTTP framework |
| MongoDB + Mongoose | Per-service databases |
| RabbitMQ + amqplib | Asynchronous event bus |
| Socket.io | Real-time WebSocket messaging |
| JSON Web Tokens | Authentication and authorization |
| bcryptjs | Password hashing |
| Docker + Compose | Containerization and orchestration |
| http-proxy-middleware | API Gateway request forwarding |
| express-rate-limit | Rate limiting at gateway |
| Helmet | HTTP security headers |
| nginx | Frontend static file serving |
