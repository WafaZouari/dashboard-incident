import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, Switch, FormControlLabel, Chip, CircularProgress, alpha, useTheme,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab,
  IconButton, Checkbox, FormGroup, Alert, AlertTitle
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { userApi } from '../../services/userApi';
import type { User } from '../../services/userApi';
import { roleApi, type Role } from '../../services/roleApi';

const AVAILABLE_PERMISSIONS = [
  { id: 'all', label: 'All Access (Admin)' },
  { id: 'viewDashboard', label: 'View Dashboard' },
  { id: 'viewIncidents', label: 'View Incidents' },
  { id: 'manageIncidents', label: 'Manage Incidents' },
  { id: 'viewAnalytics', label: 'View Analytics' },
  { id: 'manageInvestigations', label: 'Manage Investigations' },
  { id: 'viewActionItems', label: 'View Action Items' },
  { id: 'manageActionItems', label: 'Manage Action Items' },
  { id: 'manageGuardians', label: 'Manage Guardians' },
];

interface RoleFormData {
  name: string;
  permissions: Record<string, boolean>;
}

const RolesManagementPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Dialog state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormData>({ name: '', permissions: {} });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userApi.getUsers({ limit: 50 }),
        roleApi.getRoles()
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (rolesRes.data.success) setRoles(rolesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setUsersLoading(false);
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -- User Handlers --
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await userApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Failed to update role');
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      await userApi.updateUserStatus(userId, isActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive } : u));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleOpenPasswordDialog = (user: User) => {
    setPasswordTargetUser(user);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!passwordTargetUser) return;
    try {
      await userApi.updateUserPassword(passwordTargetUser.id, newPassword);
      alert('Password updated successfully');
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update password', error);
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  // -- Role Handlers --
  const handleOpenRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ name: role.name, permissions: { ...role.permissions } });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', permissions: {} });
    }
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await roleApi.updateRole(editingRole.id, { name: roleForm.name, permissions: roleForm.permissions });
      } else {
        await roleApi.createRole({ name: roleForm.name, permissions: roleForm.permissions });
      }
      setIsRoleDialogOpen(false);
      const res = await roleApi.getRoles();
      if (res.data.success) setRoles(res.data.data);
    } catch (error: any) {
      console.error('Failed to save role', error);
      alert(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await roleApi.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      console.error('Failed to delete role', error);
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case 'ADMIN': return '#EF4444';
      case 'MANAGER': return '#F59E0B';
      case 'INVESTIGATOR': return '#3B82F6';
      case 'GUARDIAN': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (usersLoading || rolesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
          Access Management
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Role Management Guide</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          As an administrator, you have full control over the permissions granted to users. You can either assign them to one of the <strong>default roles</strong>, or create entirely new <strong>custom roles</strong>.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark' }}>Default Roles Overview:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
              <li><strong>ADMIN:</strong> Full unrestricted access to all modules and system settings.</li>
              <li><strong>MANAGER:</strong> Can view analytics, manage incidents, investigations, action items, and guardians.</li>
              <li><strong>INVESTIGATOR:</strong> Can view the dashboard, incidents, and action items, and manage investigations.</li>
              <li><strong>USER:</strong> Basic read-only access to the dashboard and incidents.</li>
              <li><strong>GUARDIAN:</strong> Basic access to view the dashboard, incidents, and action items.</li>
            </ul>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark' }}>How it Works:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
              <li><strong>Users & Assignments Tab:</strong> Link users to their appropriate roles and manage their active status.</li>
              <li><strong>Roles & Permissions Tab:</strong> Create new custom roles by ticking specific access checkboxes.</li>
              <li><em>Note: Changes to a role's permissions will immediately apply to all users assigned to that role upon their next navigation.</em></li>
            </ul>
          </Box>
        </Box>
      </Alert>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Users & Assignments" sx={{ fontWeight: 600 }} />
          <Tab label="Roles & Permissions" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRoleColor(user.role), 0.1),
                          color: getRoleColor(user.role),
                          fontWeight: 700,
                          minWidth: 100
                        }}
                      />
                      <Select
                        size="small"
                        value={user.role || ''}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        sx={{ minWidth: 140, height: 32, fontSize: '0.8rem' }}
                      >
                        {roles.map(r => (
                          <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActive}
                          onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: user.isActive ? 'text.primary' : 'text.secondary' }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenPasswordDialog(user)} sx={{ color: 'primary.main' }} title="Reset Password">
                      <VpnKeyIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenRoleDialog()}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[2] }}
            >
              Create Role
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Permissions Overview</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                    <TableCell>
                      <Chip
                        label={role.name}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRoleColor(role.name), 0.1),
                          color: getRoleColor(role.name),
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {role.permissions?.all ? (
                        <Typography variant="body2" color="text.secondary">All Access</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {Object.entries(role.permissions || {})
                            .filter(([_, v]) => v)
                            .map(([k]) => AVAILABLE_PERMISSIONS.find(p => p.id === k)?.label || k)
                            .join(', ') || 'None'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenRoleDialog(role)} sx={{ color: 'text.secondary' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {role.name !== 'ADMIN' && (
                        <IconButton size="small" onClick={() => handleDeleteRole(role.id)} sx={{ color: 'error.main' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onClose={() => setIsRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            fullWidth
            variant="outlined"
            value={roleForm.name}
            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })}
            disabled={editingRole?.name === 'ADMIN'}
            sx={{ mb: 3 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Permissions</Typography>
          <FormGroup>
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <FormControlLabel
                key={perm.id}
                control={
                  <Checkbox
                    checked={roleForm.permissions[perm.id] || false}
                    onChange={(e) => setRoleForm({
                      ...roleForm,
                      permissions: { ...roleForm.permissions, [perm.id]: e.target.checked }
                    })}
                  />
                }
                label={perm.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsRoleDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleSaveRole}
            variant="contained"
            disabled={!roleForm.name.trim()}
            sx={{ fontWeight: 600 }}
          >
            Save Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reset Password</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter a new password for <strong>{passwordTargetUser?.firstName} {passwordTargetUser?.lastName}</strong> ({passwordTargetUser?.email}).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsPasswordDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleResetPassword}
            variant="contained"
            disabled={newPassword.length < 6}
            sx={{ fontWeight: 600 }}
          >
            Save Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesManagementPage;
