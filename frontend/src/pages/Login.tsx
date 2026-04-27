import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton, alpha, Paper,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';


const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@petrosite.com', password: 'Admin1234!' },
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.data.user as User, res.data.data.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e?.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 40%, #162B4D 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background elements */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: alpha('#F59E0B', 0.03), top: -100, right: -100 }} />
      <Box sx={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: alpha('#06B6D4', 0.02), bottom: -200, left: -200 }} />
      <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <Box sx={{ width: '100%', maxWidth: 420, mx: 2, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
          }}>
            <ShieldIcon sx={{ fontSize: 36, color: '#0A1628' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            PetroSafe IMS
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Incident Management System
          </Typography>
        </Box>

        <Paper sx={{ p: 4, background: alpha('#0F2040', 0.8), backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Sign In</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Enter your credentials to continue</Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              {...register('email')}
              label="Email Address"
              fullWidth
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
            />
            <TextField
              {...register('password')}
              label="Password"
              type={showPwd ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((p) => !p)} size="small" edge="end">
                        {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1, py: 1.5, fontSize: '0.95rem', fontWeight: 700 }}
            >
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 1.5, background: alpha('#F59E0B', 0.06), borderRadius: 1, border: `1px solid ${alpha('#F59E0B', 0.15)}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>Demo Credentials</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>admin@petrosite.com / Admin1234!</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
