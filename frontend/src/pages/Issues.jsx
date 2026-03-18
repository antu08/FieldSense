import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const modalSx = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 520 },
    background: 'rgba(10, 18, 35, 0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
    p: 4, borderRadius: 4,
    backdropFilter: 'blur(30px)',
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white', borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
};

const Issues = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedTech, setSelectedTech] = useState('');
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        fetchIssues();
        if (user?.role === 'admin' || user?.role === 'manager') {
            fetchTechnicians();
        }
    }, [user]);

    const fetchTechnicians = async () => {
        try {
            const res = await api.get('/technicians');
            setTechnicians(res.data);
        } catch (err) {
            console.error("Failed to fetch technicians:", err);
        }
    };

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues');
            setIssues(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenResolve = (issue) => {
        setSelectedIssue(issue);
        setResolutionNotes('');
        setOpen(true);
    };

    const handleOpenAssign = (issue) => {
        setSelectedIssue(issue);
        setSelectedTech('');
        setAssignOpen(true);
    };

    const handleAssignSubmit = async () => {
        try {
            await api.put(`/issues/${selectedIssue.issue_id}/assign`, {
                tech_id: selectedTech
            });
            setAssignOpen(false);
            fetchIssues();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (issueId, newStatus) => {
        try {
            await api.put(`/issues/${issueId}/status`, { status: newStatus });
            fetchIssues();
        } catch (err) {
            console.error(err);
        }
    };

    const handleResolveSubmit = async () => {
        try {
            await api.put(`/issues/${selectedIssue.issue_id}/close`, {
                resolution_notes: resolutionNotes
            });
            setOpen(false);
            fetchIssues(); // Refresh the table
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'error';
            case 'assigned': return 'warning';
            case 'reached_spot': return 'info';
            case 'in_progress': return 'primary';
            case 'needs_help': return 'error';
            case 'resolved': return 'success';
            case 'closed': return 'default';
            default: return 'default';
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                        Issue Tracker
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Monitor active field issues and assign technicians for resolution.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ px: 2, py: 0.75, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'var(--danger)', fontWeight: 700 }}>
                            {issues.filter(i => i.status === 'open').length} OPEN
                        </Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 0.75, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 700 }}>
                            {issues.filter(i => i.status === 'resolved' || i.status === 'closed').length} RESOLVED
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {issues.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 10, color: 'var(--text-muted)' }}>
                            <ReportProblemIcon sx={{ fontSize: 64, opacity: 0.15, mb: 2 }} />
                            <Typography sx={{ fontStyle: 'italic' }}>No issues found. All systems running normally.</Typography>
                        </Box>
                    </Grid>
                )}
                {issues.map((issue, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={issue.issue_id}
                        sx={{ animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`, '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}
                    >
                        <Card className="issue-card" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'var(--text-muted)' }}>
                                        #{issue.issue_id}
                                    </Typography>
                                    <Chip label={issue.status.replace('_', ' ').toUpperCase()} color={getStatusColor(issue.status)} size="small" sx={{ fontWeight: 600 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text-light)' }}>
                                    {issue.product_name || `Asset: ${issue.asset_id}`}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                                    {issue.company_name || 'System Generated'}
                                </Typography>
                                
                                <Box sx={{ p: 1.5, background: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'var(--danger)', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {/* Red Dot for priority styling */}
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></span>
                                        {issue.issue_type}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                                        {(issue.description || 'No description provided.').substring(0, 100)}{(issue.description || '').length > 100 ? '...' : ''}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {issue.technician_name ? issue.technician_name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'white' }}>Assignee:</strong> <br/>
                                        {issue.technician_name || 'Unassigned'}
                                    </Typography>
                                </Box>
                            </CardContent>
                            
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                            
                            <CardActions sx={{ p: 2, display: 'flex', flexWrap: 'nowrap', gap: 1, background: 'rgba(255,255,255,0.02)' }}>
                                {issue.status === 'closed' ? (
                                    <Typography variant="body2" color="var(--success)" sx={{ fontStyle: 'italic', textAlign: 'center', width: '100%', fontWeight: 600 }}>
                                        ✓ Resolved: {issue.resolution_notes || 'No notes.'}
                                    </Typography>
                                ) : (
                                    <Box sx={{ width: '100%', display: 'flex', gap: 1, flexDirection: 'column' }}>
                                        {user?.role === 'technician' && issue.status === 'assigned' && (
                                            <Button variant="contained" size="small" color="info" fullWidth sx={{ borderRadius: 2 }} onClick={() => handleStatusUpdate(issue.issue_id, 'reached_spot')}>
                                                Reached Spot
                                            </Button>
                                        )}
                                        {user?.role === 'technician' && (issue.status === 'reached_spot' || issue.status === 'in_progress') && (
                                            <Button variant="contained" size="small" color="error" fullWidth sx={{ borderRadius: 2 }} onClick={() => handleStatusUpdate(issue.issue_id, 'needs_help')}>
                                                Needs Help
                                            </Button>
                                        )}
                                        {user?.role === 'technician' && issue.status !== 'resolved' && (
                                            <Button variant="outlined" size="small" color="success" fullWidth sx={{ borderRadius: 2, borderWidth: 2 }} onClick={() => handleOpenResolve(issue)}>
                                                Resolve
                                            </Button>
                                        )}
                                        {/* Prominent Assign Technician Option below the issue details for Managers */}
                                        {(user?.role === 'manager' || user?.role === 'admin') && (issue.status === 'open' || issue.status === 'needs_help' || issue.status === 'in_progress') && (
                                            <Button variant="contained" size="small" color="primary" fullWidth sx={{ borderRadius: 2, py: 1, fontWeight: 600 }} onClick={() => handleOpenAssign(issue)}>
                                                {issue.status === 'open' ? 'Assign Technician' : 'Re-Assign Technician'}
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <CheckCircleIcon sx={{ color: 'var(--success)', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                            Resolve Issue #{selectedIssue?.issue_id}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2, mb: 3, background: 'rgba(245,158,11,0.07)', borderRadius: 2, border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Typography variant="body2" sx={{ color: 'var(--warning)' }}>
                            <strong>Asset:</strong> {selectedIssue?.asset_id} &nbsp;|&nbsp; <strong>Type:</strong> {selectedIssue?.issue_type}
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth multiline rows={4}
                        label="Resolution Notes"
                        placeholder="Describe how the issue was fixed for future reference..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiOutlinedInput-root textarea': { color: 'white' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button fullWidth variant="outlined" onClick={() => setOpen(false)}
                            sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-muted)' }}>Cancel</Button>
                        <Button fullWidth variant="contained" color="success" onClick={handleResolveSubmit} disabled={!resolutionNotes.trim()}
                            sx={{ borderRadius: '10px', fontWeight: 700 }}>Complete Repair</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Assign Technician Modal */}
            <Modal open={assignOpen} onClose={() => setAssignOpen(false)}>
                <Box sx={modalSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <PersonPinIcon sx={{ color: 'var(--primary-color)', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                            Assign Technician — Issue #{selectedIssue?.issue_id}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 2, mb: 3, background: 'rgba(239,68,68,0.07)', borderRadius: 2, border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Typography variant="body2" sx={{ color: 'white', mb: 0.75, fontWeight: 600 }}>
                            📦 {selectedIssue?.product_name || selectedIssue?.asset_id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--danger)' }}>
                            ⚠ {selectedIssue?.issue_type}: {selectedIssue?.description?.substring(0, 100)}
                        </Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3, ...fieldSx }}>
                        <InputLabel>Select Technician</InputLabel>
                        <Select
                            value={selectedTech}
                            label="Select Technician"
                            onChange={(e) => setSelectedTech(e.target.value)}
                        >
                            {technicians.map(tech => (
                                <MenuItem key={tech.tech_id} value={tech.tech_id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                                        <span style={{ fontWeight: 600 }}>{tech.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'gray' }}>📍 {tech.location || 'No location'}</span>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button fullWidth variant="outlined" onClick={() => setAssignOpen(false)}
                            sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-muted)' }}>Cancel</Button>
                        <Button fullWidth variant="contained" onClick={handleAssignSubmit} disabled={!selectedTech}
                            sx={{ borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', boxShadow: '0 4px 15px var(--primary-glow)' }}>
                            Assign Issue
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Issues;
