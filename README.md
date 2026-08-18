# Gemini E-Commerce API

A RESTful e-commerce backend API built with **Node.js, TypeScript, Express, Prisma, and PostgreSQL**.

The project currently includes authentication with:

- User registration
- User login
- Password hashing with bcrypt
- JWT access tokens
- Request validation with Zod
- Global error handling
- PostgreSQL database with Prisma ORM

---

## Tech Stack

- **Node.js**
- **TypeScript**
- **Express 5**
- **Prisma 7**
- **PostgreSQL**
- **bcryptjs**
- **jsonwebtoken**
- **Zod**
- **Winston**
- **Yarn**

---

## Prerequisites

Make sure you have the following installed:

- Node.js 20+
- Yarn
- PostgreSQL 14+

You can verify your environment:

````bash
node --version
yarn --version
psql --version

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd gemini-ecommerce
````

Replace `<repository-url>` with the actual repository URL.

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `.env`:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

DATABASE_URL="postgresql://postgres:password@localhost:5432/gemini_ecommerce?schema=public"

JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
```

### Environment Variables

| Variable         | Description                  | Example            |
| ---------------- | ---------------------------- | ------------------ |
| `PORT`           | Port used by the API server  | `3000`             |
| `NODE_ENV`       | Application environment      | `development`      |
| `LOG_LEVEL`      | Winston logger level         | `info`             |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET`     | Secret key used to sign JWTs | `your-secret-key`  |
| `JWT_EXPIRES_IN` | JWT expiration time          | `1d`               |

> **Important:** Never commit `.env` to Git. Keep secrets such as `JWT_SECRET` and database credentials private.

### Database Setup

Make sure PostgreSQL is running and the database specified in `DATABASE_URL` exists.

For example: `gemini_ecommerce`

Then generate the Prisma Client:

```bash
yarn prisma:generate
```

Run database migrations:

```bash
yarn prisma:migrate
```

Prisma will create/update the database tables based on `prisma/schema.prisma`.

## Run the Application

### Development

Start the development server with hot reload:

```bash
yarn dev
```

The API will be available at: `http://localhost:3000`

Health check:

```bash
GET /health
```

Expected response:

```json
{
  "status": "success",
  "message": "Server is healthy"
}
```

### Production

Build the project:

```bash
yarn build
```

Then start the compiled application:

```bash
yarn start
```

## Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `yarn dev`             | Start development server with hot reload |
| `yarn build`           | Compile TypeScript                       |
| `yarn start`           | Start production server                  |
| `yarn lint`            | Run ESLint                               |
| `yarn format`          | Format the project with Prettier         |
| `yarn format:check`    | Check Prettier formatting                |
| `yarn prisma:generate` | Generate Prisma Client                   |
| `yarn prisma:migrate`  | Create and apply a database migration    |
| `yarn prisma:studio`   | Open Prisma Studio                       |

## API

### Base URL

```
http://localhost:3000/api
```

### Authentication

#### Register

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Successful response:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2026-08-18T00:00:00.000Z",
      "updatedAt": "2026-08-18T00:00:00.000Z"
    }
  }
}
```

The user's password is hashed before being stored and is never returned in the response.

#### Login

Authenticate an existing user.

```http
POST /api/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "status": "success",
  "data": {
    "accessToken": "your-jwt-access-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

The returned `accessToken` will be used to authenticate protected endpoints.

### Error Handling

The application uses a centralized error handler.

Example:

```json
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

Common HTTP status codes:

| Status | Meaning               |
| ------ | --------------------- |
| `400`  | Bad Request           |
| `401`  | Unauthorized          |
| `404`  | Resource not found    |
| `409`  | Conflict              |
| `500`  | Internal Server Error |

In development mode, the response may also contain a stack trace.

## Project Structure

```
.
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   │
│   ├── controllers/
│   │   └── auth.controller.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   │
│   ├── routes/
│   │   └── auth.routes.ts
│   │
│   ├── schemas/
│   │   └── auth.schema.ts
│   │
│   ├── services/
│   │   └── auth.service.ts
│   │
│   ├── utils/
│   │   ├── appError.ts
│   │   └── jwt.ts
│   │
│   └── app.ts
│
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## Authentication Flow

### Registration

```
Client
  │
  │ POST /api/auth/register
  ▼
Validation Middleware
  │
  ▼
Auth Controller
  │
  ▼
Auth Service
  │
  ├── Check existing email
  │
  ├── Hash password with bcrypt
  │
  └── Create user with Prisma
  │
  ▼
Return user without password
```

### Login

```
Client
  │
  │ POST /api/auth/login
  ▼
Validation Middleware
  │
  ▼
Auth Controller
  │
  ▼
Auth Service
  │
  ├── Find user by email
  │
  ├── Verify password with bcrypt
  │
  └── Sign JWT access token
  │
  ▼
Return access token + user
```

## Prisma

The project uses a custom Prisma Client output directory:

```typescript
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

The generated Prisma Client is intentionally ignored by Git:

```
src/generated/
```

After cloning the repository, always run:

```bash
yarn prisma:generate
```

If the Prisma schema changes:

```bash
yarn prisma:migrate
yarn prisma:generate
```

You can inspect the database using:

```bash
yarn prisma:studio
```

## Development Workflow

After cloning the project:

```bash
yarn install
```

Create and configure `.env`:

```bash
cp .env.example .env
```

Generate Prisma Client:

```bash
yarn prisma:generate
```

Run migrations:

```bash
yarn prisma:migrate
```

Start the development server:

```bash
yarn dev
```

Then verify the server:

```
http://localhost:3000/health
```

## Code Quality

Before creating a pull request, run:

```bash
yarn lint
yarn format:check
yarn build
```

If formatting is required:

```bash
yarn format
```

A pull request should pass all three checks before being merged.

## Security Notes

- Never commit `.env`.
- Never expose `JWT_SECRET`.
- Never store plain-text passwords.
- Passwords are hashed using bcryptjs.
- Passwords are excluded from registration responses.
- Login returns a JWT access token.
- Use a strong, random `JWT_SECRET` in production.
- Use HTTPS in production.
- Do not use development credentials in production.

## Current Authentication Endpoints

| Method | Endpoint             | Description         | Auth Required |
| ------ | -------------------- | ------------------- | ------------- |
| `GET`  | `/health`            | Health check        | No            |
| `POST` | `/api/auth/register` | Register a new user | No            |
| `POST` | `/api/auth/login`    | Login               | No            |

Protected routes and authentication middleware will be added in a later phase.

## Troubleshooting

### Prisma Client is missing fields

If TypeScript reports that fields such as `password`, `role`, or `updatedAt` do not exist on `User`, regenerate the Prisma Client:

```bash
yarn prisma:generate
```

If the problem persists, remove the generated client and generate it again:

```bash
rm -rf src/generated/prisma
yarn prisma:generate
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force src/generated/prisma
yarn prisma:generate
```

Then rebuild:

```bash
yarn build
```

### Database connection error

Check that:

- PostgreSQL is running.
- The database exists.
- `DATABASE_URL` in `.env` is correct.
- The PostgreSQL username and password are correct.

Then try:

```bash
yarn prisma:migrate
```

### JWT_SECRET is not defined

Make sure `.env` contains:

```env
JWT_SECRET=your-secret-key
```

Then restart the development server:

```bash
yarn dev
```

## License

This project is licensed under the MIT License.
