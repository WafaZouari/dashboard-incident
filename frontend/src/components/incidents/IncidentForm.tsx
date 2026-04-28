import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Checkbox, Button, Typography, Divider,
  CircularProgress, Alert, Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { incidentApi } from '../../services/api';
import type { IncidentFormData } from '../../types';

const PEAR_CLASSES = ['Injury/Illness', 'Asset Damage', 'Environmental', 'Security', 'Near Miss', 'PSE', 'Other'];
const SITES = ['MAIN OFFICE', 'CERCINA', 'CHERGUI', 'MISKAR', 'TPS HQ'];
const ASSET_INTEGRITY_TYPES = ['Facility', 'Pipeline', 'Structure', 'Well', ''];
const PSE_TIERS = ['1', '2', '3', '4', ''];
const INJ_TYPES = ['Medical Treatment Case', 'LTI', 'First Aid', 'RWC', 'FAT', 'Near Miss', ''];

const schema = z.object({
  incidentNo: z.string().min(1, 'Incident No. is required'),
  sourceYear: z.number().int().optional(),
  reportedBy: z.string().optional(),
  site: z.string().optional(),
  locationOnSite: z.string().optional(),
  dateTimeOccurred: z.string().optional(),
  pearClass: z.string().optional(),
  subCategory: z.string().optional(),
  briefDescription: z.string().optional(),
  incTypeIfInjury: z.string().optional(),
  assetIntegrityType: z.string().optional(),
  damagedZone: z.string().optional(),
  pseTiers: z.string().optional(),
  actualSeverity: z.number().min(1).max(5).optional(),
  potentialSeverity: z.number().min(1).max(5).optional(),
  investigationDone: z.boolean().default(false),
  status: z.enum(['open', 'under_investigation', 'closed', 'archived']),
});

interface IncidentFormProps {
  incidentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ incidentId, onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      investigationDone: false,
      status: 'open',
      incidentNo: `INC-${new Date().getFullYear()}-`,
      sourceYear: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (incidentId) {
      incidentApi.getById(incidentId).then((res) => {
        const inc = res.data.data;
        reset({
          incidentNo: inc.incidentNo,
          sourceYear: inc.sourceYear ?? undefined,
          reportedBy: inc.reportedBy ?? '',
          site: inc.site ?? '',
          locationOnSite: inc.locationOnSite ?? '',
          dateTimeOccurred: inc.dateTimeOccurred ? new Date(inc.dateTimeOccurred).toISOString().slice(0, 16) : '',
          pearClass: inc.pearClass ?? '',
          subCategory: inc.subCategory ?? '',
          briefDescription: inc.briefDescription ?? '',
          incTypeIfInjury: inc.incTypeIfInjury ?? '',
          assetIntegrityType: inc.assetIntegrityType ?? '',
          damagedZone: inc.damagedZone ?? '',
          pseTiers: inc.pseTiers ?? '',
          actualSeverity: inc.actualSeverity ?? undefined,
          potentialSeverity: inc.potentialSeverity ?? undefined,
          investigationDone: inc.investigationDone,
          status: inc.status as IncidentFormData['status'],
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

      {/* Section 1: Identification */}
      <SectionTitle>Identification</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="incidentNo" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Incident No. *" error={!!errors.incidentNo} helperText={errors.incidentNo?.message} size="small" placeholder="INC-2024-0001" />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller name="sourceYear" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Source Year" type="number" size="small"
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller name="status" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status">
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="under_investigation">Under Investigation</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="reportedBy" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Reported By" size="small" placeholder="e.g. A.GHATTASSI" />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="dateTimeOccurred" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Date / Time Occurred" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} size="small" />
          )} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />

      {/* Section 2: Location */}
      <SectionTitle>Location</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="site" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Site</InputLabel>
              <Select {...field} label="Site" value={field.value ?? ''}>
                <MenuItem value="">— None —</MenuItem>
                {SITES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="locationOnSite" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Location on Site" size="small" placeholder="e.g. 2nd floor, Delta Platform" />
          )} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />

      {/* Section 3: Classification */}
      <SectionTitle>Classification</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="pearClass" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>PEAR Class</InputLabel>
              <Select {...field} label="PEAR Class" value={field.value ?? ''}>
                <MenuItem value="">— None —</MenuItem>
                {PEAR_CLASSES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="subCategory" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Sub Category" size="small" />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="incTypeIfInjury" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Inc. Type if Injury</InputLabel>
              <Select {...field} label="Inc. Type if Injury" value={field.value ?? ''}>
                <MenuItem value="">— None —</MenuItem>
                {INJ_TYPES.filter(Boolean).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="assetIntegrityType" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Asset Integrity Type</InputLabel>
              <Select {...field} label="Asset Integrity Type" value={field.value ?? ''}>
                <MenuItem value="">— None —</MenuItem>
                {ASSET_INTEGRITY_TYPES.filter(Boolean).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="damagedZone" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Damaged Zone" size="small" />
          )} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller name="pseTiers" control={control} render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>PSE Tiers</InputLabel>
              <Select {...field} label="PSE Tiers" value={field.value ?? ''}>
                <MenuItem value="">— None —</MenuItem>
                {PSE_TIERS.filter(Boolean).map((t) => <MenuItem key={t} value={t}>Tier {t}</MenuItem>)}
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
          <Controller name="investigationDone" control={control} render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>Investigation Done?</Typography>}
              sx={{ mt: 0.5 }}
            />
          )} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />

      {/* Section 4: Description */}
      <SectionTitle>Description</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller name="briefDescription" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Brief Description" multiline rows={4} size="small" />
          )} />
        </Grid>
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
