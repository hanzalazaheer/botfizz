# Security Documentation

## Table of Contents

- [Environment Variables Checklist](#environment-variables-checklist)
- [First-Deployment Security Checklist](#first-deployment-security-checklist)
- [Security Audit Commands](#security-audit-commands)
- [Security Configurations](#security-configurations)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Dependency Security Notes](#dependency-security-notes)

---

## Environment Variables Checklist

| Variable | Required | Security Notes |
|----------|----------|----------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Use SSL in production. Never use superuser credentials — create a dedicated app user with minimal privileges (SELECT, INSERT, UPDATE, DELETE). |
| `SESSION_SECRET` | **Yes** | Must be at least **32 characters** in production. Use a cryptographically random string: `openssl rand -base64 48` |
| `APP_URL` | **Production** | Your application's public URL. Used for CORS validation and email links. |
| `CORS_ORIGINS` | **Production** | Comma-separated list of allowed origins. Must not be `*` in production. Example: `https://yourdomain.com,https://app.yourdomain.com` |
| `NODE_ENV` | **Production** | Must be `production` in production. Controls secure cookies, error verbosity, and SSL enforcement. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Optional | Email delivery for OTP/notifications. Use app-specific passwords, never your main email password. |
| `REDIS_URL` | Optional | If provided, Socket.IO uses Redis adapter for multi-instance support. |
| `STRIPE_SECRET_KEY` | Optional | Payment provider secret. Never expose in client-side code. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional | Payment provider credentials. Store only in environment variables. |
| `OPENAI_API_KEY` | Optional | AI provider key. Monitor usage to detect unauthorized access. |
| `DATABASE_SSL` | Optional | Set to `true` to enable SSL for non-production database connections. |
| `SESSION_MAX_AGE_MS` | Optional | Session lifetime in milliseconds. Default: `86400000` (24 hours). |

---

## First-Deployment Security Checklist

### Critical — Do BEFORE going live

- [ ] **Change default credentials** — The seed creates two accounts with known passwords:
  - `superadmin` / `Superadmin@123`
  - `demoadmin` / `Admin@123`
  - **Change these immediately** via the admin panel or directly in the database.

- [ ] **Generate a strong SESSION_SECRET**:
  ```bash
  openssl rand -base64 48
  ```

- [ ] **Set `NODE_ENV=production`** — This enables:
  - Secure cookies (`secure: true`)
  - SSL-enforced database connections (`rejectUnauthorized: true`)
  - Generic error messages (no stack traces to clients)
  - Environment variable validation

- [ ] **Configure CORS_ORIGINS** — Set to your actual domain(s). Never use `*` in production.

- [ ] **Enable HTTPS** — Use nginx with TLS certificates (see `nginx.conf.example`).

- [ ] **Configure database user privileges** — Create a dedicated PostgreSQL user:
  ```sql
  CREATE USER app_user WITH PASSWORD 'strong-random-password';
  GRANT CONNECT ON DATABASE yourdb TO app_user;
  GRANT USAGE ON SCHEMA public TO app_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
  -- Do NOT grant SUPERUSER, CREATEDB, CREATEROLE
  ```

- [ ] **Remove or disable the `demoadmin` account** after setup.

- [ ] **Configure payment webhook secrets** — Set webhook signing secrets for Stripe, Razorpay, etc. in the payment provider settings.

### Recommended

- [ ] Set up log rotation for application and nginx logs
- [ ] Enable `fail2ban` or similar for SSH and nginx rate limiting
- [ ] Configure automated database backups
- [ ] Set up uptime monitoring and alerting
- [ ] Review and test the nginx configuration: `nginx -t`

---

## Security Audit Commands

### Dependency vulnerability scan
```bash
# Check for known vulnerabilities in dependencies
npm audit

# Auto-fix vulnerabilities where possible
npm audit fix

# Force-fix (may introduce breaking changes — test afterwards)
npm audit fix --force

# Generate a detailed audit report
npm audit --json > audit-report.json
```

### TypeScript type checking
```bash
npx tsc --noEmit
```

### Codebase security patterns scan
```bash
# Check for raw error objects leaked to clients
grep -rn 'error,' server/controllers/ server/routes/ | grep '\.json' | grep -v "error:" | grep -v "//"

# Check for Math.random (should use crypto.randomInt)
grep -rn 'Math.random' server/

# Check for sql.raw with user input
grep -rn 'sql\.raw' server/

# Check for unprotected admin routes
grep -rn '/api/admin' server/routes/ | grep -v 'requireRole\|requireAuth\|import\|//'

# Check for client-supplied userId usage
grep -rn 'req\.body\.userId\|req\.params\.userId' server/controllers/
```

---

## Security Configurations

### Session Management
| Setting | Value |
|---------|-------|
| Session store | PostgreSQL (`connect-pg-simple`) |
| Cookie name | `_app_session` |
| Cookie `secure` | `true` in production |
| Cookie `httpOnly` | `true` (always) |
| Cookie `sameSite` | `strict` |
| Default max age | 24 hours (`86400000` ms) |

### Rate Limiting
| Layer | Configuration |
|-------|--------------|
| **Nginx** (API) | 30 requests/minute per IP, burst 20 |
| **Nginx** (Auth) | 10 requests/minute per IP |
| **App-level** | Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` env vars |
| **Login** | 10 failed attempts → 30-minute lockout per username |
| **OTP requests** | 5 per hour per email address |
| **OTP verification** | 10 attempts per IP+email → all OTPs invalidated |

### HTTP Security Headers
Applied via `helmet` middleware and nginx:
- `X-Frame-Options: DENY` (API) / `SAMEORIGIN` (nginx)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (configured in helmet)
- `X-Powered-By` header removed

### Authentication
- Passwords hashed with `bcrypt` (10 rounds)
- OTPs generated with `crypto.randomInt` (cryptographically secure)
- OTPs expire after 10 minutes
- OTPs are single-use (deleted from database after verification)
- Login errors use generic messages to prevent username enumeration
- Forgot-password responses don't reveal whether an email exists

---

## Reporting Vulnerabilities

If you discover a security vulnerability in this application:

1. **Do NOT** open a public GitHub issue
2. Email the security team at the contact address configured in your deployment
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)
4. Allow reasonable time for a fix before public disclosure

---

## Dependency Security Notes

### Local package: `@botfizz/core`
This package is loaded from `file:packages/botfizz-core` (local workspace). This is normal for monorepo architectures and is **not** a supply-chain risk — it's part of the project source code.

### Key dependencies and their roles
| Package | Purpose | Security Note |
|---------|---------|---------------|
| `bcryptjs` | Password hashing | ✅ Well-established, no known issues |
| `helmet` | HTTP security headers | ✅ Industry standard |
| `express-session` + `connect-pg-simple` | Session management | ✅ Server-side sessions in PostgreSQL |
| `jsonwebtoken` / `jws` | JWT handling | Ensure secrets are strong |
| `nodemailer` | Email delivery | Use TLS-enabled SMTP |
| `stripe` / `razorpay` / `mercadopago` | Payment processing | Always verify webhook signatures |
| `openai` | AI integration | Monitor API key usage |
| `multer` | File uploads | File type filtering is configured |
| `sharp` | Image processing | Keep updated (has had CVEs) |
| `cheerio` | HTML parsing | Used for web scraping in training — sanitize output |

### Recommended periodic maintenance
```bash
# Check for outdated packages
npm outdated

# Run security audit
npm audit

# Update packages (minor/patch only — safe)
npm update

# Check for major version updates (review changelogs first)
npx npm-check-updates
```
