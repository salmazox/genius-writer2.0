# Cloudflare Turnstile Troubleshooting Guide

## Issue: Widget Stuck on "Verifying" and Keeps Reloading

This happens when your domain is not added to Cloudflare Turnstile's allowed domains list.

### Solution

1. **Go to Cloudflare Dashboard**
   - Navigate to https://dash.cloudflare.com/
   - Click on "Turnstile" in the sidebar
   - Click on your site/widget

2. **Add Your Domains**
   - Look for "Domains" section
   - Click "Add Domain"
   - Add ALL domains where your app runs:
     - `localhost` (for local development)
     - `genius-writer.vercel.app` (or your Vercel domain)
     - `geniuswriter.de` (your custom domain)
     - `www.geniuswriter.de` (www subdomain)

3. **Save Changes**
   - Click "Save" or "Update"
   - Changes take effect immediately

4. **Test Again**
   - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
   - Go back to login/signup page
   - Widget should verify successfully

---

## Other Possible Issues

### Issue: Widget Shows "Error" Message

**Possible Causes:**
- Wrong site key
- Network issues
- Cloudflare service interruption

**Solution:**
1. Verify your site key in Vercel environment variables
2. Check browser console (F12) for error messages
3. Try using test keys first

---

### Issue: Form Submits But Returns "Security Verification Failed"

**Possible Causes:**
- Backend secret key doesn't match
- Token expired (Turnstile tokens expire after 5 minutes)
- Backend can't reach Cloudflare API

**Solution:**
1. Check Railway environment variables for `TURNSTILE_SECRET_KEY`
2. Check Railway logs for Turnstile verification errors:
   ```
   [LOGIN] Turnstile verification failed: ...
   [SIGNUP] Turnstile verification failed: ...
   ```
3. Make sure backend can make HTTPS requests to cloudflare.com

---

### Issue: Widget Not Appearing At All

**Possible Causes:**
- Environment variable not set
- Vercel not redeployed after adding env var
- JavaScript error

**Solution:**
1. Visit `/debug-turnstile` page to verify configuration
2. Check browser console (F12) for errors
3. Look for `[TURNSTILE]` log messages in console

---

## Testing with Test Keys

For testing, use Cloudflare's test keys (always pass):

**Frontend (Vercel):**
```
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

**Backend (Railway):**
```
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Test keys don't require domain configuration and always succeed.

---

## Checking Backend Logs

To see if verification is working on the backend:

1. Go to Railway project
2. Click on "Deployments"
3. Click on latest deployment
4. View logs
5. Look for these messages:
   - `[LOGIN] Verifying Turnstile token...`
   - `[LOGIN] Turnstile verification passed`
   - `[LOGIN] Turnstile verification failed: ...`

---

## Browser Console Debugging

Open browser console (F12) and look for:

**Good Messages:**
```
[TURNSTILE] Verification successful
```

**Error Messages:**
```
[TURNSTILE] No site key provided
[TURNSTILE] Failed to load Turnstile script
[TURNSTILE] Verification error
[TURNSTILE] Render error: ...
```

---

## Common Mistakes

1. ❌ **Only adding production domain** - Add localhost too for dev
2. ❌ **Forgetting to redeploy** - Vercel needs redeploy after env var changes
3. ❌ **Site key vs Secret key** - Site key goes to frontend, Secret key to backend
4. ❌ **Using HTTP instead of HTTPS** - Turnstile requires HTTPS in production
5. ❌ **Wrong environment** - Make sure env vars are set for the right environment (Production/Preview/Development)

---

## Still Having Issues?

1. Try test keys first to verify the integration works
2. Check all domains are added in Cloudflare
3. Verify environment variables are correct
4. Check browser and backend logs
5. Try in incognito/private mode to rule out browser extensions
