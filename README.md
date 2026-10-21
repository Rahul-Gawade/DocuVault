# DocuVault 🗄️✍️
> **Secure Document Sharing & E-Signature Simulator**  
> Built with MERN Stack (React 19 + Tailwind CSS + Node.js/Express + MongoDB)

DocuVault is a full-stack web application designed for freelancers, founders, and small teams who need a fast, reliable, and lightweight way to share contracts, agreements, and forms, collect simulated electronic signatures, and maintain an immutable chronological audit trail.

---

## 🌟 Key Features

### 1. 🔑 Cryptographic Token-Based Sharing
- Recipients access their designated documents through unique, unguessable access tokens (`crypto.randomBytes(32)`).
- **Zero friction:** Recipients can view and sign documents immediately without needing to create or remember account credentials.

### 2. 🖊️ HTML5 Canvas Signature Pad
- High-DPI, retina-scaled canvas drawing with smooth line rendering.
- Full touch and mouse support (works seamlessly on mobile phones, tablets, and desktop).
- Alternative **Type Signature** mode that converts typed legal names into styled calligraphy/cursive script.
- Color choice (Classic Black, Royal Blue, Midnight Navy) and 1-click Clear.

### 3. 📜 Immutable Audit Trail Ledger
- Every critical event is automatically logged into an independent audit collection:
  - `created`: Document uploaded by owner
  - `invited`: Signer invited with generated access token
  - `viewed`: Recipient opened the document via their link (with timestamp & IP)
  - `signed`: Signature submitted and verified
  - `removed`: Signer removed or invitation revoked
- Chronological timeline stepper viewable exclusively by the document owner.

### 4. ⚡ Real-Time Status Computation
- Automatically computes document status:
  - `pending`: No signers have completed signing yet.
  - `partially_signed`: At least one signer has signed, with others pending.
  - `completed`: All designated signers have signed.

---

## 🏛️ System Architecture

```
docuvault/
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/         # Modular UI components
│   │   │   ├── audit/          # Audit timeline stepper
│   │   │   ├── common/         # Navbar, Footer, StatusBadge, Modal
│   │   │   ├── documents/      # DocumentCard, UploadModal, InviteModal
│   │   │   └── signing/        # DocumentViewer, SignaturePad
│   │   ├── context/            # AuthContext.jsx
│   │   ├── hooks/              # useAuth, useDocuments, useSignaturePad, useUploadProgress
│   │   ├── pages/              # LandingPage, DashboardPage, DocumentDetailsPage, SignPage, Auth
│   │   ├── utils/              # api.js fetch client
│   │   ├── App.jsx             # React Router tree
│   │   └── index.css           # Tailwind CSS v4 styling & design tokens
│   └── vite.config.js          # Proxy to backend (:5000)
├── server/                     # Backend Node.js & Express
│   ├── controllers/            # authController, documentController, accessController
│   ├── db/                     # MongoDB connection
│   ├── middleware/             # auth.js, upload.js, errorHandler.js
│   ├── models/                 # User, Document, Recipient, AuditLog
│   ├── routes/                 # auth.js, documents.js, access.js
│   ├── utils/                  # storage.js (Cloudinary + local disk fallback)
│   ├── uploads/                # Local disk document and signature storage
│   ├── server.js               # Express application entry
│   ├── seed.js                 # Sample documents & demo user seed script
│   └── test-api.js             # End-to-end API test suite
├── docs/                       # Project documentation PDF
└── package.json                # Root package scripts
```

---

## 🚀 Quick Start & How to Run

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas (configured in `server/.env`)

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Seed Demo Data (Optional)
```bash
cd server
node seed.js
```
*Creates sample agreements and a pre-configured demo account.*

### 4. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Demo Credentials

- **Email:** `demo.owner@docuvault.io`
- **Password:** `docuvault2026`
*(Or simply click the **"Pre-fill Demo Credentials"** button on the Login page)*

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new document owner (triggers email verification) | Public (Rate-limited) |
| `POST` | `/api/auth/verify-email` | Verify email address using cryptographic token | Public |
| `POST` | `/api/auth/resend-verification` | Resend email verification link | Public (Rate-limited) |
| `POST` | `/api/auth/forgot-password` | Request password reset email | Public (Rate-limited) |
| `POST` | `/api/auth/reset-password` | Reset password using one-time token | Public (Rate-limited) |
| `POST` | `/api/auth/login` | Login and receive JWT | Public (Rate-limited) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & verification status | Bearer JWT |
| `POST` | `/api/documents` | Upload new PDF/Image document | Bearer JWT |
| `GET` | `/api/documents` | List owner's documents (paginated & filtered) | Bearer JWT |
| `GET` | `/api/documents/:id` | Get document details, signers & audit logs | Bearer JWT |
| `DELETE` | `/api/documents/:id` | Delete document and related records | Bearer JWT |
| `POST` | `/api/documents/:id/recipients` | Invite a signer, generate token & send invitation email | Bearer JWT |
| `DELETE` | `/api/documents/:id/recipients/:rId` | Remove a signer invitation | Bearer JWT |
| `GET` | `/api/documents/:id/audit` | Fetch full audit trail for document | Bearer JWT |
| `GET` | `/api/access/:token` | Recipient opens signing link (logs `viewed`) | Public Token |
| `POST` | `/api/access/:token/sign` | Recipient submits signature (logs `signed`) | Public Token (Rate-limited) |

---

## 🛡️ Security & Compliance Highlights
- **Cryptographic tokens:** Prevents URL enumeration and unauthorized document tampering.
- **Audit Trails:** Logs timestamp, signer name, email, and IP address for full accountability.
- **Access Control:** Owners can only access documents they own; recipients can only view/sign the specific document granted by their token.
- **Fail-safe Storage:** Automatically stores files to Cloudinary if API keys exist, or falls back to server local disk storage.