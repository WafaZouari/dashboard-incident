import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Paper, Grid, Tooltip, alpha, useTheme
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import AssignmentForm from './AssignmentForm';
import type { GuardianAssignment } from '../../types/guardian';
import { guardianApi } from '../../services/guardianApi';

const GuardianCalendar: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<Record<string, GuardianAssignment[]>>({});
  
  // Assignment Form State
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [editingAssignment, setEditingAssignment] = useState<GuardianAssignment | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendarData = async () => {
    try {
      const res = await guardianApi.getCalendarAssignments(month + 1, year);
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data', error);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setEditingAssignment(null);
    setFormOpen(true);
  };

  const handleAssignmentClick = (e: React.MouseEvent, dateStr: string, assignment: GuardianAssignment) => {
    e.stopPropagation();
    setSelectedDateStr(dateStr);
    setEditingAssignment(assignment);
    setFormOpen(true);
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay(); // 0 = Sunday

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  
  const days = [];
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePrevMonth}><ChevronLeftIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
            {monthNames[month]} {year}
          </Typography>
          <IconButton onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDayClick(new Date().toISOString().split('T')[0])}>
          Add Assignment
        </Button>
      </Box>

      <Paper sx={{ border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        {/* Days of week header */}
        <Grid container sx={{ background: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid size={{ xs: 12/7 }} key={day} sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{day}</Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container>
          {days.map((day, index) => {
            if (day === null) {
              return <Grid size={{ xs: 12/7 }} key={`empty-${index}`} sx={{ borderRight: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 120, bgcolor: alpha(theme.palette.background.default, 0.4) }} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayAssignments = assignments[dateStr] || [];

            return (
              <Grid 
                size={{ xs: 12/7 }} 
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                sx={{ 
                  borderRight: (index + 1) % 7 === 0 ? 'none' : `1px solid ${theme.palette.divider}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  minHeight: 140,
                  p: 1,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isToday ? 700 : 500, 
                    color: isToday ? 'primary.main' : 'text.primary',
                    mb: 1
                  }}
                >
                  {day}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {dayAssignments.map((assignment) => (
                    <Tooltip 
                      key={assignment.id} 
                      title={`${assignment.guardian?.fullName} - ${assignment.shift?.name} (${assignment.shift?.startTime}-${assignment.shift?.endTime})`}
                      placement="top"
                    >
                      <Box
                        onClick={(e) => handleAssignmentClick(e, dateStr, assignment)}
                        sx={{
                          p: 0.5,
                          px: 1,
                          borderRadius: 1,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: alpha(assignment.shift?.color || theme.palette.primary.main, 0.15),
                          color: assignment.shift?.color || theme.palette.primary.main,
                          borderLeft: `3px solid ${assignment.shift?.color || theme.palette.primary.main}`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': { filter: 'brightness(1.2)' }
                        }}
                      >
                        {assignment.guardian?.firstName} {assignment.guardian?.lastName?.charAt(0)}.
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <AssignmentForm
        open={formOpen}
        selectedDate={selectedDateStr}
        assignment={editingAssignment}
        onClose={() => setFormOpen(false)}
        onSaved={fetchCalendarData}
      />
    </Box>
  );
};

export default GuardianCalendar;
