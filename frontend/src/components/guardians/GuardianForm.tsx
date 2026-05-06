import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControlLabel, Switch, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Guardian, GuardianFormData } from '../../types/guardian';

const guardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  badgeId: z.string().optional().nullable(),
  rank: z.string().optional().nullable(),
  site: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
});

interface GuardianFormProps {
  open: boolean;
  guardian: Guardian | null;
  onClose: () => void;
  onSubmit: (data: GuardianFormData) => void;
}

const GuardianForm: React.FC<GuardianFormProps> = ({ open, guardian, onClose, onSubmit }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      badgeId: '',
      rank: '',
      site: '',
      zone: '',
      phone: '',
      email: '',
      isActive: true,
    }
  });

  useEffect(() => {
    if (guardian) {
      reset({
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        badgeId: guardian.badgeId || '',
        rank: guardian.rank || '',
        site: guardian.site || '',
        zone: guardian.zone || '',
        phone: guardian.phone || '',
        email: guardian.email || '',
        isActive: guardian.isActive,
      });
    } else {
      reset({
        firstName: '', lastName: '', badgeId: '', rank: '', site: '', zone: '', phone: '', email: '', isActive: true,
      });
    }
  }, [guardian, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{guardian ? 'Edit Guardian' : 'Add Guardian'}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="guardian-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="badgeId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Badge ID" fullWidth error={!!errors.badgeId} helperText={errors.badgeId?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="rank"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Rank/Role" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="site"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Site" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="zone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Zone" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Phone" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                    label="Active Status"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button type="submit" form="guardian-form" variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuardianForm;
