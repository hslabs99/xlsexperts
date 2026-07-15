# XLS Experts

Next.js marketing site for XLS Experts (App Router, TypeScript).

## Local development

```bash
pnpm install
pnpm dev
```

Create a `.env.local` file in the project root (this file is gitignored). Copy variables from `.env.example` as needed.

### SendGrid email (transactional)

Create or update `.env.local` manually:

```env
SENDGRID_API_KEY=SG_REPLACE_WITH_REAL_KEY
SENDGRID_FROM_EMAIL=authenticated-sender@example.com
SENDGRID_FROM_NAME=XLS Experts
CONTACT_NOTIFY_EMAIL=enquiries@example.com
SENDGRID_TEST_RECIPIENT=your-dev-inbox@example.com
```

Replace example values with real ones. **Never commit** `.env.local` or real API keys.

| Variable | Purpose |
| --- | --- |
| `SENDGRID_API_KEY` | Restricted SendGrid API key with Mail Send permission |
| `SENDGRID_FROM_EMAIL` | Verified SendGrid sender address |
| `SENDGRID_FROM_NAME` | Default sender display name |
| `CONTACT_NOTIFY_EMAIL` | Where contact-form enquiries are delivered (optional; defaults to `SENDGRID_FROM_EMAIL`) |
| `SENDGRID_TEST_RECIPIENT` | Recipient for the development test route |

Do not use a `NEXT_PUBLIC_` prefix for any SendGrid credentials. SendGrid is called only from server-side code (`lib/email/`).

### Testing email locally

1. Set the variables above in `.env.local`.
2. Run `pnpm dev`.
3. Either submit the contact form on the site, or call the **development-only** test route:

```bash
curl -X POST http://localhost:3000/api/dev/send-test-email
```

That route is disabled when `NODE_ENV === "production"`. It uses a server-configured recipient only — it does not accept arbitrary recipients or HTML from the browser.

A successful SendGrid response means the message was **accepted by SendGrid**, not that it has already been delivered to the inbox.

### Enquiry email templates (Admin → Email)

Templates are stored in Firestore collection `Email Templates` and edited under **Admin → Email**.

1. Click **Seed defaults** to create Standard + Discovery templates.
2. Edit HTML with the rich editor (bold, underline, fonts, sizes, colour, lists, links).
3. Insert merge tags (prefer `{{name}}` in the HTML editor so TipTap does not strip them).
4. Subject lines may use either `<name>` or `{{name}}`.

Supported tags include: `from`, `name`, `email`, `phone`, `company`, `about`, `concerns`, `Enquiry Type`, `when`, `method`, `day`, `date`, `time`, `hear`.

- **Standard enquiry** → `POST /api/contact` → active **standard** template  
  - Default: **To = client**, **Cc = our email** (`CONTACT_NOTIFY_EMAIL` / `SENDGRID_FROM_EMAIL`)
  - Configurable per template: To/Cc/Bcc as client or our email, plus extra fixed addresses
- **Discovery booking** → `POST /api/booking` → active **discovery** template (default To = our email)

Templates also support default body font family / size, plus per-selection fonts in the HTML editor.

## Deployed application


This project is set up for deployment on Vercel (or any Node host that supports Next.js).

`.env.local` is **not** uploaded to or used by the deployed app. Add the same variables in the hosting platform’s environment / secrets configuration:

```text
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
SENDGRID_FROM_NAME
CONTACT_NOTIFY_EMAIL
```

Redeploy or restart the application after adding or changing environment variables so the new values are picked up.

## SendGrid account setup

1. Create an API key restricted to:
   - **Mail Send: Full Access**
   - **All unrelated permissions: No Access**
2. Ensure `SENDGRID_FROM_EMAIL` is a **verified sender** or belongs to an **authenticated sending domain**.
3. Store the API key only in `.env.local` (local) and the host secrets store (production).

## Architecture notes

- Email sending lives in `lib/email/` (server-only) so it can be extracted for reuse later.
- Contact forms post business data to `POST /api/contact`; the server selects recipient, sender, and template, then calls `sendEmail()`.
- There is no public open-relay endpoint for arbitrary email content.
