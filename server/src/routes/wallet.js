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
    const { to, amount, privateKey, rpcUrl } = req.body;
    if (!rpcUrl) {
      return res.status(400).json({ message: 'RPC URL is required to send transaction.' });
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

    if (!user || !user.walletAddress) {
      return res.status(400).json({ message: 'Invalid wallet' });
    }

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log('Current gas price:', gasPrice);

    const transaction = {
      from: user.walletAddress,
      to: to,
      value: web3.utils.toWei(amount.toString(), 'ether'),
      gas: 21000, // Standard gas limit for simple ETH transfer
      gasPrice: gasPrice // Include the fetched gas price
    };

    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Fetch transaction details and store in DB
    const tx = await web3.eth.getTransaction(receipt.transactionHash);
    if (tx) {
      // Fetch the block to get the timestamp
      const block = await web3.eth.getBlock(tx.blockNumber);
      const newTransaction = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: web3.utils.fromWei(tx.value, 'ether'),
        timestamp: new Date(Number(block.timestamp) * 1000), // Use block.timestamp for accurate time
        network: rpcUrl // Store the network it was sent on
      };

      // Add the transaction to the user's history, ensure it's unique by hash
      user.transactions.push(newTransaction);
      // Limit the history to a certain number of transactions (e.g., last 50)
      if (user.transactions.length > 50) {
        user.transactions.splice(0, user.transactions.length - 50);
      }
      await user.save();
    }

    res.json({ 
      message: 'Transaction successful',
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ message: 'Error sending transaction', error: error.message });
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