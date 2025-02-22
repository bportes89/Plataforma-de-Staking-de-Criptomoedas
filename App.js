import React, { useState, useEffect } from 'react';
import { Container, Box, Tab, Tabs, Button, Typography } from '@mui/material';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import Dashboard from './components/Dashboard';
import StakingForm from './components/StakingForm';
import './styles.css';

// URLs diretas das imagens
const ethereumIcon = "https://cryptologos.cc/logos/ethereum-eth-logo.png";
const bitcoinIcon = "https://cryptologos.cc/logos/bitcoin-btc-logo.png";
const bnbIcon = "https://cryptologos.cc/logos/bnb-bnb-logo.png";
const usdtIcon = "https://cryptologos.cc/logos/tether-usdt-logo.png";

function App() {
  const [tab, setTab] = useState(0);
  const [account, setAccount] = useState('');
  const [stakingContract, setStakingContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Lista de tokens suportados com endereços reais da rede de teste
  const tokens = {
    'ETH': '0x0000000000000000000000000000000000000000',
    'USDT': '0x0000000000000000000000000000000000000000',
    'BNB': '0x0000000000000000000000000000000000000000'
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const formatAddress = (address) => {
    try {
      if (!address || typeof address !== 'string') return 'Conectar Carteira';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } catch (error) {
      console.error("Erro ao formatar endereço:", error);
      return 'Endereço Inválido';
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          handleAccountsChanged(accounts);
        }
      } else {
        console.log("Por favor, instale a MetaMask!");
      }
    } catch (error) {
      console.error("Erro ao verificar carteira:", error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    try {
      if (accounts.length > 0) {
        const address = accounts[0].toString(); // Convertendo para string
        setAccount(address);
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        initializeContract(signer);
      } else {
        setAccount('');
        setSigner(null);
        setStakingContract(null);
      }
    } catch (error) {
      console.error("Erro ao mudar conta:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        handleAccountsChanged(accounts);
      } else {
        alert("Por favor, instale a MetaMask!");
      }
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
    }
  };

  const initializeContract = async (signer) => {
    try {
      const contractAddress = "0xDA0bab807633f07f013f94DD0E6A4F96F8742B53";
      const contractABI = [
        // Seu ABI aqui[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_minStakeAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_baseRewardRate",
				"type": "uint256"
			}
		],
		"name": "addSupportedToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_lockPeriod",
				"type": "uint256"
			}
		],
		"name": "stake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lockPeriod",
				"type": "uint256"
			}
		],
		"name": "Staked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "minStakeAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "baseRewardRate",
				"type": "uint256"
			}
		],
		"name": "TokenAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "unstake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "Unstaked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "calculateReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_lockPeriod",
				"type": "uint256"
			}
		],
		"name": "calculateRewardRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserTransactions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "transactionType",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct Staking.Transaction[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lockPeriods",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "rewardBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "stakes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lockPeriod",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rewardRate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "supportedTokens",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isSupported",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "minStakeAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "baseRewardRate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactionHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "transactionType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

      ];
      
      const contract = new Contract(
        contractAddress,
        contractABI,
        signer
      );
      
      setStakingContract(contract);
    } catch (error) {
      console.error("Erro ao inicializar contrato:", error);
    }
  };

  const handleStake = async (token, amount, lockPeriod) => {
    try {
      if (!stakingContract) return;

      const tx = await stakingContract.stake(
        token,
        parseEther(amount.toString()),
        lockPeriod
      );

      await tx.wait();
      alert("Stake realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer stake:", error);
      alert("Erro ao fazer stake. Verifique o console para mais detalhes.");
    }
  };

  return (
    <>
      {/* Background com ícones de criptomoedas */}
      <div className="crypto-background">
        <img src={ethereumIcon} alt="ETH" className="crypto-icon" width="64" />
        <img src={bitcoinIcon} alt="BTC" className="crypto-icon" width="64" />
        <img src={bnbIcon} alt="BNB" className="crypto-icon" width="64" />
        <img src={usdtIcon} alt="USDT" className="crypto-icon" width="64" />
      </div>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {/* Header com botão de conexão */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 3,
            alignItems: 'center'
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'linear-gradient(45deg, #6b46c1 30%, #805ad5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Plataforma de Staking
            </Typography>
            <Button 
              variant="contained" 
              onClick={connectWallet}
              disabled={!!account}
              sx={{
                borderRadius: '20px',
                padding: '10px 20px'
              }}
            >
              {account ? formatAddress(account) : 'Conectar Carteira'}
            </Button>
          </Box>

          {account ? (
            <>
              <Tabs 
                value={tab} 
                onChange={(e, newValue) => setTab(newValue)}
                sx={{ 
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#6b46c1'
                  }
                }}
              >
                <Tab label="Dashboard" />
                <Tab label="Stake" />
              </Tabs>

              {tab === 0 && (
                <Dashboard
                  stakingContract={stakingContract}
                  account={account}
                />
              )}
              
              {tab === 1 && (
                <StakingForm
                  onStake={handleStake}
                  tokens={tokens}
                />
              )}
            </>
          ) : (
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mt: 4,
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Por favor, conecte sua carteira para continuar
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
}

export default App;