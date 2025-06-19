import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext(null);

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [currentNetwork, setCurrentNetwork] = useState(() => {
    // Initialize from localStorage or default to Sepolia
    const storedNetwork = localStorage.getItem('selectedNetwork');
    return storedNetwork ? JSON.parse(storedNetwork) : {
      name: 'sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/0bb1ca7f54504b2f95ab6686c73d40b7', 
      chainId: '11155111',
      currency: 'ETH'
    };
  });

  // Define a list of available networks
  const networks = [
    {
      name: 'mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/0bb1ca7f54504b2f95ab6686c73d40b7', 
      chainId: '1',
      currency: 'ETH'
    },
    {
      name: 'sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/0bb1ca7f54504b2f95ab6686c73d40b7', 
      chainId: '11155111',
      currency: 'ETH'
    },
    {
      name: 'xdc-mainnet',
      rpcUrl: 'https://erpc.xinfin.network',
      chainId: '50',
      currency: 'XDC'
    },
    {
      name: 'xdc-apothem',
      rpcUrl: 'https://erpc.apothem.network',
      chainId: '51',
      currency: 'TXDC'
    },
    {
      name: 'Volta Testnet',
      rpcUrl: 'https://volta-rpc.energyweb.org',
      chainId: '73799',
      currency: 'VWT'
    },
    // Add more networks as needed, e.g., goerli, polygon, bsc
    // {
    //   name: 'goerli',
    //   rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    //   chainId: '5',
    //   currency: 'ETH'
    // },
    // {
    //   name: 'arbitrum',
    //   rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    //   chainId: '42161',
    //   currency: 'ETH'
    // }
  ];

  // Save selected network to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedNetwork', JSON.stringify(currentNetwork));
  }, [currentNetwork]);

  const selectNetwork = (networkName) => {
    const network = networks.find(net => net.name === networkName);
    if (network) {
      setCurrentNetwork(network);
    } else {
      console.error(`Network ${networkName} not found.`);
    }
  };

  const value = {
    currentNetwork,
    networks,
    selectNetwork
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}; 