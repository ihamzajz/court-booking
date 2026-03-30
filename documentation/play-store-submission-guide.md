# BookFlow Play Store Submission Guide

Last updated: March 30, 2026

## Purpose

This document summarizes the production URLs, backend requirements, app configuration, and Google Play Console steps needed to submit BookFlow to the Play Store.

## Production URLs

After deploying the backend on your real HTTPS domain, the following public URLs must be available:

- Privacy Policy: `https://your-domain.com/privacy-policy`
- Account Deletion Page: `https://your-domain.com/account-deletion`
- Health Check: `https://your-domain.com/health`

Example:

- If your backend is deployed at `https://api.bookflowapp.com`, then use:
- `https://api.bookflowapp.com/privacy-policy`
- `https://api.bookflowapp.com/account-deletion`
- `https://api.bookflowapp.com/health`

## Backend Routes That Must Stay Live

These routes are now part of the submission/compliance flow:

- `GET /privacy-policy`
- `GET /account-deletion`
- `POST /account-deletion`
- `GET /health`
- `DELETE /api/auth/me`

## Required Production Environment Variables

The backend must have these variables configured in production:

- `NODE_ENV=production`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `SUPPORT_EMAIL`

Optional but recommended:

- `APP_NAME`
- `PRIVACY_CONTACT_NAME`
- `UPLOADS_DIR`
- `PORT`

## App Configuration Already Added

The project now includes release-related app configuration in `frontend/app.json`:

- Android package name
- Android version code
- iOS bundle identifier
- iOS build number
- Runtime version policy
- Image picker permission text

Current values:

- Android package: `com.medicslabs.bookflow`
- Android versionCode: `1`
- iOS bundleIdentifier: `com.medicslabs.bookflow`
- iOS buildNumber: `1.0.0`

Before every new Play submission:

- Increase `android.versionCode`
- Increase app version if needed
- Keep identifiers stable once published

## Privacy Policy Requirements

Before submission:

- Deploy the privacy policy page on the production backend
- Make sure it opens without login
- Make sure `SUPPORT_EMAIL` is set to a real monitored email address
- Verify the contact details shown on the policy page are correct

Use this URL in Play Console:

- `https://your-domain.com/privacy-policy`

## Account Deletion Requirements

Google Play requires:

- An in-app way for users to request account deletion
- A public web resource for users to request account deletion

BookFlow now supports both:

- In-app deletion from the Profile screen
- Public web deletion form at `/account-deletion`

Use this URL in Play Console:

- `https://your-domain.com/account-deletion`

## Google Play Console Checklist

### 1. App Access

- If the app requires login, provide reviewers with a working test account
- Make sure the review account can access the main app flow
- If admin review is needed, provide an admin test account separately

### 2. Privacy Policy

- Paste the live privacy policy URL in Play Console
- Confirm it is public and accessible without login

### 3. Account Deletion

- Paste the live account deletion URL in Play Console
- Keep the in-app deletion option enabled

### 4. Data Safety Form

Declare the data your app collects and uses, including:

- Name
- Email address
- Username
- Optional club/member number
- Booking/activity history
- Admin-uploaded media if applicable to the app experience

Answer the form based on your real deployed behavior, not assumptions.

### 5. Release Build

- Build a release AAB/APK
- Verify the final artifact is signed correctly
- Verify the final Android build meets current Play target API requirements
- Confirm the app opens and works in release mode, not just development mode

### 6. Support Contact

- Make sure `SUPPORT_EMAIL` is real and monitored
- Use the same support contact in Play Console if appropriate

### 7. Final Functional Test

Before submitting, test all of the following on a release build:

- Register
- Login
- Password change
- Self account deletion
- Web account deletion request form
- Court booking
- Event booking
- Booking history
- Admin review/update flows
- Privacy policy URL
- Health check URL

## Suggested Release Verification Steps

1. Deploy backend to production domain.
2. Set all required production env vars.
3. Open and verify:
   - `/privacy-policy`
   - `/account-deletion`
   - `/health`
4. Submit a sample deletion request from the public web form.
5. Confirm the request is stored in the database.
6. Build the Android release artifact.
7. Upload the artifact to an internal testing track first.
8. Verify the full user flow on the internal testing build.
9. Complete Play Console forms.
10. Submit for review.

## Important Notes

- No one can guarantee Play approval in advance.
- Approval depends on the deployed URLs, release artifact, Play Console declarations, and reviewer validation.
- From the codebase side, the main compliance paths are now implemented.
- Forgot-password and OTP recovery are intentionally removed from the current app flow and are not required for Play submission.

## Useful Policy References

- Google Play account deletion policy:
  `https://support.google.com/googleplay/android-developer/answer/13327111?hl=en`
- Google Play target API requirement:
  `https://developer.android.com/google/play/requirements/target-sdk`
- Google Play permissions and sensitive information policy:
  `https://support.google.com/googleplay/android-developer/answer/9888170?hl=en`
