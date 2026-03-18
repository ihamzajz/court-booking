# Court Booking Project Documentation

## Overview

This project has:

- `backend/` = Node.js + Express + MySQL API
- `frontend/` = React Native / Expo app

Recommended production setup:

- Frontend domain: `https://abc.com`
- Backend API domain: `https://api.abc.com`

This is a clean and standard setup because:

- frontend and backend are separated clearly
- mobile app, PHP website, and frontend can all use the same API
- future config changes are small and predictable

## Project Structure

```text
court-booking/
├── backend/
│   ├── .env
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── mysql-schema.sql
│   └── seed.js
├── frontend/
│   ├── src/config/api.js
│   └── app/
└── PROJECT_DOCUMENTATION.md
```

## Local Development

### Backend

Run from `backend/`:

```bash
npm install
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

### Frontend

Run from `frontend/`:

```bash
npm install
npm start
```

## Important Config Files

### Frontend API Config

File:

`frontend/src/config/api.js`

This is the main frontend API config file.

Current important line:

```js
export const BASE_URL = "http://localhost:5000";
```

When hosting backend later, change only this line.

Example:

```js
export const BASE_URL = "https://api.abc.com";
```

### Backend Environment Config

File:

`backend/.env`

Important lines:

```env
CORS_ORIGIN=http://localhost:8081
PORT=5000
```

When hosting frontend later, change only:

```env
CORS_ORIGIN=https://abc.com
```

Usually keep:

```env
PORT=5000
```

unless your hosting provider requires something else.

## Recommended Production Setup

### Frontend

Host frontend on:

```text
https://abc.com
```

### Backend

Host backend on:

```text
https://api.abc.com
```

### Final Production Config

Frontend file `frontend/src/config/api.js`:

```js
export const BASE_URL = "https://api.abc.com";
```

Backend file `backend/.env`:

```env
CORS_ORIGIN=https://abc.com
PORT=5000
```

## API Base URL

If backend is hosted on:

```text
https://api.abc.com
```

then API endpoints will be:

```text
https://api.abc.com/api/auth/login
https://api.abc.com/api/auth/register
https://api.abc.com/api/courts
https://api.abc.com/api/bookings
```

## PHP Website Integration

If you also have a PHP website, it can use the same backend API.

Example API calls from PHP:

```text
https://api.abc.com/api/auth/login
https://api.abc.com/api/bookings
https://api.abc.com/api/courts
```

Important note:

- `CORS_ORIGIN` is mainly for browser-based frontend requests
- server-to-server PHP requests usually do not depend on browser CORS rules

If you later use both:

- `https://abc.com`
- `https://www.abc.com`

you can allow both in backend `.env`:

```env
CORS_ORIGIN=https://abc.com,https://www.abc.com
```

## Authentication

### Register

Endpoint:

```text
POST /api/auth/register
```

Example body:

```json
{
  "name": "Hamza",
  "username": "hamza",
  "email": "hamza@example.com",
  "password": "123456"
}
```

### Login

Endpoint:

```text
POST /api/auth/login
```

User can login with either:

- username + password
- email + password

Example body:

```json
{
  "identifier": "admin",
  "password": "admin123"
}
```

or:

```json
{
  "identifier": "admin@gmail.com",
  "password": "admin123"
}
```

## Admin User

Admin can be created using:

- `backend/mysql-schema.sql`
- `backend/seed.js`

Current admin credentials:

```text
Username: admin
Email: admin@gmail.com
Password: admin123
```

## Database

Database used:

```text
MySQL
```

Main tables:

- `users`
- `courts`
- `bookings`

Schema file:

`backend/mysql-schema.sql`

## Deployment Checklist

Before production deployment:

1. Host frontend on `https://abc.com`
2. Host backend on `https://api.abc.com`
3. Update frontend `BASE_URL`
4. Update backend `CORS_ORIGIN`
5. Set production MySQL credentials in `backend/.env`
6. Set a strong production `JWT_SECRET`
7. Keep backend `PORT` as needed by hosting
8. Make sure HTTPS/SSL is enabled

## What To Change Later

### Only change this in frontend

File:

`frontend/src/config/api.js`

Line:

```js
export const BASE_URL = "https://api.abc.com";
```

### Only change this in backend

File:

`backend/.env`

Line:

```env
CORS_ORIGIN=https://abc.com
```

## Documentation Format

This file is in Markdown, which is a standard and widely used documentation format in software projects.

If needed, this file can later be converted to:

- Word document
- PDF
- client handover document
- deployment SOP

