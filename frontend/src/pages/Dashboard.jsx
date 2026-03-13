import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const Dashboard = () => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard summary", err);
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, []);

    if (!summary) return <div>Loading dashboard...</div>;

    const pieData = summary.faultDistribution.map(item => ({
        name: item.issue_type,
        value: item.count
    }));

    return (
        <div>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>Overview</Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper className="glass-panel" sx={{ p: 3, textAlign: 'center', background: 'var(--bg-card)' }}>
                        <Typography variant="h6" color="var(--text-muted)">Total Assets</Typography>
                        <Typography variant="h3" sx={{ color: 'var(--primary-color)', mt: 1, fontWeight: 700 }}>
                            {summary.totalAssets}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper className="glass-panel" sx={{ p: 3, textAlign: 'center', background: 'var(--bg-card)' }}>
                        <Typography variant="h6" color="var(--text-muted)">Active Issues</Typography>
                        <Typography variant="h3" sx={{ color: 'var(--danger)', mt: 1, fontWeight: 700 }}>
                            {summary.activeIssues}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper className="glass-panel" sx={{ p: 3, textAlign: 'center', background: 'var(--bg-card)' }}>
                        <Typography variant="h6" color="var(--text-muted)">Resolved Issues</Typography>
                        <Typography variant="h3" sx={{ color: 'var(--success)', mt: 1, fontWeight: 700 }}>
                            {summary.resolvedIssues}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper className="glass-panel" sx={{ p: 3, height: '350px', background: 'var(--bg-card)' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Fault Distribution</Typography>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--primary-color)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography color="var(--text-muted)" sx={{ mt: 5, textAlign: 'center' }}>No fault data available</Typography>
                        )}
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper className="glass-panel" sx={{ p: 3, height: '350px', background: 'var(--bg-card)', overflowY: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent IoT Alerts</Typography>
                        {summary.recentAlerts.length > 0 ? (
                            summary.recentAlerts.map(alert => (
                                <Box key={alert.issue_id} sx={{ mb: 2, p: 2, borderLeft: '4px solid var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--danger)' }}>
                                        Asset: {alert.asset_id}
                                    </Typography>
                                    <Typography variant="body2">{alert.description}</Typography>
                                    <Typography variant="caption" color="var(--text-muted)">
                                        {new Date(alert.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography color="var(--text-muted)" sx={{ mt: 5, textAlign: 'center' }}>No recent alerts</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default Dashboard;
