import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Box,
  Grid
} from '@mui/material';

function StakingForm({ onStake, tokens }) {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [lockPeriod, setLockPeriod] = useState(30);

  const lockPeriods = [
    { days: 30, apy: '10%' },
    { days: 60, apy: '15%' },
    { days: 90, apy: '20%' },
    { days: 180, apy: '25%' },
    { days: 365, apy: '30%' }
  ];

  const handleStake = () => {
    if (!amount || !selectedToken || !lockPeriod) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    onStake(selectedToken, amount, lockPeriod);
  };

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px' 
    }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Novo Stake
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Token</InputLabel>
              <Select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiSelect-icon': { color: 'white' }
                }}
              >
                {Object.keys(tokens).map((token) => (
                  <MenuItem key={token} value={tokens[token]}>
                    {token}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quantidade"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Período de Bloqueio</InputLabel>
              <Select
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value)}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiSelect-icon': { color: 'white' }
                }}
              >
                {lockPeriods.map((period) => (
                  <MenuItem key={period.days} value={period.days}>
                    {period.days} dias (APY: {period.apy})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleStake}
                sx={{
                  background: 'linear-gradient(45deg, #6b46c1 30%, #805ad5 90%)',
                  color: 'white',
                  height: '48px',
                  boxShadow: '0 3px 5px 2px rgba(107, 70, 193, .3)'
                }}
              >
                Stake
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default StakingForm;