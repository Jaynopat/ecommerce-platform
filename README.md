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