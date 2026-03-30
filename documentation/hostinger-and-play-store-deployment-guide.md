# BookFlow Hostinger And Play Store Deployment Guide

Last updated: March 30, 2026

## Purpose

This guide is for your exact deployment plan:

- Host the backend on Hostinger
- Replace `http://localhost:5000` with a real backend domain such as `https://api.example.com`
- Update the React Native app to use that live backend URL
- Prepare the app for Google Play Store submission

This document is written as a practical checklist so you can follow it while watching deployment tutorials.

## Your Deployment Plan In Simple Words

Right now:

- Backend runs locally on `http://localhost:5000`
- Frontend app uses `EXPO_PUBLIC_API_BASE_URL` from env

Later in production:

- Backend will run on Hostinger
- Backend public domain will be something like `https://api.example.com`
- Frontend app will call `https://api.example.com`

You do not need to rewrite routes.

You only need to:

- host the backend
- point your domain to it
- set backend env values
- change the frontend API base URL
- rebuild the React Native app for release

## Important Production URLs

After backend deployment, these must work publicly:

- `https://api.example.com/health`
- `https://api.example.com/privacy-policy`
- `https://api.example.com/account-deletion`

These are important because:

- `/health` confirms backend/server/database are working
- `/privacy-policy` is needed for Play Store
- `/account-deletion` is needed for Play Store account deletion policy

## Part 1: Backend Deployment On Hostinger

### 1. Buy Or Use A Domain

Example:

- main domain: `example.com`
- API subdomain: `api.example.com`

Recommended:

- keep frontend/site and backend/API separate
- use `api.example.com` for backend

### 2. Point Your Domain To Hostinger

Inside Hostinger, create or use a subdomain:

- `api.example.com`

Then connect it to your backend hosting setup.

If Hostinger asks for:

- A record
- CNAME record
- VPS IP
- Node app setup

follow their tutorial, but the goal is always the same:

- opening `https://api.example.com` should reach your Node backend

### 3. Upload Backend Project

You need the `backend` project on the server.

Important backend files:

- [server.js](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/backend/server.js)
- [package.json](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/backend/package.json)
- [mysql-schema.sql](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/backend/mysql-schema.sql)

### 4. Install Backend Dependencies On Server

After uploading the backend, run:

```powershell
npm install
```

Or if your Hostinger tutorial uses deployment automation, let it install dependencies during deploy.

### 5. Create Production Backend `.env`

Your production backend `.env` should contain real values.

Example:

```env
NODE_ENV=production
PORT=5000

DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=court_booking

JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters

CORS_ORIGIN=https://your-frontend-domain.com
SUPPORT_EMAIL=support@example.com

APP_NAME=BookFlow
PRIVACY_CONTACT_NAME=BookFlow Support
```

Notes:

- `JWT_SECRET` should be long and private
- `SUPPORT_EMAIL` must be real for Play Store readiness
- `CORS_ORIGIN` must be your frontend/mobile web origin if applicable
- If you later host a web frontend, add that frontend domain here

### 6. Set Up Database

Create the MySQL database on Hostinger, then import:

- [mysql-schema.sql](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/backend/mysql-schema.sql)

After that, run the backend.

The backend also auto-checks and creates some tables/columns at startup, but you should still import the schema first.

### 7. Start Backend

Typical command:

```powershell
npm start
```

If Hostinger uses PM2 or app manager, follow their method, but the backend command is still based on:

```powershell
node server.js
```

### 8. Confirm Backend Works

Open these URLs:

- `https://api.example.com/health`
- `https://api.example.com/privacy-policy`
- `https://api.example.com/account-deletion`

Expected results:

- `/health` returns JSON
- `/privacy-policy` shows the public privacy policy page
- `/account-deletion` shows the public deletion request form

If the policy page still shows `support@example.com`, your `SUPPORT_EMAIL` is not set correctly.

## Part 2: Frontend URL Change

Your app already reads the API host from:

- [api.js](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/frontend/src/config/api.js)

It uses:

- `EXPO_PUBLIC_API_BASE_URL`

### Local Development Example

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Production Example

```env
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

So yes, your idea is correct:

- today you use localhost
- later you host backend
- then you replace the base URL with `https://api.example.com`
- then rebuild the app

Important:

- do not keep localhost in the production app build
- Play Store app must call a real public HTTPS backend

## Part 3: Privacy Policy And Account Deletion

Google Play needs public URLs for these.

Your backend already serves them:

- `/privacy-policy`
- `/account-deletion`

Final production URLs for Play Console:

- `https://api.example.com/privacy-policy`
- `https://api.example.com/account-deletion`

Also required:

- in-app account deletion remains available in the Profile screen
- web deletion page remains public without login

## Part 4: React Native / Expo Release Preparation

Your app config is in:

- [app.json](/c:/Users/muhammad.hamza/OneDrive%20-%20Medics%20Laboratories%20Pvt%20Ltd/Desktop/court-booking/frontend/app.json)

Already configured:

- Android package name
- Android version code
- iOS bundle identifier
- iOS build number
- runtime version policy

Before every new Play submission:

- increase `android.versionCode`
- increase app `version` if needed

Example:

- first release: `versionCode: 1`
- next update: `versionCode: 2`
- next update: `versionCode: 3`

Do not decrease it after publishing.

## Part 5: What You Must Do Before Building The Release App

### Backend checklist

- Buy or configure domain
- Host backend on Hostinger
- Set backend `.env`
- Import MySQL schema
- Start backend successfully
- Confirm `/health` works
- Confirm `/privacy-policy` works
- Confirm `/account-deletion` works

### Frontend checklist

- Change `EXPO_PUBLIC_API_BASE_URL` to `https://api.example.com`
- Make sure the app can login/register against the live API
- Make sure image uploads work from the live app
- Make sure delete-account works in app

## Part 6: What To Test On The Live Backend Before Play Submission

Test these with the production backend:

- register
- login
- session restore
- password change
- self delete account
- submit web deletion request
- court booking
- event booking
- history screen
- admin manage users
- admin process deletion requests
- privacy policy URL
- account deletion URL

## Part 7: What To Put In Google Play Console

### Privacy Policy URL

Use:

- `https://api.example.com/privacy-policy`

### Account Deletion URL

Use:

- `https://api.example.com/account-deletion`

### App Access

If reviewers need login, provide a working test account.

Recommended:

- one normal user account
- one admin account if admin flows need review

### Data Safety

Declare the data the app actually collects and uses, such as:

- name
- email
- username
- optional member number / CM number
- booking activity
- admin-uploaded images if used in production

Answer honestly based on your real app behavior.

## Part 8: Localhost vs Production

### Localhost is only for development

Examples:

- `http://localhost:5000`
- `http://192.168.x.x:5000`

These are okay only during testing.

### Production must use a real HTTPS domain

Example:

- `https://api.example.com`

This is what the released app should use.

If you change the URL in env but do not rebuild the app, the installed release app may still use the old value. So after changing to production URL, build the release version again.

## Part 9: What You Still Need To Learn From Tutorials

You said you will watch tutorials, which is fine. These are the tutorial topics you actually need:

- how to host a Node.js app on Hostinger
- how to connect a subdomain like `api.example.com`
- how to create production `.env` values
- how to import a MySQL database
- how to build an Expo/React Native Android release app
- how to upload an AAB to Google Play Console

Even if the tutorial uses a different app, your logic is still:

1. deploy backend
2. connect domain
3. test API URLs
4. change frontend API base URL
5. build release app
6. upload to Play Console

## Part 10: Recommended Release Order

Follow this order:

1. Finish backend deployment on Hostinger
2. Make `https://api.example.com/health` work
3. Make `https://api.example.com/privacy-policy` work
4. Make `https://api.example.com/account-deletion` work
5. Change frontend `EXPO_PUBLIC_API_BASE_URL`
6. Test app against live backend
7. Increase Android version code if needed
8. Build release app
9. Fill Play Console forms
10. Submit to internal testing first
11. Submit to production review

## Part 11: Common Mistakes To Avoid

- leaving frontend pointed to localhost
- forgetting to rebuild app after changing env
- not setting `SUPPORT_EMAIL`
- using HTTP instead of HTTPS in production
- forgetting to test privacy policy and account deletion pages publicly
- not increasing Android `versionCode` for updates
- submitting before testing login and delete-account flow on live backend

## Part 12: Final Summary

Your plan is correct.

You do not need to redesign the app for production.

You mainly need to:

- host backend on Hostinger
- use a real domain like `api.example.com`
- change frontend API base URL to that domain
- rebuild the app
- use the public privacy policy and account deletion URLs in Play Console

Once that is done, your project structure supports this deployment model.
