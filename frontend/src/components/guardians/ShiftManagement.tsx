import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import type { GuardianShift, GuardianShiftFormData } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

const shiftSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  color: z.string().optional().default('#F59E0B'),
});

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<GuardianShift[]>([]);
  const [open, setOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<GuardianShift | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GuardianShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: { name: '', startTime: '', endTime: '', color: '#F59E0B' }
  });

  const fetchShifts = async () => {
    try {
      const res = await guardianApi.getShifts();
      if (res.data.success) {
        setShifts(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shifts', error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpen = (shift?: GuardianShift) => {
    if (shift) {
      setEditingShift(shift);
      reset({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime, color: shift.color });
    } else {
      setEditingShift(null);
      reset({ name: '', startTime: '', endTime: '', color: '#F59E0B' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShift(null);
  };

  const onSubmit = async (data: GuardianShiftFormData) => {
    try {
      if (editingShift) {
        await guardianApi.updateShift(editingShift.id, data);
      } else {
        await guardianApi.createShift(data);
      }
      fetchShifts();
      handleClose();
    } catch (error) {
      console.error('Failed to save shift', error);
      alert('Failed to save shift. Check if name already exists.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shift type?')) {
      try {
        await guardianApi.deleteShift(id);
        fetchShifts();
      } catch (error) {
        console.error('Failed to delete shift', error);
        alert('Cannot delete shift type if it is assigned to guardians.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Shift Types</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Shift Type
        </Button>
      </Box>

      <Grid container spacing={3}>
        {shifts.map(shift => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shift.id}>
            <Card sx={{ borderLeft: `4px solid ${shift.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{shift.name}</Typography>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(shift)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(shift.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'text.secondary' }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">{shift.startTime} - {shift.endTime}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editingShift ? 'Edit Shift Type' : 'Add Shift Type'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="shift-form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name" control={control}
              render={({ field }) => <TextField {...field} label="Shift Name (e.g. Day, Night)" fullWidth error={!!errors.name} helperText={errors.name?.message} />}
            />
            <Controller
              name="startTime" control={control}
              render={({ field }) => <TextField {...field} label="Start Time (e.g. 06:00)" fullWidth error={!!errors.startTime} helperText={errors.startTime?.message} />}
            />
            <Controller
              name="endTime" control={control}
              render={({ field }) => <TextField {...field} label="End Time (e.g. 18:00)" fullWidth error={!!errors.endTime} helperText={errors.endTime?.message} />}
            />
            <Controller
              name="color" control={control}
              render={({ field }) => <TextField {...field} type="color" label="Display Color" fullWidth />}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" form="shift-form" variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftManagement;
