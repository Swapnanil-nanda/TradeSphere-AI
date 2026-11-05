# Google Sign‑In Procedure for TradeSphere AI

## Overview
This guide explains how to wire up **Google OAuth 2.0** so that each user’s data (paper‑trading ledger, watchlists, tier, screener presets, research) is tied directly to their Gmail account. The flow integrates with the authoritative **Spring Boot** authentication service and the **Next.js** frontend.

---

## 1️⃣ Create a Google Cloud Project & OAuth Credentials
1. Go to the **Google Cloud Console**: https://console.cloud.google.com/
2. Create a new project (e.g. `TradeSphere-AI-Prod` or `TradeSphere-AI-Dev`).
3. In the navigation menu, choose **APIs & Services → OAuth consent screen**.
   - Set **User Type** to **External**.
   - Fill in the required fields: App name (`TradeSphere AI`), User support email, Developer contact email.
   - Add the scopes: `email`, `profile`, `openid`.
   - Save and continue. If keeping in "Testing" mode during development, add your test Gmail accounts under **Test users**.
4. Navigate to **APIs & Services → Credentials** → **Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: `TradeSphere AI Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (Local Next.js)
     - `https://trade-sphere-ai-git-main-swap-projects1.vercel.app` (Vercel deployment)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for GIS popup/redirect if applicable)
     - `http://localhost:8080/login/oauth2/code/google` (if utilizing server-side OAuth code redirect)
   - Click **Create**. Copy the **Client ID** and **Client Secret**.

---

## 2️⃣ Backend Configuration (Spring Boot)

### 2.1 Environment Variables / Configuration
Add the client credentials to your backend configuration (e.g. `backend-spring/src/main/resources/application.yml` or production environment variables):

```yaml
google:
  client-id: ${GOOGLE_CLIENT_ID}
  client-secret: ${GOOGLE_CLIENT_SECRET}
```

### 2.2 Endpoint Details (`POST /api/auth/google`)
The endpoint is defined in [`AuthController.java`](file:///C:/Users/hello/Desktop/antigravity%20products/TR%20AI/backend-spring/src/main/java/com/tradesphere/modules/auth/AuthController.java):

```http
POST /api/auth/google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "fullName": "Trader Name",
  "googleId": "sub_id_optional",
  "idToken": "google_jwt_optional"
}
```

### 2.3 Account Provisioning Logic (`AuthService.java`)
When a user signs in with Google:
1. It queries `userRepository.findByEmail(request.getEmail().toLowerCase())`.
2. **Existing User**: Returns existing account details and generates a JWT. Existing portfolio balance, orders, custom watchlists, and tier preferences remain preserved.
3. **New User**: 
   - Generates user record linked to `email`.
   - Sets default tier to **`basic`** (or `BASIC` enum).
   - Provisions starting paper capital (`₹10,00,000` default).
   - Generates initial default watchlist (e.g., `Default Watchlist` with NIFTY 50 top liquid stocks).
4. Generates standard stateless JWT containing `userId`, `email`, and `tier` claims.

---

## 3️⃣ Frontend Integration (Next.js)

### 3.1 Public Environment Variable
Add the Google Client ID to `frontend/.env.local` (and Vercel environment variables):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3.2 Google Sign-In Button Integration
In [`frontend/src/app/login/page.tsx`](file:///C:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/login/page.tsx), [`frontend/src/app/register/page.tsx`](file:///C:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/register/page.tsx), and [`AuthRequiredModal.tsx`](file:///C:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/components/AuthRequiredModal.tsx):

Using Google Identity Services (GIS):
```tsx
// Using Google GIS client
window.google?.accounts.id.initialize({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  callback: async (response: { credential: string }) => {
    // Decode base64 payload from Google JWT id_token
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const payload = JSON.parse(jsonPayload);

    // Call Spring Boot backend
    const data = await apiClient.googleLogin({
      email: payload.email,
      fullName: payload.name,
      googleId: payload.sub,
      idToken: response.credential
    });

    if (data?.token) {
      // apiClient handles storing tradesphere_token in localStorage
      window.location.href = '/app';
    }
  }
});
```

### 3.3 State Sync & Auto Token Attachment
- `apiClient` automatically sends `Authorization: Bearer <token>` on all subsequent requests.
- All paper orders, watchlists, screener presets, and portfolio mutations are isolated per authenticated user ID.
- `UserMenu` displays the user's name, Gmail address, and assigned adaptive tier (`BASIC`, `ACTIVE`, `PRO`).

---

## 4️⃣ Verification & Testing Steps

1. **Verify Backend Status**:
   Start Spring Boot backend on port 8080.
2. **Sign In**:
   - Navigate to `/login` or trigger an action in demo mode (e.g., place order or click "+ Watchlist").
   - Click "Sign in with Google".
3. **Inspect LocalStorage**:
   - Confirm `tradesphere_token` is saved in browser storage.
   - Confirm `tradesphere_user` holds the Gmail account details.
4. **Inspect Database / API**:
   - `GET /api/users/me` with the bearer token returns user info with `tier: "basic"`.
   - `GET /api/watchlists` returns the user's isolated watchlist.
   - `POST /api/orders` executes under this specific account ID without leaking to other users.
