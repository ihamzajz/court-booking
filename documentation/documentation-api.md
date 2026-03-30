# BookFlow API Documentation

## 1. API Overview

This file is only for backend API usage.

Base URL examples:

- local: `http://localhost:5000`
- production: `https://api.abc.com`

API base:

```text
{BASE_URL}/api
```

Example:

```text
http://localhost:5000/api/auth/login
```

## 2. Authentication Rules

Protected endpoints require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

How to use:

1. call login
2. save returned `token`
3. send that token in the `Authorization` header

Notes:

- protected routes re-check the live user in database
- inactive users are blocked
- admin permissions are checked from live DB state

## 3. Auth APIs

### Register

`POST /api/auth/register`

Use for:

- creating a normal user account

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

Returns:

- registration success message

Notes:

- new user is usually inactive until admin approval
- duplicate email/username is blocked

### Login

`POST /api/auth/login`

Use for:

- username login
- email login

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

```json
{
  "id": 1,
  "name": "Muhammad Hamza",
  "username": "muhammad.hamza",
  "email": "hamza@example.com",
  "cm_no": "12345",
  "role": "user",
  "status": "active",
  "can_book": "yes",
  "fees_status": "paid",
  "token": "JWT_TOKEN"
}
```

### Get Current User

`GET /api/auth/me`

Use for:

- restoring session
- getting fresh role/status data

Auth:

- logged-in user

### Change Password

`PUT /api/auth/change-password`

Use for:

- changing password while logged in

Auth:

- logged-in user

Body:

```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

### Forgot-Password and OTP Reset

This flow has been removed from the active project.

If it is needed again later, restore it from:

- `documentation/forgot-password-otp-archive.md`

## 4. User APIs

### Get Booking Player Options

`GET /api/users/booking-options`

Use for:

- player selector in court booking

Auth:

- logged-in user

### Get All Users

`GET /api/users`

Use for:

- admin users list

Auth:

- admin or superadmin

### Create User

`POST /api/users`

Use for:

- admin creates user/admin manually

Auth:

- admin or superadmin

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

- update role
- update status
- update booking permission
- update fees status
- update password

Auth:

- admin or superadmin

### Delete User

`DELETE /api/users/:id`

Use for:

- deleting user

Auth:

- admin or superadmin

## 5. Court APIs

### Get All Courts

`GET /api/courts`

Use for:

- public court list
- booking court list

### Get Court By ID

`GET /api/courts/:id`

Use for:

- court detail

### Create Court

`POST /api/courts`

Use for:

- admin creates court

Auth:

- admin or superadmin

Content type:

- `multipart/form-data`

Fields:

- `name`
- `picture`

### Update Court

`PUT /api/courts/:id`

Auth:

- admin or superadmin

Content type:

- `multipart/form-data`

### Delete Court

`DELETE /api/courts/:id`

Auth:

- admin or superadmin

## 6. Event APIs

### Get All Events

`GET /api/events`

Use for:

- public venue list
- event booking list

### Get Event By ID

`GET /api/events/:id`

### Create Event

`POST /api/events`

Auth:

- admin or superadmin

Content type:

- `multipart/form-data`

Fields:

- `name`
- `picture`

### Update Event

`PUT /api/events/:id`

Auth:

- admin or superadmin

### Delete Event

`DELETE /api/events/:id`

Auth:

- admin or superadmin

## 7. Court Booking APIs

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

Important behavior:

- court must exist
- past booking is blocked
- invalid time range is blocked
- overlapping booking is blocked
- user with `can_book=no` is blocked
- defaulter user is blocked
- only one request wins in same-slot race condition

### Get Court Bookings By Date

`GET /api/bookings?courtId=1&date=2026-03-18`

Use for:

- slot availability screen

Auth:

- logged-in user

### Get My Court Bookings

`GET /api/bookings/my`

Use for:

- history page

Auth:

- logged-in user

### Cancel Court Booking

`DELETE /api/bookings/:id`

Use for:

- cancel own booking

Auth:

- logged-in user

### Admin Get All Court Bookings

`GET /api/bookings/admin/all`

Use for:

- admin booking dashboard

Auth:

- admin or superadmin

Query params:

- `year`
- `month`
- `dateFrom`
- `dateTo`
- `search`
- `bookingStatus`
- `paymentStatus`
- `page`
- `limit`

### Admin Update Court Booking Status

`PUT /api/bookings/admin/:id/status`

Auth:

- admin or superadmin

Body:

```json
{
  "status": "APPROVED",
  "adminNote": "Approved by admin"
}
```

### Admin Update Court Booking Payment

`PUT /api/bookings/admin/:id/payment`

Auth:

- admin or superadmin

Body:

```json
{
  "paymentStatus": "PAID"
}
```

## 8. Event Booking APIs

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

Important behavior:

- venue must exist
- past booking is blocked
- invalid time range is blocked
- overlap is blocked
- `can_book=no` is blocked
- defaulter user is blocked

### Get Event Bookings By Date

`GET /api/event-bookings?eventId=1&date=2026-03-18`

Auth:

- logged-in user

### Get My Event Bookings

`GET /api/event-bookings/my`

Auth:

- logged-in user

### Admin Get All Event Bookings

`GET /api/event-bookings/admin/all`

Auth:

- admin or superadmin

Query params:

- `year`
- `month`
- `dateFrom`
- `dateTo`
- `search`
- `bookingStatus`
- `paymentStatus`
- `page`
- `limit`

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

## 9. FAQ APIs

### Get Public FAQs

`GET /api/faqs`

### Get All FAQs For Admin

`GET /api/faqs/admin/all`

Auth:

- admin or superadmin

### Create FAQ

`POST /api/faqs`

Auth:

- admin or superadmin

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

## 10. News APIs

### Get Public News

`GET /api/news`

### Get News Detail

`GET /api/news/:id`

### Get All News For Admin

`GET /api/news/admin/all`

Auth:

- admin or superadmin

### Create News

`POST /api/news`

Auth:

- admin or superadmin

Content type:

- `multipart/form-data`

Fields:

- `heading`
- `content`
- `status`
- `sortOrder`
- `picture`

### Update News

`PUT /api/news/:id`

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

## 11. Slide APIs

### Get Public Slides

`GET /api/slides`

### Get All Slides For Admin

`GET /api/slides/admin/all`

Auth:

- admin or superadmin

### Create Slide

`POST /api/slides`

Auth:

- admin or superadmin

Content type:

- `multipart/form-data`

Fields:

- `title`
- `subtitle`
- `sortOrder`
- `isActive`
- `picture`

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

## 12. Realtime Events

If your web app or another frontend wants live updates, listen for:

- `courts:updated`
- `events:updated`
- `users:updated`
- `faqs:updated`
- `news:updated`
- `slides:updated`
- `bookings:updated`
- `event-bookings:updated`

Recommended frontend behavior:

- receive event
- refetch affected resource
- treat backend as source of truth

## 13. Upload Paths

Uploads are served from:

```text
{BASE_URL}/uploads/...
```

Examples:

- courts: `/uploads/courts/...`
- events: `/uploads/events/...`
- slides: `/uploads/slides/...`
- news: `/uploads/news/...`

## 14. Error Codes

Common API responses:

- `400` = validation or bad request
- `401` = missing/invalid token
- `403` = blocked by permissions or account state
- `404` = record not found
- `409` = duplicate or booking conflict
- `500` = server error

## 15. Suggested Web App Mapping

### Public pages

- home
- login
- register
- forgot password
- FAQs
- news list
- news detail

### User pages

- profile
- change password
- court booking
- event booking
- booking history

### Admin pages

- dashboard
- manage users
- manage courts
- manage events
- manage FAQs
- manage news
- manage slides
- manage court bookings
- manage event bookings
