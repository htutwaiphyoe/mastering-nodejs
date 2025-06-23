# 📋 Project Requirements - URL Shortener API

This document lists all the tools, technologies, and libraries used in the URL Shortener project. Ensure you have everything set up before beginning development.

---

## ✅ Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/)
- A code editor (e.g., [VS Code](https://code.visualstudio.com/))

---

## 🧱 Tech Stack Overview

| Category         | Technology        | Purpose                               |
| ---------------- | ----------------- | ------------------------------------- |
| Backend          | Node.js + Express | REST API development                  |
| Database         | PostgreSQL        | Relational data store                 |
| ORM              | Drizzle ORM       | Type-safe database queries and schema |
| Containerization | Docker + Compose  | Local PostgreSQL instance             |
| Authentication   | JWT               | Securing private routes               |
| Testing Tool     | Postman           | Manual API testing                    |

---

## 📦 NPM Dependencies

Run this to install all required packages:

```bash
npm install express drizzle-orm pg jsonwebtoken bcrypt dotenv
```

## Auth Routes

| Method | Endpoint  | Description             | Auth Required |
| ------ | --------- | ----------------------- | ------------- |
| POST   | `/signup` | Register a new user     | ❌            |
| POST   | `/login`  | Login and receive token | ❌            |

## URL Routes

| Method | Endpoint      | Description                                | Auth Required |
| ------ | ------------- | ------------------------------------------ | ------------- |
| POST   | `/shorten`    | Create a short URL from a long one         | ✅            |
| GET    | `/:shortCode` | Redirect to the original URL               | ❌            |
| GET    | `/urls`       | Get all URLs created by the logged-in user | ✅            |
| DELETE | `/urls/:id`   | Delete a short URL (if it belongs to user) | ✅            |
