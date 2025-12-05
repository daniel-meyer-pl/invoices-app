# Invoices App

A modern web application for managing invoices, clients, and generating PDF invoice documents. The app supports multiple concurrent users, each with their own isolated database of invoices and clients. Authentication is handled using Google OAuth2.

> **Status:** Active development – the project was started recently and is being continuously expanded and improved.

## 🚀 Tech Stack

**Frontend:**
- Vue 3
- Nuxt 4
- Pinia
- TailwindCSS
- Sass

**Backend / Server:**
- Node.js
- Prisma
- PostgreSQL
- Database Migrations

**Infrastructure & Authentication:**
- Docker Compose
- Google OAuth2
- JWT
- Cookie HttpOnly

## 📦 Features

- User authentication via **Google OAuth2**
- Separate invoice and client databases per user
- Invoice creation, editing, and management
- Client management
- PDF invoice generation
- Modern and responsive UI
- Secure session handling using **JWT** and **HTTP Cookies**

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/daniel-meyer-pl/invoices-app
cd invoices-app
```

### 2. Create the `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Then fill in the required environment variables (OAuth keys, database URL, secrets, etc.).

### 3. Start the project with Docker

```bash
docker compose up
```

This will start the full environment, including the backend, frontend, and database.

## 📂 Project Structure (Overview)

```
invoices-app/
│
├── prisma/              # Prisma schema and migrations
├── src/                 # Application source code
├── components/          # Reusable UI components
├── pages/               # Nuxt pages
├── server/              # API routes and logic
├── docker/              # Docker configuration
├── .env.example         # Environment variables template
└── docker-compose.yml   # Docker services definition
```

## 📅 Development Notes

The project is still in early development. Additional features, improvements, and refinements will be added over time. Feedback and suggestions are welcome.

## 📧 Contact

If you have any questions or would like a walkthrough of the architecture or specific parts of the code, feel free to reach out.
