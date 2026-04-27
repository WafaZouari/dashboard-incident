import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Checkbox, Button, Typography, Divider,
  CircularProgress, Alert, Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { referenceApi, incidentApi } from '../../services/api';
import type { IncidentConsequence, IncidentFormData, IncidentSubcategory, IncidentType, User, Location } from '../../types';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dateOccurred: z.string().min(1, 'Date is required'),
  timeOccurred: z.string().optional(),
  locationId: z.number().optional(),
  incidentTypeId: z.number().optional(),
  incidentSubcategoryId: z.number().optional(),
  consequenceId: z.number().optional(),
  actualSeverity: z.number().min(1).max(5).optional(),
  potentialSeverity: z.number().min(1).max(5).optional(),
  isHighPotential: z.boolean(),
  status: z.enum(['open', 'under_investigation', 'closed', 'archived']),
  responsibleSupervisorId: z.number().optional(),
  incidentLeaderId: z.number().optional(),
  reportedById: z.number().optional(),
});

interface IncidentFormProps {
  incidentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ incidentId, onSuccess, onCancel }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [subcategories, setSubcategories] = useState<IncidentSubcategory[]>([]);
  const [consequences, setConsequences] = useState<IncidentConsequence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(schema),
    defaultValues: { isHighPotential: false, status: 'open', dateOccurred: new Date().toISOString().split('T')[0] },
  });

  const selectedTypeId = watch('incidentTypeId');

  useEffect(() => {
    const loadRef = async () => {
      const [locsRes, typesRes, consRes, usersRes] = await Promise.all([
        referenceApi.getLocations(),
        referenceApi.getIncidentTypes(),
        referenceApi.getConsequences(),
        referenceApi.getUsers(),
      ]);
      setLocations(locsRes.data.data);
      setIncidentTypes(typesRes.data.data);
      setConsequences(consRes.data.data);
      setUsers(usersRes.data.data);
    };
    loadRef();
  }, []);

  useEffect(() => {
    if (selectedTypeId) {
      referenceApi.getSubcategories(Number(selectedTypeId)).then((res) => setSubcategories(res.data.data));
    } else {
      setSubcategories([]);
    }
  }, [selectedTypeId]);

  useEffect(() => {
    if (incidentId) {
      incidentApi.getById(incidentId).then((res) => {
        const inc = res.data.data;
        reset({
          title: inc.title,
          description: inc.description || '',
          dateOccurred: new Date(inc.dateOccurred).toISOString().split('T')[0],
          locationId: inc.locationId || undefined,
          incidentTypeId: inc.incidentTypeId || undefined,
          consequenceId: inc.consequenceId || undefined,
          actualSeverity: inc.actualSeverity || undefined,
          potentialSeverity: inc.potentialSeverity || undefined,
          isHighPotential: inc.isHighPotential,
          status: inc.status as IncidentFormData['status'],
          responsibleSupervisorId: inc.responsibleSupervisor?.id || undefined,
          incidentLeaderId: inc.incidentLeader?.id || undefined,
          reportedById: inc.reportedBy?.id || undefined,
        });
      });
    }
  }, [incidentId, reset]);

  const onSubmit = async (data: IncidentFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      if (incidentId) {
        await incidentApi.update(incidentId, data);
      } else {
        await incidentApi.create(data);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save incident');
    } finally {
      setSubmitting(false);
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
      <Box sx={{ width: 3, height: 16, borderRadius: 2, background: '#F59E0B' }} />
      <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
        {children}
      </Typography>
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Section 1: Basic Info */}
      <SectionTitle>Basic Information</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller name="title" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Incident Title *" error={!!errors.title} helperText={errors.title?.message} size="small" />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="dateOccurred" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Date Occurred *" type="date" slotProps={{ inputLabel: { shrink: true } }} size="small" error={!!errors.dateOccurred} />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="timeOccurred" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Time Occurred" type="time" slotProps={{ inputLabel: { shrink: true } }} size="small" />
          )} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller name="description" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Description" multiline rows={3} size="small" />
          )} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5, borderColor: 'divider' }} />

      {/* Section 2: Classification */}
      <SectionTitle>Classification</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="locationId" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select {...field} label="Location" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                <MenuItem value="">— None —</MenuItem>
                {locations.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="incidentTypeId" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Incident Type</InputLabel>
              <Select {...field} label="Incident Type" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                <MenuItem value="">— None —</MenuItem>
                {incidentTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        {subcategories.length > 0 && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="incidentSubcategoryId" control={control} render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Subcategory</InputLabel>
                <Select {...field} label="Subcategory" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                  <MenuItem value="">— None —</MenuItem>
                  {subcategories.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            )} />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="consequenceId" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Consequence</InputLabel>
              <Select {...field} label="Consequence" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                <MenuItem value="">— None —</MenuItem>
                {consequences.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Controller name="actualSeverity" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Actual Severity</InputLabel>
              <Select {...field} label="Actual Severity" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                <MenuItem value="">—</MenuItem>
                {[1, 2, 3, 4, 5].map((s) => <MenuItem key={s} value={s}>S{s}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Controller name="potentialSeverity" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Potential Severity</InputLabel>
              <Select {...field} label="Potential Severity" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                <MenuItem value="">—</MenuItem>
                {[1, 2, 3, 4, 5].map((s) => <MenuItem key={s} value={s}>S{s}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="status" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status">
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="under_investigation">Under Investigation</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="isHighPotential" control={control} render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} sx={{ color: '#EF4444', '&.Mui-checked': { color: '#EF4444' } }} />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>High Potential Incident</Typography>}
              sx={{ mt: 0.5 }}
            />
          )} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5, borderColor: 'divider' }} />

      {/* Section 3: Personnel */}
      <SectionTitle>Personnel</SectionTitle>
      <Grid container spacing={2}>
        {[
          { name: 'reportedById', label: 'Reported By' },
          { name: 'responsibleSupervisorId', label: 'Responsible Supervisor' },
          { name: 'incidentLeaderId', label: 'Incident Leader' },
        ].map(({ name, label }) => (
          <Grid size={{ xs: 12, sm: 4 }} key={name}>
            <Controller name={name as keyof IncidentFormData} control={control} render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>{label}</InputLabel>
                <Select {...field} label={label} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}>
                  <MenuItem value="">— None —</MenuItem>
                  {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}
                </Select>
              </FormControl>
            )} />
          </Grid>
        ))}
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {onCancel && <Button variant="outlined" onClick={onCancel} disabled={submitting}>Cancel</Button>}
        <Button variant="contained" type="submit" disabled={submitting} sx={{ minWidth: 120 }}>
          {submitting ? <CircularProgress size={18} /> : incidentId ? 'Save Changes' : 'Create Incident'}
        </Button>
      </Box>
    </Box>
  );
};

export default IncidentForm;
