import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Autocomplete, Typography, IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Guardian, GuardianShift, GuardianAssignmentFormData, GuardianAssignment } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

const assignmentSchema = z.object({
  guardianId: z.number().positive('Please select a guardian'),
  shiftId: z.number().positive('Please select a shift'),
  date: z.string().min(1, 'Date is required'),
  site: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional().default('scheduled'),
});

interface AssignmentFormProps {
  open: boolean;
  selectedDate: string; // YYYY-MM-DD
  assignment: GuardianAssignment | null; // null if creating new
  onClose: () => void;
  onSaved: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ open, selectedDate, assignment, onClose, onSaved }) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [shifts, setShifts] = useState<GuardianShift[]>([]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<GuardianAssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      guardianId: 0,
      shiftId: 0,
      date: selectedDate,
      site: '',
      zone: '',
      notes: '',
      status: 'scheduled',
    }
  });

  useEffect(() => {
    if (open) {
      // Fetch dropdown data
      guardianApi.getGuardians({ limit: 1000 }).then(res => {
        if (res.data.success) setGuardians(res.data.data);
      });
      guardianApi.getShifts().then(res => {
        if (res.data.success) setShifts(res.data.data);
      });

      if (assignment) {
        reset({
          guardianId: assignment.guardianId,
          shiftId: assignment.shiftId,
          date: new Date(assignment.date).toISOString().split('T')[0],
          site: assignment.site || '',
          zone: assignment.zone || '',
          notes: assignment.notes || '',
          status: assignment.status,
        });
      } else {
        reset({
          guardianId: 0,
          shiftId: 0,
          date: selectedDate,
          site: '',
          zone: '',
          notes: '',
          status: 'scheduled',
        });
      }
    }
  }, [open, assignment, selectedDate, reset]);

  const onSubmit = async (data: GuardianAssignmentFormData) => {
    try {
      if (assignment) {
        await guardianApi.updateAssignment(assignment.id, data);
      } else {
        await guardianApi.createAssignment(data);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save assignment', error);
      alert('Failed to save assignment');
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await guardianApi.deleteAssignment(assignment.id);
        onSaved();
        onClose();
      } catch (error) {
        console.error('Failed to delete assignment', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{assignment ? 'Edit Assignment' : 'Add Assignment'}</Typography>
        {assignment && (
          <IconButton color="error" onClick={handleDelete} size="small">
            <DeleteIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="assignment-form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Date" value={selectedDate} disabled fullWidth />

          <Controller
            name="guardianId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={guardians}
                getOptionLabel={(option) => option.fullName || ''}
                value={guardians.find(g => g.id === field.value) || null}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue.id : 0);
                  // Auto-fill site/zone if available
                  if (newValue?.site) setValue('site', newValue.site);
                  if (newValue?.zone) setValue('zone', newValue.zone);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Guardian" error={!!errors.guardianId} helperText={errors.guardianId?.message} />
                )}
              />
            )}
          />

          <Controller
            name="shiftId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={shifts}
                getOptionLabel={(option) => option.name || ''}
                value={shifts.find(s => s.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : 0)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Shift" error={!!errors.shiftId} helperText={errors.shiftId?.message} />
                )}
              />
            )}
          />

          <Controller
            name="site" control={control}
            render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Site (Optional)" fullWidth />}
          />

          <Controller
            name="zone" control={control}
            render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Zone (Optional)" fullWidth />}
          />

          <Controller
            name="notes" control={control}
            render={({ field }) => <TextField {...field} value={field.value ?? ''} label="Notes" multiline rows={2} fullWidth />}
          />

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button type="submit" form="assignment-form" variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentForm;
