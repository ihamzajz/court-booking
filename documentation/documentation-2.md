# BookFlow Project Documentation 2

## Overview

BookFlow is a production-ready booking platform with:

- `backend/` = Node.js + Express + MySQL API
- `frontend/` = React Native / Expo mobile app
- `documentation/` = archived and updated project documentation

The app now includes:

- BookFlow branding and splash/icon updates
- secure auth with protected admin routes
- realtime live updates using `Socket.IO`
- fallback sync for reliability on reconnect/app resume
- concurrency-safe court and event booking
- database-backed uniqueness protection for users, courts, and events
- production middleware such as `helmet` and rate limiting

## Current Branding

Updated branding:

- App name: `BookFlow`
- App icon: `frontend/assets/images/icon.PNG`
- Native splash image: `frontend/assets/images/splash-screen.PNG`
- In-app splash route: `frontend/app/splash-screen.jsx`

Main Expo config file:

- `frontend/app.json`

## High-Level Architecture

```text
court-booking/
|- backend/
|- frontend/
|- documentation/
|  |- documentation-1.md
|  `- documentation-2.md
`- PROJECT_DOCUMENTATION.md
```

## Frontend Configuration

The frontend API URL is now controlled from one place only:

- `frontend/.env`

Variable:

```env
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url
```

Frontend config file:

- `frontend/src/config/api.js`

This file reads the base URL from the env file and builds all API/image endpoints from it.

## Backend Configuration

Backend environment file:

- `backend/.env`

Important variables:

```env
PORT=5000
CORS_ORIGIN=http://localhost:8081
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=court_booking
JWT_SECRET=your-strong-secret
```

For production:

```env
CORS_ORIGIN=https://abc.com
JWT_SECRET=use-a-long-random-secret
```

## Realtime Updates

Realtime is now implemented with `Socket.IO`.

Backend files:

- `backend/server.js`
- `backend/socket.js`

Frontend files:

- `frontend/src/lib/realtime.js`
- `frontend/src/hooks/useRealtimeSubscription.js`

Live updates currently cover:

- courts
- events
- news
- slides
- FAQs
- users
- court bookings
- event bookings

Professional reliability pattern:

- `Socket.IO` is the primary realtime layer
- `useLiveRefresh` remains as a light fallback for reconnect/resume recovery

This is intentional and closer to how production apps are usually built.

## Authentication and Authorization

Auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/change-password`

Important backend files:

- `backend/controllers/authController.js`
- `backend/middleware/authMiddleware.js`
- `backend/routes/authRoutes.js`

Improvements made:

- login returns sanitized user payload
- profile can refresh from `/api/auth/me`
- password validation is stricter
- duplicate username/email conflicts return proper `409`
- admin-only routes are protected correctly

## Route Security Fixes

These admin mutation routes are now protected:

- `backend/routes/courtRoutes.js`
- `backend/routes/eventRoutes.js`
- `backend/routes/slideRoutes.js`

This prevents public users from creating/updating/deleting core records directly.

## Concurrency Protection

### Court and Event Booking

Race conditions were fixed for simultaneous bookings.

Backend files:

- `backend/controllers/bookingController.js`
- `backend/controllers/eventBookingController.js`
- `backend/utils/locking.js`

How it works now:

- request acquires a MySQL named lock per resource/date
- conflict check runs inside the lock
- insert happens inside a transaction
- only one overlapping booking request can succeed

Result:

- if 2 users book the same court/event for overlapping time at the same moment, both will not be saved
- one request succeeds, the other gets a conflict response

### Duplicate User Creation

Duplicate admin/user creation is protected by:

- database unique indexes on `users.username`
- database unique indexes on `users.email`
- graceful duplicate error handling in controllers

Result:

- if 2 admins create the same username/email at the same time, both will not be created

## Database Notes

Schema file:

- `backend/mysql-schema.sql`

Main tables:

- `users`
- `courts`
- `events`
- `bookings`
- `event_bookings`
- `faqs`
- `news`
- `slides`

Note:

- `players_json` is included in the schema for `bookings`
- if an older database already has `players_json` as `LONGTEXT`, it still works with current code as long as valid JSON text is stored

## Production Middleware

Production hardening in backend:

- `helmet`
- `express-rate-limit`

Applied in:

- `backend/server.js`

Current behavior:

- general API rate limiting
- stricter auth endpoint rate limiting
- secure headers enabled

## Important New Files

Backend:

- `backend/socket.js`
- `backend/utils/locking.js`
- `backend/utils/dbErrors.js`

Frontend:

- `frontend/src/lib/realtime.js`
- `frontend/src/hooks/useRealtimeSubscription.js`
- `frontend/src/hooks/useLiveRefresh.js`
- `frontend/src/utils/auth.js`

## Deployment Checklist

Before production deployment:

1. Set frontend `EXPO_PUBLIC_API_BASE_URL` to your production API domain.
2. Set backend `CORS_ORIGIN` to your production frontend domain.
3. Set a strong production `JWT_SECRET`.
4. Set correct production MySQL credentials.
5. Confirm HTTPS for both frontend and backend.
6. Restart backend after env/package changes.
7. Rebuild the mobile app after splash/icon updates.
8. Test realtime updates from admin to user devices.
9. Test duplicate booking conflict handling.
10. Test duplicate username/email conflict handling.

## Suggested Production Domains

- Frontend: `https://abc.com`
- Backend: `https://api.abc.com`

## Verification Status

The recent changes were checked with:

- `expo lint`
- `npx tsc --noEmit`
- backend `node --check`

## Summary

Compared to documentation 1, this version reflects the current state of the project:

- renamed to BookFlow
- better frontend config
- secure admin routes
- realtime socket updates
- fallback sync strategy
- production middleware
- concurrency-safe booking logic
- cleaner deployment readiness
