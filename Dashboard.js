import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Dashboard({ stakingContract, account }) {
  const [stats, setStats] = useState({
    totalStaked: 0,
    totalRewards: 0,
    activeStakes: 0
  });
  
  const [transactions, setTransactions] = useState([]);
  const [selectedToken, setSelectedToken] = useState('all');

  useEffect(() => {
    if (stakingContract && account) {
      loadDashboardData();
    }
  }, [stakingContract, account, selectedToken]);

  const loadDashboardData = async () => {
    try {
      const txs = await stakingContract.getUserTransactions(account);
      setTransactions(txs);

      let totalStaked = 0;
      let totalRewards = 0;
      let activeStakes = 0;

      const stake = await stakingContract.stakes(account);
      if (stake.amount > 0) {
        totalStaked += parseFloat(ethers.utils.formatEther(stake.amount));
        const reward = await stakingContract.calculateReward(account);
        totalRewards += parseFloat(ethers.utils.formatEther(reward));
        activeStakes++;
      }

      setStats({ totalStaked, totalRewards, activeStakes });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Cards de Estatísticas */}
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          mb: 2 
        }}>
          <CardContent>
            <Typography variant="h6">Total em Stake</Typography>
            <Typography variant="h4">${stats.totalStaked.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          mb: 2 
        }}>
          <CardContent>
            <Typography variant="h6">Recompensas Totais</Typography>
            <Typography variant="h4">${stats.totalRewards.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          mb: 2 
        }}>
          <CardContent>
            <Typography variant="h6">Stakes Ativos</Typography>
            <Typography variant="h4">{stats.activeStakes}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico */}
      <Grid item xs={12}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          mb: 2 
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Histórico de Valores</Typography>
            <LineChart width={800} height={300} data={transactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
      </Grid>

      {/* Histórico de Transações */}
      <Grid item xs={12}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          mb: 2 
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Histórico de Transações</Typography>
              <Select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiSelect-icon': { color: 'white' }
                }}
              >
                <MenuItem value="all">Todos os Tokens</MenuItem>
                <MenuItem value="ETH">ETH</MenuItem>
                <MenuItem value="USDT">USDT</MenuItem>
                <MenuItem value="BNB">BNB</MenuItem>
              </Select>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Token</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(tx.timestamp * 1000).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.transactionType}</TableCell>
                    <TableCell>{tx.token}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>Completado</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Dashboard;