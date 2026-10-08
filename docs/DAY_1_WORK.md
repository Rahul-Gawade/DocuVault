# Day 1: Project Setup, Authentication & Document Upload

## Overview
Day 1 focused on laying the foundation of DocuVault, including backend architecture, database connectivity with MongoDB Atlas, user authentication with JWT and bcrypt, file upload handling with Multer and Cloudinary, route protection, and security hygiene.

---

## 1. What Was Done

### A. Environment & Module Architecture Alignment
* **Unified Module System**: Standardized on CommonJS (`require` / `module.exports`) across the entire backend, removing `"type": "module"` from `server/package.json` to prevent module syntax mismatch errors.
* **Server Entry Point (`server.js`)**:
  * Set up Express application with `cors` and `express.json({ limit: '2mb' })`.
  * Connected routes: `/api/health`, `/api/auth`, `/api/documents`.
  * Mounted custom centralized error handling middleware.
  * Connected MongoDB database before starting the HTTP server on `process.env.PORT`.

### B. Database Configuration (`db/db.js`)
* Configured Mongoose to connect using `MONGO_URI` from `.env`.
* Added public DNS fallback (`8.8.8.8`, `1.1.1.1`) to resolve MongoDB Atlas SRV connection queries on Windows network environments.

### C. Models
* **`models/User.js`**:
  * Schema storing `name`, `email` (unique, lowercase, trimmed), and `passwordHash`.
  * Automatic timestamps (`createdAt`, `updatedAt`).
* **`models/Document.js`**:
  * Schema with `ownerRef` referencing `User` (indexed for high-performance multi-tenant filtering).
  * Fields: `title`, `fileUrl`, `publicId`, `fileType`, `fileSize`, `status` (`pending`, `partially_signed`, `completed`).
* **`models/AuditLog.js` & `models/Recipient.js`**:
  * Normalized to CommonJS for upcoming Day 2 recipient signing flows and audit tracking.

### D. Middleware & Utilities
* **`middleware/errorHandler.js`**:
  * Centralized error handler catching Multer size/type errors (`400`), file validation errors (`400`), Mongoose `CastError` (`400 Invalid ID`), and standard server exceptions (`500`).
* **`middleware/upload.js`**:
  * Configured Multer with `memoryStorage()` (keeps uploaded file buffers in memory for direct streaming to Cloudinary and Day 3 AI processing without persisting to local disk).
  * Enforced 10 MB file limit.
  * File filter allowing only PDF (`application/pdf`), PNG (`image/png`), and JPG (`image/jpeg`).
* **`middleware/auth.js`**:
  * JWT verification middleware extracting `Bearer <token>` from the `Authorization` header.
  * Injects `req.userId` onto the request object for protected routes.
* **`utils/cloudinary.js`**:
  * Initialized Cloudinary SDK with environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
* **`utils/uploadToCloudinary.js`**:
  * Stream uploader using `cloudinary.uploader.upload_stream` targeting folder `docuvault` with `resource_type: 'auto'`.

### E. Controllers & Routes
* **Authentication (`controllers/authController.js` & `routes/auth.js`)**:
  * `POST /api/auth/register`: Validates user inputs, checks for existing email, hashes password with `bcryptjs` (salt rounds: 10), and returns user details with a 7-day JWT token.
  * `POST /api/auth/login`: Verifies user email existence and compares passwords using bcrypt; generates a new JWT token upon success.
* **Document Management (`controllers/documentController.js` & `routes/documents.js`)**:
  * `POST /api/documents`: Protected upload endpoint receiving `multipart/form-data` with `file` and optional `title`. Streams file to Cloudinary and saves Document record in MongoDB.
  * `GET /api/documents`: Protected endpoint listing current user's documents with pagination (`page`, `limit`) and status filtering (`?status=pending`).
  * `GET /api/documents/:id`: Protected endpoint retrieving a single document, scoped strictly to `{ _id, ownerRef: req.userId }` so users cannot access each other's documents.

---

## 2. Errors Encountered & How They Were Resolved

### Error 1: ES Modules vs. CommonJS Incompatibility
* **Symptom**: `package.json` contained `"type": "module"`, but core server files used `require()` and `module.exports`, while some model files used `import` and `export default`. This causes runtime exceptions:
  ```text
  ReferenceError: require is not defined in ES module scope
  # or
  SyntaxError: Cannot use import statement outside a module
  ```
* **Resolution**:
  1. Removed `"type": "module"` from `server/package.json`.
  2. Converted `db/db.js`, `models/Document.js`, `models/AuditLog.js`, and `models/Recipient.js` to standard CommonJS `module.exports`.

### Error 2: MongoDB Atlas SRV DNS Lookup Failure (`querySrv ECONNREFUSED`)
* **Symptom**: When attempting to connect to MongoDB Atlas, Node.js threw:
  ```text
  DB error: querySrv ECONNREFUSED _mongodb._tcp.docuvault.lfm8shh.mongodb.net
  ```
* **Cause**: On Windows systems, local ISP/router DNS servers often fail or reject DNS `SRV` record queries needed by `mongodb+srv://` URIs.
* **Resolution**: Added a public DNS resolver fallback directly inside `server/db/db.js`:
  ```javascript
  const dns = require('dns');
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
  ```
  This immediately allowed successful DNS resolution and connected to MongoDB Atlas.

### Error 3: Environment Variable Placeholders
* **Symptom**: `MONGO_URI` in `.env` contained `<db_password>` and lacked the database name parameter.
* **Resolution**: Replaced placeholder with the actual database credentials, configured the database name `docuvault`, and set a secure `JWT_SECRET`.

### Error 4: Git Uninitialized & Gitignore Safety
* **Symptom**: The workspace was not initialized as a git repository (`fatal: not a git repository`). There was a risk of `.env` leaking credentials into GitHub if committed directly.
* **Resolution**:
  1. Initialized repository (`git init`).
  2. Created both root `.gitignore` and `server/.gitignore` containing `node_modules`, `.env`, and `uploads`.
  3. Ran `git status --ignored` to verify `.env` was ignored prior to staging and committing.

---

## 3. Test Verification Results

An automated test suite was executed against the live server endpoints:

| # | Endpoint / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | `GET /api/health` | `200 { ok: true }` | `200 { ok: true }` | PASSED |
| 2 | `POST /api/auth/register` (new user) | `201` + JWT token + user info | `201` + token received | PASSED |
| 3 | `POST /api/auth/register` (duplicate email) | `409` conflict error | `409` conflict returned | PASSED |
| 4 | `POST /api/auth/login` (wrong password) | `401` unauthorized | `401` unauthorized returned | PASSED |
| 5 | `GET /api/documents` (no JWT token) | `401` unauthorized | `401` rejected without token | PASSED |
| 6 | `GET /api/documents` (valid JWT token) | `200` with user's doc list | `200` returned documents array | PASSED |

---

## 4. Git Commit Details
* **Commit Message**: `Day 1: auth + document upload`
* **Commit Hash**: `e124ecc`
* **Status**: Clean working tree, `.env` strictly ignored.
