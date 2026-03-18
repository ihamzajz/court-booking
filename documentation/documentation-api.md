# BookFlow API Documentation

## Overview

This file explains how to use the BookFlow backend APIs when building a web app, admin panel, or any other frontend.

Base URL examples:

- Local: `http://localhost:5000`
- Production: `https://api.abc.com`

All endpoints below assume:

```text
{BASE_URL}/api/...
```

Example:

```text
http://localhost:5000/api/auth/login
```

## Authentication Basics

Protected endpoints require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

How auth works:

1. Call login API
2. Save returned `token`
3. Send that token in `Authorization` header for protected APIs

## Common Web App Flows

### Public Website / Public App

Use these APIs:

- `GET /api/courts`
- `GET /api/events`
- `GET /api/faqs`
- `GET /api/news`
- `GET /api/news/:id`
- `GET /api/slides`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Logged-in User App

Use these APIs:

- `GET /api/auth/me`
- `PUT /api/auth/change-password`
- `GET /api/users/booking-options`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/my`
- `DELETE /api/bookings/:id`
- `POST /api/event-bookings`
- `GET /api/event-bookings`
- `GET /api/event-bookings/my`

### Admin Panel

Use these APIs:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/courts`
- `PUT /api/courts/:id`
- `DELETE /api/courts/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/bookings/admin/all`
- `PUT /api/bookings/admin/:id/status`
- `PUT /api/bookings/admin/:id/payment`
- `GET /api/event-bookings/admin/all`
- `PUT /api/event-bookings/admin/:id/status`
- `PUT /api/event-bookings/admin/:id/payment`
- `GET /api/faqs/admin/all`
- `POST /api/faqs`
- `PUT /api/faqs/:id`
- `DELETE /api/faqs/:id`
- `PUT /api/faqs/reorder`
- `GET /api/news/admin/all`
- `POST /api/news`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`
- `PUT /api/news/reorder`
- `GET /api/slides/admin/all`
- `POST /api/slides`
- `PUT /api/slides/:id`
- `DELETE /api/slides/:id`
- `PUT /api/slides/reorder`

## Auth APIs

### Register User

`POST /api/auth/register`

Use for:

- create normal user account

Body:

```json
{
  "name": "Muhammad Hamza",
  "username": "muhammad.hamza",
  "email": "hamza@example.com",
  "cm_no": "12345",
  "password": "yourpassword"
}
```

Notes:

- creates normal user only
- new user is usually inactive until admin approval
- duplicate username/email returns conflict

### Login User

`POST /api/auth/login`

Use for:

- login from web app or mobile app

Body:

```json
{
  "identifier": "muhammad.hamza",
  "password": "yourpassword"
}
```

or:

```json
{
  "identifier": "hamza@example.com",
  "password": "yourpassword"
}
```

Returns:

- user profile fields
- JWT token

Important returned fields:

- `id`
- `name`
- `username`
- `email`
- `role`
- `can_book`
- `fees_status`
- `token`

### Get Current Logged-in User

`GET /api/auth/me`

Use for:

- restore session
- refresh user info after login
- check role and booking permissions

Headers:

```http
Authorization: Bearer YOUR_TOKEN
```

### Change Password

`PUT /api/auth/change-password`

Use for:

- change logged-in user password

Headers:

```http
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

## User APIs

### Get Booking Player Options

`GET /api/users/booking-options`

Use for:

- load selectable players in court booking flow

Auth:

- logged-in user

### Get All Users

`GET /api/users`

Use for:

- admin user management table

Auth:

- admin or superadmin only

### Create User

`POST /api/users`

Use for:

- admin creates a new user/admin manually

Auth:

- admin or superadmin only

Body example:

```json
{
  "name": "Muhammad Hamza",
  "username": "muhammad.hamza",
  "email": "muhammad.hamza@example.com",
  "cm_no": null,
  "password": "hamzajazzy108",
  "role": "superadmin",
  "status": "active",
  "can_book": "yes",
  "fees_status": "paid"
}
```

### Update User

`PUT /api/users/:id`

Use for:

- admin edit user data
- activate/deactivate users
- change role
- allow/disallow booking
- update fees status

Auth:

- admin or superadmin only

### Delete User

`DELETE /api/users/:id`

Use for:

- admin removes a user

Auth:

- admin or superadmin only

## Court APIs

### Get All Courts

`GET /api/courts`

Use for:

- public court listing
- booking screen list

### Get Single Court

`GET /api/courts/:id`

Use for:

- court detail page
- edit form prefill if needed

### Create Court

`POST /api/courts`

Use for:

- admin adds new court

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

Fields:

- `name`
- `picture` (file, optional depending on frontend flow)

### Update Court

`PUT /api/courts/:id`

Use for:

- admin edits court

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

### Delete Court

`DELETE /api/courts/:id`

Use for:

- admin deletes court

Auth:

- admin or superadmin only

## Event APIs

### Get All Events

`GET /api/events`

Use for:

- public event venue listing
- event booking list

### Get Single Event

`GET /api/events/:id`

Use for:

- event detail page
- edit form prefill

### Create Event

`POST /api/events`

Use for:

- admin adds venue/event place

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

Fields:

- `name`
- `picture`

### Update Event

`PUT /api/events/:id`

Use for:

- admin edits venue/event

Auth:

- admin or superadmin only

### Delete Event

`DELETE /api/events/:id`

Use for:

- admin deletes venue/event

Auth:

- admin or superadmin only

## Court Booking APIs

### Create Court Booking

`POST /api/bookings`

Use for:

- user books a court

Auth:

- logged-in user

Body:

```json
{
  "courtId": 1,
  "bookingDate": "2026-03-18",
  "startTime": "18:00:00",
  "endTime": "19:00:00",
  "playerIds": [2, 3]
}
```

Notes:

- backend automatically includes current user in the booking
- duplicate overlapping booking is blocked
- if two users try same slot at same time, only one succeeds

### Get Court Bookings By Date

`GET /api/bookings?courtId=1&date=2026-03-18`

Use for:

- slot availability screen
- disable already booked time slots

Auth:

- logged-in user

### Get My Court Bookings

`GET /api/bookings/my`

Use for:

- user history page
- dashboard of own court bookings

Auth:

- logged-in user

### Cancel Court Booking

`DELETE /api/bookings/:id`

Use for:

- user cancels own booking

Auth:

- logged-in user

### Admin Get All Court Bookings

`GET /api/bookings/admin/all`

Use for:

- admin booking dashboard
- filters and reporting

Auth:

- admin or superadmin only

Optional query params:

- `year`
- `month`
- `dateFrom`
- `dateTo`
- `search`
- `bookingStatus`
- `paymentStatus`

Example:

```text
/api/bookings/admin/all?year=2026&month=3&bookingStatus=PENDING
```

### Admin Update Court Booking Status

`PUT /api/bookings/admin/:id/status`

Use for:

- approve booking
- reject booking
- add admin note

Auth:

- admin or superadmin only

Body:

```json
{
  "status": "APPROVED",
  "adminNote": "Approved by admin"
}
```

### Admin Update Court Booking Payment

`PUT /api/bookings/admin/:id/payment`

Use for:

- mark booking as paid/unpaid

Auth:

- admin or superadmin only

Body:

```json
{
  "paymentStatus": "PAID"
}
```

## Event Booking APIs

### Create Event Booking

`POST /api/event-bookings`

Use for:

- user books event venue

Auth:

- logged-in user

Body:

```json
{
  "eventId": 1,
  "bookingDate": "2026-03-18",
  "startTime": "20:00:00",
  "endTime": "22:00:00"
}
```

### Get Event Bookings By Date

`GET /api/event-bookings?eventId=1&date=2026-03-18`

Use for:

- event slot availability

Auth:

- logged-in user

### Get My Event Bookings

`GET /api/event-bookings/my`

Use for:

- user event history

Auth:

- logged-in user

### Admin Get All Event Bookings

`GET /api/event-bookings/admin/all`

Use for:

- admin event booking dashboard

Auth:

- admin or superadmin only

Optional query params:

- `year`
- `month`
- `dateFrom`
- `dateTo`
- `search`
- `bookingStatus`
- `paymentStatus`

### Admin Update Event Booking Status

`PUT /api/event-bookings/admin/:id/status`

Body:

```json
{
  "status": "APPROVED",
  "adminNote": "Approved"
}
```

### Admin Update Event Booking Payment

`PUT /api/event-bookings/admin/:id/payment`

Body:

```json
{
  "paymentStatus": "PAID"
}
```

## FAQ APIs

### Get Public FAQs

`GET /api/faqs`

Use for:

- public FAQ page

### Get All FAQs For Admin

`GET /api/faqs/admin/all`

Use for:

- admin FAQ table

Auth:

- admin or superadmin only

### Create FAQ

`POST /api/faqs`

Body:

```json
{
  "question": "How do I book?",
  "answer": "Login and choose a slot.",
  "status": "active",
  "sortOrder": 1
}
```

### Update FAQ

`PUT /api/faqs/:id`

Use for:

- edit FAQ text/status/order

### Delete FAQ

`DELETE /api/faqs/:id`

### Reorder FAQs

`PUT /api/faqs/reorder`

Body:

```json
{
  "orderedIds": [3, 1, 2]
}
```

## News APIs

### Get Public News List

`GET /api/news`

Use for:

- public news page

### Get News Detail

`GET /api/news/:id`

Use for:

- news detail page

### Get All News For Admin

`GET /api/news/admin/all`

Use for:

- admin news management table

Auth:

- admin or superadmin only

### Create News

`POST /api/news`

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

Fields:

- `heading`
- `content`
- `status`
- `sortOrder`
- `picture` (required)

### Update News

`PUT /api/news/:id`

Use for:

- edit news

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

### Delete News

`DELETE /api/news/:id`

### Reorder News

`PUT /api/news/reorder`

Body:

```json
{
  "orderedIds": [4, 1, 2, 3]
}
```

## Slide APIs

### Get Public Slides

`GET /api/slides`

Use for:

- homepage slider

### Get All Slides For Admin

`GET /api/slides/admin/all`

Use for:

- admin slide management

Auth:

- admin or superadmin only

### Create Slide

`POST /api/slides`

Auth:

- admin or superadmin only

Content type:

- `multipart/form-data`

Fields:

- `title`
- `subtitle`
- `sortOrder`
- `isActive`
- `picture` (required)

### Update Slide

`PUT /api/slides/:id`

### Delete Slide

`DELETE /api/slides/:id`

### Reorder Slides

`PUT /api/slides/reorder`

Body:

```json
{
  "orderedIds": [5, 2, 1, 3, 4]
}
```

## Realtime Events For Web App

If your web app also wants live updates, use Socket.IO and listen for:

- `courts:updated`
- `events:updated`
- `news:updated`
- `slides:updated`
- `faqs:updated`
- `users:updated`
- `bookings:updated`
- `event-bookings:updated`

Recommended web app behavior:

- on event receive, refetch the affected resource
- do not trust local UI only
- backend remains source of truth

## Upload and Image URLs

Uploads are served from:

```text
{BASE_URL}/uploads/...
```

Examples:

- courts: `/uploads/courts/...`
- events: `/uploads/events/...`
- slides: `/uploads/slides/...`
- news: `/uploads/news/...`

## Common Response Errors

Typical errors:

- `400` = bad request / validation error
- `401` = missing or invalid token
- `403` = not enough permission
- `404` = record not found
- `409` = duplicate or booking conflict
- `500` = server error

## Recommended Frontend Structure For Web App

If you build a web app using these APIs, typical pages would be:

### Public

- Home
- News list
- News detail
- FAQs
- Login
- Register

### User

- Profile
- Change password
- Court booking
- Event booking
- Booking history

### Admin

- Dashboard
- Manage users
- Manage courts
- Manage events
- Manage slides
- Manage FAQs
- Manage news
- Manage court bookings
- Manage event bookings

## Final Notes

This API is already suitable for:

- React web app
- Next.js app
- PHP website frontend
- admin dashboard
- mobile app

For a web app, the most important implementation rule is:

- use login token properly
- protect admin routes in frontend UI
- always refetch after important actions
- listen to realtime socket events if you want live admin/user sync
