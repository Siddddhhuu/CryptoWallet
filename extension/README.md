# WalletExt Browser Extension

This folder contains the browser extension version of the WalletExt crypto wallet.

## Features
- Login/Register
- View wallet address and balance
- Create wallet
- Send ETH
- View transaction history
- Logout

## How to Build and Load the Extension

1. **Build the React Popup**
   - In your `client/` folder, run:
     ```bash
     npm run build
     ```
   - Copy the contents of `client/build/static/js/main.*.js` to `extension/popup.js`.
   - Copy the contents of `client/build/static/css/main.*.css` to `extension/popup.css` (if you want to include CSS).
   - (Or, set up your React build to output directly to the `extension/` folder.)

2. **Load the Extension in Chrome/Edge/Brave**
   - Go to `chrome://extensions`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `extension/` folder.

3. **Click the WalletExt icon to open the popup.**

## Development Tips
- You can reuse your existing React components (Login, Register, Dashboard) in the popup.
- You may need to adjust routing and storage to work in the extension context.
- For advanced features (like dApp injection), add a content script and provider injection logic. 