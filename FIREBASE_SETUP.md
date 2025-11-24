# Firebase Google Authentication Setup Guide

This guide will walk you through setting up Firebase Google Authentication for your Text Momentum app.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Once created, you'll be taken to the project dashboard

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web** icon (`</>`) to add a web app
2. Give your app a nickname (e.g., "Text Momentum Web")
3. **Check** the "Also set up Firebase Hosting" option (optional but recommended)
4. Click "Register app"
5. You'll see your Firebase configuration object - **save these values**, you'll need them in Step 5

## Step 3: Enable Google Authentication

1. In the Firebase Console, go to **Authentication** in the left sidebar
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Click on **Google** in the providers list
5. Toggle the **Enable** switch
6. Set a **Project public-facing name** (e.g., "Text Momentum")
7. Choose a **Support email** from the dropdown
8. Click **Save**

## Step 4: Configure OAuth Consent Screen (for Google Calendar)

Since you want to add Google Calendar integration later, you need to set up the OAuth consent screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (it should appear in the project dropdown)
3. Go to **APIs & Services** > **OAuth consent screen**
4. Choose **External** user type
5. Fill in the required fields:
   - App name: "Text Momentum"
   - User support email: your email
   - Developer contact information: your email
6. Click **Save and Continue**
7. On the **Scopes** page, click **Add or Remove Scopes**
8. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
9. Click **Save and Continue**
10. Add test users (your email) for testing
11. Click **Save and Continue**

## Step 5: Add Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration values from Step 2.

## Step 6: Configure Authorized Domains

1. In the Firebase Console, go to **Authentication** > **Settings** tab
2. Scroll down to **Authorized domains**
3. By default, `localhost` is already authorized for development
4. When you deploy to production, add your production domain here

## Step 7: Test Your Setup

1. Make sure your `.env.local` file is configured correctly
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)
4. Click "Continue with Google"
5. You should see the Google sign-in popup
6. Sign in with your Google account
7. You should be redirected back to your app, now authenticated!

## Troubleshooting

### "This app isn't verified" warning
This is normal during development. Click "Advanced" > "Go to [App Name] (unsafe)" to continue.

### "Access blocked: Authorization Error"
Make sure you've added your email as a test user in the OAuth consent screen (Step 4).

### "Firebase: Error (auth/unauthorized-domain)"
Add your domain to the authorized domains list in Firebase Authentication settings.

### Can't see user data after sign-in
Check your browser console for errors. Make sure all environment variables are set correctly and the dev server was restarted.

## Next Steps: Google Calendar Integration

The authentication is already configured to request Google Calendar scopes. When a user signs in, the access token is stored in localStorage as `google_access_token`.

To use it:

```typescript
const accessToken = localStorage.getItem('google_access_token');

// Use this token to make Google Calendar API calls
fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

You'll need to:
1. Enable the Google Calendar API in the Google Cloud Console
2. Create API endpoints to interact with Google Calendar
3. Handle token refresh (tokens expire after 1 hour)

---

## Firebase Console Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)

