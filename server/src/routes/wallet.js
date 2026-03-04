const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Helper to get Web3 instance for a given RPC URL
const getWeb3 = (rpcUrl) => {
  if (!rpcUrl) {
    throw new Error('RPC URL is required.');
  }
  try {
    const web3Instance = new Web3(rpcUrl);
    return web3Instance;
  } catch (error) {
    console.error(`Error initializing Web3 for ${rpcUrl}:`, error);
    throw new Error('Failed to connect to Ethereum node. Check RPC URL.');
  }
};

// Get wallet balance (now a POST request)
router.post('/balance', auth, async (req, res) => {
  try {
    const { rpcUrl } = req.body;
    if (!rpcUrl) {
      return res.status(400).json({ message: 'RPC URL is required to fetch balance.' });
    }

    const web3 = getWeb3(rpcUrl);

    // Test connection (optional, but good for diagnostics)
    try {
      await web3.eth.getBlockNumber();
    } catch (connError) {
      console.error(`Connection test failed for ${rpcUrl}:`, connError);
      return res.status(503).json({ 
        message: 'Ethereum node is not available. Please check your RPC URL or connection.',
        error: 'ETHEREUM_NODE_ERROR',
        details: connError.message
      });
    }

    console.log('Fetching balance for user:', req.user.userId);

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.walletAddress) {
      console.log('No wallet address found for user:', req.user.userId);
      return res.status(400).json({ message: 'No wallet address found' });
    }

    console.log('Fetching balance for address:', user.walletAddress);
    const balance = await web3.eth.getBalance(user.walletAddress);
    console.log('Raw balance:', balance);
    
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    console.log('Balance in ETH:', balanceInEth);

    res.json({ balance: balanceInEth });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ 
      message: 'Error fetching balance', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Create new wallet (now accepts walletAddress from client)
router.post('/create', auth, async (req, res) => {
  try {
    const { rpcUrl, walletAddress } = req.body; // Expect walletAddress from client
    if (!rpcUrl) {
      return res.status(400).json({ message: 'RPC URL is required to create wallet.' });
    }
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required.' });
    }

    const web3 = getWeb3(rpcUrl);

    // Test connection
    try {
      await web3.eth.getBlockNumber();
    } catch (connError) {
      console.error(`Connection test failed for ${rpcUrl}:`, connError);
      return res.status(503).json({ 
        message: 'Ethereum node is not available. Please check your RPC URL or connection.',
        error: 'ETHEREUM_NODE_ERROR',
        details: connError.message
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletAddress) {
      return res.status(400).json({ message: 'Wallet already exists' });
    }

    // Store the walletAddress provided by the client
    user.walletAddress = walletAddress;
    await user.save();

    res.json({
      address: walletAddress,
      message: 'Wallet address saved successfully.'
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ message: 'Error saving wallet address', error: error.message });
  }
});

// Send transaction
router.post('/send', auth, async (req, res) => {
  try {
    const { to, amount, privateKey, rpcUrl, tokenSymbol } = req.body;

    // Validate inputs
    if (!to) {
      return res.status(400).json({ message: 'Recipient address is required.' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }
    if (!privateKey) {
      return res.status(400).json({ message: 'Private key is required.' });
    }
    if (!rpcUrl) {
      return res.status(400).json({ message: 'RPC URL is required to send transaction.' });
    }

    // Validate recipient address format (must start with 0x and be valid)
    if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ message: 'Invalid recipient address format. Must be a valid hex address starting with 0x.' });
    }

    // Validate private key format (must start with 0x if provided)
    let formattedPrivateKey = privateKey;
    if (!privateKey.startsWith('0x') && privateKey.length === 64) {
      formattedPrivateKey = '0x' + privateKey;
    }
    if (!formattedPrivateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({ message: 'Invalid private key format. Must be a valid 64-character hex string.' });
    }

    const web3 = getWeb3(rpcUrl);

    // Test connection
    try {
      await web3.eth.getBlockNumber();
    } catch (connError) {
      console.error(`Connection test failed for ${rpcUrl}:`, connError);
      return res.status(503).json({ 
        message: 'Ethereum node is not available.',
        error: 'ETHEREUM_NODE_ERROR',
        details: connError.message
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user || !user.walletAddress) {
      return res.status(400).json({ message: 'Invalid wallet' });
    }

    // Detect Token Symbol Automatically
    let symbol = tokenSymbol;

    if (!symbol) {
      if (rpcUrl.includes('apothem')) symbol = 'TXDC';
      else if (rpcUrl.includes('xinfin')) symbol = 'XDC';
      else if (rpcUrl.includes('volta')) symbol = 'VWT';
      else if (rpcUrl.includes('sepolia')) symbol = 'ETH';
      else symbol = 'ETH';
    }

    try {
      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();
      console.log('Gas price:', gasPrice);

      // Convert amount to Wei
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
      console.log('Amount in Wei:', amountInWei);

      const transaction = {
        from: user.walletAddress,
        to: to,
        value: amountInWei,
        gas: 21000,
        gasPrice: gasPrice
      };

      console.log('Transaction object:', transaction);

      // Sign the transaction
      const signedTx = await web3.eth.accounts.signTransaction(transaction, formattedPrivateKey);
      console.log('Transaction signed successfully');

      // Send the signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log('Transaction sent:', receipt.transactionHash);

      // Fetch transaction details and store in DB
      const tx = await web3.eth.getTransaction(receipt.transactionHash);

      if (tx) {
        const block = await web3.eth.getBlock(tx.blockNumber);

        const newTransaction = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: web3.utils.fromWei(tx.value, 'ether'),
          timestamp: new Date(Number(block.timestamp) * 1000),
          network: rpcUrl,
          tokenSymbol: symbol,
          type: 'sent'
        };

        user.transactions.push(newTransaction);

        if (user.transactions.length > 50) {
          user.transactions.splice(0, user.transactions.length - 50);
        }

        await user.save();
      }

      res.json({ 
        message: 'Transaction successful',
        transactionHash: receipt.transactionHash
      });

    } catch (txError) {
      console.error('Transaction error:', txError.message);
      res.status(400).json({ 
        message: 'Transaction failed', 
        error: txError.message,
        details: 'Check your private key, recipient address, and ensure you have sufficient balance'
      });
    }

  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ 
      message: 'Error sending transaction', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Scan and store received transactions
router.post('/scan-received', auth, async (req, res) => {
  try {
    console.log('=== SCAN RECEIVED START ===');
    const { rpcUrl } = req.body;
    if (!rpcUrl) {
      return res.status(400).json({ message: 'RPC URL is required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || !user.walletAddress) {
      console.log('User or wallet not found');
      return res.status(400).json({ message: 'No wallet address found' });
    }

    console.log('Scanning for address:', user.walletAddress);

    const web3 = getWeb3(rpcUrl);

    // Get latest block number
    let latestBlockBig;
    try {
      latestBlockBig = await web3.eth.getBlockNumber();
      console.log('Latest block:', latestBlockBig);
    } catch (blockErr) {
      console.error('Error getting latest block:', blockErr.message);
      return res.status(503).json({ message: 'Could not connect to blockchain' });
    }

    // convert BigInt to Number for arithmetic
    const latestBlock = Number(latestBlockBig);
    if (Number.isNaN(latestBlock)) {
      console.error('Unable to convert latestBlock to number:', latestBlockBig);
      return res.status(500).json({ message: 'Invalid block number' });
    }

    // Scan only the last 100 blocks (reduced for safety)
    const scanFromBlock = Math.max(0, latestBlock - 100);
    console.log(`Scanning blocks ${scanFromBlock} to ${latestBlock}`);
    
    let receivedCount = 0;
    let sentCount = 0;
    let processedBlocks = 0;

    for (let blockNum = scanFromBlock; blockNum <= latestBlock; blockNum++) {
      try {
        const block = await web3.eth.getBlock(blockNum, true);
        processedBlocks++;
        
        if (!block) {
          console.warn(`Block ${blockNum} is null`);
          continue;
        }

        if (!block.transactions || !Array.isArray(block.transactions)) {
          continue;
        }

        const userAddressLower = user.walletAddress.toLowerCase();

        for (const tx of block.transactions) {
          if (!tx || typeof tx !== 'object') continue;

          try {
            const txHashLower = (tx.hash || '').toLowerCase();
            const fromLower = (tx.from || '').toLowerCase();
            const toLower = (tx.to || '').toLowerCase();

            if (!txHashLower || !fromLower) continue;

            // Check if already stored
            const existingTx = user.transactions.find(t => t.hash.toLowerCase() === txHashLower);
            if (existingTx) continue;

            // Received: user is recipient but not sender
            if (toLower === userAddressLower && fromLower !== userAddressLower) {
              console.log(`Found received tx: ${txHashLower}`);
              const txValue = web3.utils.fromWei(tx.value || '0', 'ether');
              const newTransaction = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: txValue,
                timestamp: new Date(Number(block.timestamp) * 1000),
                network: rpcUrl,
                tokenSymbol: 'TXDC',
                type: 'received'
              };
              user.transactions.push(newTransaction);
              receivedCount++;
            }
            // Sent: user is sender
            else if (fromLower === userAddressLower && toLower) {
              console.log(`Found sent tx: ${txHashLower}`);
              const txValue = web3.utils.fromWei(tx.value || '0', 'ether');
              const newTransaction = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: txValue,
                timestamp: new Date(Number(block.timestamp) * 1000),
                network: rpcUrl,
                tokenSymbol: 'TXDC',
                type: 'sent'
              };
              user.transactions.push(newTransaction);
              sentCount++;
            }
          } catch (txErr) {
            console.warn(`Error processing tx: ${txErr.message}`);
            continue;
          }
        }
      } catch (blockErr) {
        console.warn(`Error processing block ${blockNum}: ${blockErr.message}`);
        continue;
      }
    }

    // Keep only last 50 transactions
    if (user.transactions.length > 50) {
      user.transactions = user.transactions.slice(-50);
    }

    try {
      await user.save();
      console.log(`Scan complete: ${receivedCount} received, ${sentCount} sent (${processedBlocks} blocks scanned)`);
    } catch (saveErr) {
      console.error('Error saving transactions:', saveErr.message);
      return res.status(500).json({ message: 'Error saving transactions to database' });
    }

    res.json({ 
      message: 'Transactions scanned successfully',
      receivedFound: receivedCount,
      sentFound: sentCount,
      blocksScanned: processedBlocks
    });
  } catch (error) {
    console.error('=== SCAN ERROR ===', error.message);
    console.error(error);
    res.status(500).json({ 
      message: 'Error scanning transactions', 
      error: error.message
    });
  }
});

// Get transaction history (new POST route)
router.post('/transactions', auth, async (req, res) => {
  try {
    const { rpcUrl } = req.body; // rpcUrl is passed for consistency, can be used for filtering later

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return transactions, most recent first
    res.json({ transactions: user.transactions.sort((a, b) => b.timestamp - a.timestamp) });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Get wallet info for the logged-in user
router.get('/user-wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ walletAddress: user.walletAddress });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wallet info', error: err.message });
  }
});

// Update wallet info for the logged-in user
router.post('/user-wallet', auth, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.walletAddress = walletAddress;
    await user.save();
    res.json({ message: 'Wallet info updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating wallet info', error: err.message });
  }
});

module.exports = router; 