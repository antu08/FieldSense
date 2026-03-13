import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';

const Issues = () => {
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues');
            setIssues(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'error';
            case 'assigned': return 'warning';
            case 'in_progress': return 'info';
            case 'resolved': return 'success';
            case 'closed': return 'default';
            default: return 'default';
        }
    };

    return (
        <div>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Issue Tracking</Typography>
                <Typography variant="body2" color="var(--text-muted)">Monitor and manage field asset issues.</Typography>
            </Box>

            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Asset</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Issue Type</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Description</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Technician</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {issues.map((issue) => (
                            <TableRow key={issue.issue_id}>
                                <TableCell sx={{ color: 'white' }}>#{issue.issue_id}</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>{issue.asset_id}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{issue.issue_type}</TableCell>
                                <TableCell sx={{ color: 'var(--text-muted)' }}>{issue.description.substring(0, 50)}...</TableCell>
                                <TableCell sx={{ color: 'white' }}>{issue.technician_name || 'Unassigned'}</TableCell>
                                <TableCell>
                                    <Chip label={issue.status.toUpperCase()} color={getStatusColor(issue.status)} size="small" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Issues;
