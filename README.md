# Private Multi-Tenant Website Builder SaaS

This project is a simple Node.js + Express app that serves different websites based on the incoming domain name, but only for domains you explicitly allow.

The app is private by design:

- requests from unapproved domains are blocked
- admin pages require a session login
- create and delete actions are protected

## Security Rules

### 1. Allowed domains only

The server checks `req.headers.host` on every request.

Only domains in this array are allowed:

```js
const allowedDomains = ["yourdomain.com", "localhost"];
```

Update that array in [server.js](/home/isaac/my-builder/server.js:1) before deploying.

- Keep `localhost` for local testing
- Replace `yourdomain.com` with your real domain
- If the host is not allowed, the app returns `403 Forbidden`

### 2. Admin login

The app uses `express-session` for login sessions.

The hardcoded admin account is:

- username: `admin`
- password: `strongpassword123`

The login page is:

```text
/login
```

Protected routes:

- `/admin`
- `POST /admin/sites`
- `POST /admin/sites/:id/delete`
- `POST /logout`

If the user is not logged in, they are redirected to `/login`.

## Features

- Node.js with Express
- SQLite database
- Session-based admin authentication
- Domain restriction middleware
- Admin dashboard to create and delete sites
- Plain HTML rendering

## Database

The app creates a `sites` table automatically on startup with:

- `id`
- `domain`
- `title`
- `description`
- `primaryColor`

The SQLite file is created automatically at `data/sites.db`.

## Project Structure

- [server.js](/home/isaac/my-builder/server.js:1): Express server, sessions, domain restriction, routes
- [db.js](/home/isaac/my-builder/db.js:1): SQLite setup and queries
- [templates.js](/home/isaac/my-builder/templates.js:1): HTML templates for login, admin, errors, and sites

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the login page:

```text
http://localhost:3000/login
```

4. Log in with:

- username: `admin`
- password: `strongpassword123`

5. Open the admin dashboard:

```text
http://localhost:3000/admin
```

6. Create a site using domain:

```text
localhost
```

7. Open:

```text
http://localhost:3000/
```

Because `localhost` is in `allowedDomains`, the request is allowed during local testing.

## How It Works

### Domain restriction

- Every request reads `req.headers.host`
- The server strips the port
- The domain must exist in `allowedDomains`
- If not, the server returns `403 Forbidden`

### Site rendering

- For allowed domains, the app looks up the domain in SQLite
- If a site exists, it renders the site's title, description, and background color
- If no matching site exists, the app returns `Site not found`

### Admin protection

- `/login` shows the login form
- Successful login creates a session
- Admin routes check `req.session.isLoggedIn`
- Logged-out users are redirected back to `/login`

## Deploy

You can deploy this app to platforms that support Node.js and Express, such as:

- Vercel
- Render
- Railway
- Fly.io
- a VPS

## Deployment Steps

1. Push the project to GitHub.
2. Create a new Node.js web service.
3. Use this start command:

```bash
npm start
```

4. Set environment variables:

- `PORT`
- `SESSION_SECRET`

5. Edit `allowedDomains` in [server.js](/home/isaac/my-builder/server.js:1) so it includes only the real domains you want to trust.

Example:

```js
const allowedDomains = ["yourdomain.com"];
```

6. Point your Cloudflare DNS records to the deployed app.
7. Visit `https://yourdomain.com/login`
8. Log in as the admin user.
9. Manage sites from `https://yourdomain.com/admin`

## Cloudflare Notes

If someone visits the raw deployment URL and that host is not in `allowedDomains`, they will get `403 Forbidden`.

That means the Vercel URL or any unapproved hostname cannot be used to access:

- the login page
- the admin dashboard
- site creation
- site deletion
- tenant sites

## Notes

- This version keeps the login simple and beginner-friendly with one hardcoded admin account.
- Sessions are stored in memory, which is fine for a small demo or a single server.
- For production at larger scale, you would move sessions to a shared store such as Redis and stop hardcoding credentials.
