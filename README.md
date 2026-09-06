# NFC Digital Business Card SaaS Platform

A production-ready SaaS platform built on Next.js 15 App Router, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL. The platform enables customers to manage digital contact profiles and link physical NFC cards via secure, dynamic URLs.

## IMPORTANT ARCHITECTURE RULE
The physical NFC chip contains **ONLY** a secure URL pointing to the customer's digital profile (e.g., `https://yourdomain.com/c/8fK29Lm`). Personal/business information is queried dynamically on the server, meaning physical cards never require reprogramming when profiles are updated.

---

## Technical Stack & Architecture

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT Cookies Session Architecture
- **Localization**: English + Arabic RTL support (i18n context layer)

---

## File Structure

```
nfc-card-saas/
├── prisma/
│   ├── schema.prisma      # 24 relational models (User, Org, Profile, Card, etc.)
│   └── seed.ts            # Seed script for initial database setup
├── src/
│   ├── app/
│   │   ├── (marketing)/   # Landing and pricing pages
│   │   ├── auth/          # Login, Register, Forgot Password
│   │   ├── dashboard/     # User metrics, profile editors, card manager
│   │   ├── c/             # Dynamic NFC router resolver ([token])
│   │   └── api/           # Backend JSON APIs (Auth, NFC, Profiles)
│   ├── lib/
│   │   ├── db.ts          # Database client
│   │   ├── i18n.tsx       # English / Arabic switcher & RTL toggle
│   │   ├── auth/          # Sessions & guards
│   │   └── nfc/           # NfcWriter hardware abstraction
│   └── locales/
│       ├── en.json        # English text strings
│       └── ar.json        # Arabic translation file
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database instance

### 2. Environment Setup
Copy the example environment file and set your credentials:
```bash
cp .env.example .env
```
Fill in the `DATABASE_URL` and `NEXTAUTH_SECRET` inside `.env`.

### 3. Database Initialization & Seed
Generate the Prisma Client and migrate the schema:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Populate the database with seed data (Admin, Customers, Templates, Plans, Products, Cards):
```bash
npx prisma db seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the localized landing page.

---

## NFC Provisioning Workflow

```mermaid
sequenceDiagram
    Admin ->> Web Interface: Clicks "Write Card"
    Web Interface ->> NfcWriter Abstraction: Invokes writeUrl(url)
    NfcWriter Abstraction ->> Browser / Web NFC: Program NDEF URI record (e.g. /c/8fK29Lm)
    NfcWriter Abstraction ->> /api/cards/:id/nfc/write: Logs programmed event
    Note over /api/cards/:id/nfc/write: Sets Card status to PROVISIONED
    Admin ->> Web Interface: Clicks "Verify Card"
    Web Interface ->> /api/cards/:id/nfc/verify: Validates write integrity
    Note over /api/cards/:id/nfc/verify: Promotes Card status to ACTIVE
```

---

## API Documentation

### Authentication APIs
*   `POST /api/auth/register` - Create customer account.
*   `POST /api/auth/login` - Authenticate user credentials & set HTTP-only cookie.
*   `POST /api/auth/logout` - Clear JWT authentication cookie.
*   `GET /api/auth/me` - Retrieve current session details.

### Card Provisioning APIs
*   `POST /api/cards/:id/nfc/write` - Record an NFC write attempt.
*   `POST /api/cards/:id/nfc/verify` - Confirm programmed URL and activate card.

### Profile Exporters
*   `GET /api/profiles/:id/vcard` - Download a standard `.vcf` vCard contact card.

---

## Security Notes

1. **Role-Based Access Control (RBAC)**: All administrative routes and APIs verify the active JWT session payload role (e.g. `SUPER_ADMIN`, `ADMIN`). Customer profiles are locked to respective resource ownership IDs.
2. **Dynamic Redirections**: Public card links query active state attributes. Suspended tokens redirect to a warning interface, and unassigned tokens offer active provisioning links.
3. **Database Queries**: SQL injection prevention is guaranteed through Prisma parameters binding. Password hashes are protected with bcrypt (rounds = 10).
