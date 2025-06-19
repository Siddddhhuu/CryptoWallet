# Crypto Wallet Application

A full-stack cryptocurrency wallet application built with React, Node.js, Express, and MongoDB.  
Includes a browser extension for seamless wallet access.

---

## Features

- User authentication (register/login)
- Create/import Ethereum wallet (mnemonic-based)
- View wallet address and balance
- Send ETH transactions
- View transaction history
- Secure private key management (never sent to backend)
- Modern UI with Material-UI
- Browser extension popup for wallet access

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd crypto-wallet
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Create a `.env` file in the `server/` directory:**
   ```
   MONGODB_URI=mongodb://localhost:27017/crypto-wallet
   JWT_SECRET=your-secret-key
   ETHEREUM_NODE_URL=http://localhost:8545
   ```

4. **Start the development servers:**
   ```bash
   npm start
   ```
   This will start both the client (port 3000) and server (port 5000) in development mode.

---

## Project Structure

```
crypto-wallet/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main App component
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── index.js       # Server entry point
│   └── package.json
├── extension/             # Browser extension build
└── package.json
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user

### Wallet
- `POST /api/wallet/balance` — Get wallet balance
- `POST /api/wallet/create` — Create new wallet
- `POST /api/wallet/send` — Send ETH transaction
- `POST /api/wallet/transactions` — Get transaction history
- `GET/POST /api/wallet/user-wallet` — Sync wallet address for logged-in user

---

## Security Notes

- **Never share your private keys or mnemonic.**
- The mnemonic/private key is only stored in your browser's local storage and never sent to the backend.
- Always use the Import Wallet feature to restore your wallet in a new environment.
- Use environment variables for sensitive data.
- Use HTTPS in production.

---

## Browser Extension (WalletExt)

A full-featured browser extension wallet popup is included. It allows users to:
- Login/Register
- View wallet address and balance
- Create/import wallet
- Send ETH
- View transaction history
- Export mnemonic (with password verification)
- Logout

### Extension Folder Structure

```
extension/
  manifest.json
  popup.html
  popup.js (React build)
  background.js
  icon16.png
  icon48.png
  icon128.png
```

### How to Build and Load the Extension

1. **Build the React popup:**
   ```bash
   cd client
   npm run build
   ```
   Copy the build output (e.g., `build/static/js`, `build/index.html`) to the `extension/` folder as `popup.js` and `popup.html`.

2. **Load the `extension/` folder as an unpacked extension:**
   - Go to `chrome://extensions` in Chrome/Edge/Brave.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `extension/` folder.

3. The popup will provide the full wallet UI.

---

## Export Mnemonic: "No mnemonic found." Explanation

If you see the message **"No mnemonic found."** in the Export Mnemonic dialog, it means that the mnemonic phrase is not present in the browser's local storage for this environment (webapp or extension popup).

### Why This Happens

- The mnemonic is only available in the environment (webapp or popup) where the user has created or imported the wallet.
- If you log in on a new device, browser, or context (e.g., popup after webapp), the wallet address will sync (via backend), but the mnemonic/private key will **not** unless you import it.

### How to Fix

**To export the mnemonic, you must first import it in this environment:**

1. **Click "Import Wallet"** in the webapp or popup.
2. **Paste your mnemonic phrase** (the one you used to create/import your wallet originally).
3. After importing, the mnemonic will be stored in local storage for this environment.
4. Now, when you click "Export Mnemonic," it will be available.

### Security Note

- The mnemonic is never sent to the backend for security reasons.
- You must import it in every environment where you want full wallet access.

### User Guidance

- If you see "No mnemonic found," use the **Import Wallet** feature and enter your mnemonic phrase.
- After that, you can export or use your wallet as expected.

**Summary:**  
This is expected and secure behavior.  
Just import your mnemonic in the current environment, and the export will work!

---

## Troubleshooting

- **Transactions not showing in popup:**  
  Make sure you have imported the same mnemonic in both the webapp and the popup. The wallet address and transaction history will then match.
- **"No mnemonic found" in export dialog:**  
  Use the Import Wallet feature and enter your mnemonic phrase.
- **Balance or transactions not updating:**  
  Use the refresh button next to the balance or transaction history.
