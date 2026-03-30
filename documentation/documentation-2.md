# BookFlow Updated Documentation

## 1. Project Overview

BookFlow is a booking platform with:

- `backend/` = Node.js + Express + MySQL API
- `frontend/` = React Native / Expo mobile app
- `documentation/` = project documents

Current product areas:

- login
- register
- forgot password with email OTP
- court booking
- event booking
- booking history
- profile and password change
- admin panel
- manage users
- manage courts
- manage events
- manage FAQs
- manage news
- manage slides
- realtime live updates

## 2. Folder Structure

```text
court-booking/
|- backend/
|- frontend/
`- documentation/
   |- documentation-1.md
   |- documentation-2.md
   `- documentation-api.md
```

## 3. Branding

Branding is now:

- app name: `BookFlow`
- app icon: `frontend/assets/images/icon.PNG`
- splash image: `frontend/assets/images/splash-screen.PNG`
- Expo config: `frontend/app.json`

## 4. Environment Configuration

### Frontend

Frontend uses one env file:

- `frontend/.env`

Important variable:

```env
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url
```

This is read by:

- `frontend/src/config/api.js`

### Backend

Backend uses one env file:

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
SUPPORT_EMAIL=support@example.com
APP_NAME=BookFlow
PRIVACY_CONTACT_NAME=BookFlow Support
```

For production example:

```env
CORS_ORIGIN=https://abc.com
JWT_SECRET=use-a-long-random-secret
SUPPORT_EMAIL=support@example.com
APP_NAME=BookFlow
PRIVACY_CONTACT_NAME=BookFlow Support
```

## 5. Login

Login flow:

- user enters username or email
- backend validates password
- backend only allows active users
- backend returns sanitized user data plus JWT token
- frontend stores session locally

Main files:

- `frontend/app/login.jsx`
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `backend/middleware/authMiddleware.js`

Security behavior:

- protected routes now re-check the live user from database
- inactive users are blocked immediately
- demoted admins lose admin access immediately
- old JWT role/status is no longer blindly trusted

## 6. Register

Register flow:

- user creates a normal account
- username and email must be unique
- account is created as inactive by default
- admin activates the account later

Main files:

- `frontend/app/register.jsx`
- `backend/controllers/authController.js`

Validation highlights:

- username format check
- email format check
- minimum password length
- duplicate username/email protection

## 7. Forgot Password

Forgot-password flow is now fully set up:

1. user enters email
This forgot-password and OTP recovery flow has been removed from the active project.

Main files:

- `documentation/forgot-password-otp-archive.md`

If you want it back later, restore it from the archive document.

## 8. Profile and Change Password

Profile area supports:

- loading current user from `/api/auth/me`
- live refresh of account status
- change password while logged in
- logout

Main files:

- `frontend/app/(tabs)/profile.tsx`
- `backend/controllers/authController.js`

## 9. Court Booking

Court booking supports:

- view courts
- choose date
- choose duration
- choose players
- create booking
- realtime slot updates

Main files:

- `frontend/app/(tabs)/court.jsx`
- `backend/controllers/bookingController.js`
- `backend/routes/bookingRoutes.js`

Server-side protections:

- conflict-safe booking with MySQL named locks
- transaction-based insert flow
- server validates court exists
- server blocks past bookings
- server validates time range
- server enforces max players
- server blocks defaulter users
- server blocks users with `can_book=no`

## 10. Event Booking

Event booking supports:

- view venues/events
- choose date
- choose duration
- create booking
- realtime slot updates

Main files:

- `frontend/app/(tabs)/event.tsx`
- `backend/controllers/eventBookingController.js`
- `backend/routes/eventBookingRoutes.js`

Server-side protections:

- conflict-safe booking
- event existence check
- past booking block
- invalid time-range block
- `can_book` check
- defaulter block

## 11. Booking History

History supports:

- court booking history
- event booking history
- payment status view
- booking status view
- admin notes

Main files:

- `frontend/app/(tabs)/history.tsx`

Improvements:

- safer session restore
- shared auth helper usage
- realtime refresh on booking changes

## 12. Admin Panel

Admin panel is the main control area for:

- manage courts
- manage events
- manage slides
- manage users
- manage FAQs
- manage news
- booking dashboards

Main file:

- `frontend/app/(tabs)/admin-panel.jsx`

Only `admin` and `superadmin` can access it.

## 13. Manage Users

Admin user management supports:

- create user
- edit user
- delete user
- activate/deactivate user
- change role
- set `can_book`
- set `fees_status`

Main files:

- `frontend/app/(tabs)/manage-users.jsx`
- `backend/controllers/userController.js`
- `backend/routes/userRoutes.js`

Important notes:

- duplicate username/email is blocked
- user creation has stronger validation now
- status and role changes take effect immediately because protected routes re-check DB

## 14. Manage Courts

Supports:

- create court
- update court
- delete court
- upload court image

Main files:

- `frontend/app/(tabs)/manage-court.jsx`
- `backend/controllers/courtController.js`
- `backend/routes/courtRoutes.js`
- `backend/middleware/upload.js`

Improvement:

- upload directory is now created automatically for safer deployment

## 15. Manage Events

Supports:

- create venue/event
- update venue/event
- delete venue/event
- upload event image

Main files:

- `frontend/app/(tabs)/manage-event.jsx`
- `backend/controllers/eventController.js`
- `backend/routes/eventRoutes.js`

## 16. Manage FAQs

Supports:

- create FAQ
- update FAQ
- delete FAQ
- reorder FAQs
- active/inactive status

Main files:

- `frontend/app/(tabs)/manage-faqs.jsx`
- `backend/controllers/faqController.js`
- `backend/routes/faqRoutes.js`

## 17. Manage News

Supports:

- create news
- update news
- delete news
- reorder news
- upload image
- active/inactive status

Main files:

- `frontend/app/(tabs)/manage-news.jsx`
- `backend/controllers/newsController.js`
- `backend/routes/newsRoutes.js`

## 18. Manage Slides

Supports:

- create slides
- update slides
- delete slides
- reorder slides
- active/inactive state

Main files:

- `frontend/app/(tabs)/manage-slides.jsx`
- `backend/controllers/slideController.js`
- `backend/routes/slideRoutes.js`

## 19. Realtime Updates

Realtime is implemented with `Socket.IO`.

Main files:

- `backend/server.js`
- `backend/socket.js`
- `frontend/src/lib/realtime.js`
- `frontend/src/hooks/useRealtimeSubscription.js`
- `frontend/src/hooks/useLiveRefresh.js`

Live update areas:

- courts
- events
- users
- news
- slides
- FAQs
- bookings
- event bookings

Production approach used:

- realtime via Socket.IO
- fallback refresh on focus/reconnect/app resume

## 20. Database

Main schema file:

- `backend/mysql-schema.sql`

Important tables:

- `users`
- `courts`
- `events`
- `bookings`
- `event_bookings`
- `faqs`
- `news`
- `slides`
- `account_deletion_requests`

Important notes:

- `players_json` is used for court booking players
- `account_deletion_requests` is auto-created on startup
- `slides` is also auto-created on startup
- hardcoded default admin seed was removed

## 21. Security and Production Hardening

Current production protections:

- `helmet`
- `express-rate-limit`
- admin route protection
- duplicate-key protection
- secure password hashing
- JWT auth
- live DB user re-check on protected routes
- concurrency-safe booking locks
- OTP hashing and expiry

Main files:

- `backend/server.js`
- `backend/middleware/authMiddleware.js`
- `backend/utils/locking.js`
- `backend/utils/dbErrors.js`

## 22. Deployment Notes

Recommended domain setup:

- frontend: `https://abc.com`
- backend: `https://api.abc.com`

Before deployment:

1. set frontend `EXPO_PUBLIC_API_BASE_URL`
2. set backend `CORS_ORIGIN`
3. set strong `JWT_SECRET`
4. set production DB credentials
5. add Gmail email credentials
6. restart backend after env changes
7. rebuild app after icon/splash changes
8. test login, register, forgot password, court booking, event booking, admin actions

## 23. Verification Status

Recent checks passed:

- `expo lint`
- `npx tsc --noEmit`
- backend `node --check`

## 24. Current Project Status

The project is now in a much stronger production-ready state with:

- hardened auth
- realtime updates
- safer bookings
- OTP-based password reset
- stronger deployment consistency
- cleaner frontend session handling
