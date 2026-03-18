import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const Live = () => {
    const [sensors, setSensors] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSensors = async () => {
        try {
            const r = await api.get('/dashboard/summary');
            setSensors(r.data.liveSensorData || []);
            setLastRefresh(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
        const t = setInterval(fetchSensors, 10000);
        return () => clearInterval(t);
    }, []);

    const alertCount = sensors.filter(s => {
        const warn = s.temperature !== null && (s.temperature > s.max_temp_celsius || s.temperature < s.min_temp_celsius);
        const pwrWarn = ['power_loss', 'offline'].includes(s.power_status);
        return warn || pwrWarn;
    }).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <span className="live-dot" />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                            Live Refrigerator Telemetry
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Real-time IoT sensor readings from all cold storage units. Auto-refreshes every 10 seconds.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {alertCount > 0 && (
                        <Box sx={{ px: 2, py: 0.75, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ color: 'var(--danger)', fontWeight: 700 }}>
                                ⚠ {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ px: 2, py: 0.75, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                            AUTO-REFRESH 10s
                        </Typography>
                    </Box>
                    {lastRefresh && (
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                            Updated {lastRefresh.toLocaleTimeString()}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Summary stat row */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Units', value: sensors.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Online', value: sensors.filter(s => s.temperature !== null).length, color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
                    { label: 'No Signal', value: sensors.filter(s => s.temperature === null).length, color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' },
                    { label: 'Alerts', value: alertCount, color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
                ].map(s => (
                    <Box key={s.label} sx={{ px: 2.5, py: 1.5, borderRadius: 2, background: s.bg, border: `1px solid ${s.color}22`, minWidth: 100 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>{s.label}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Full Telemetry Table */}
            <Box sx={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(0,0,0,0.2)' }}>
                    <SignalCellularAltIcon sx={{ color: 'var(--primary-color)', fontSize: 18 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>Sensor Readings</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', ml: 1 }}>
                        {sensors.length} unit{sensors.length !== 1 ? 's' : ''} monitored
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <ThermostatIcon sx={{ fontSize: 40, color: 'var(--primary-color)', opacity: 0.4, mb: 1 }} />
                        <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading sensor data...</Typography>
                    </Box>
                ) : sensors.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <WifiOffIcon sx={{ fontSize: 48, color: 'var(--text-muted)', opacity: 0.3, mb: 2 }} />
                        <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sensor data available. Connect IoT devices to see readings.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Location', 'Product', 'Company', 'Target Range', 'Current Temp', 'Power Status', 'Last Update'].map(h => (
                                        <TableCell key={h} sx={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.07em', textTransform: 'uppercase', py: 1.5 }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sensors.map((s, idx) => {
                                    const hasTemp = s.temperature !== null && s.temperature !== undefined;
                                    const warn = hasTemp && (s.temperature > s.max_temp_celsius || s.temperature < s.min_temp_celsius);
                                    const pwrWarn = ['power_loss', 'offline'].includes(s.power_status);
                                    return (
                                        <TableRow key={s.asset_id}
                                            sx={{
                                                background: (warn || pwrWarn) ? 'rgba(239,68,68,0.04)' : 'transparent',
                                                '&:hover td': { background: 'rgba(255,255,255,0.03)' },
                                                animation: `fadeInUp 0.25s ease ${idx * 0.04}s both`,
                                                '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
                                            }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {(warn || pwrWarn) && (
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0, boxShadow: '0 0 6px var(--danger)' }} />
                                                    )}
                                                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                                        {s.location || s.asset_id}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.65rem' }}>{s.asset_id}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--text-dim)', fontWeight: 500 }}>{s.product_name}</TableCell>
                                            <TableCell sx={{ color: 'var(--text-muted)' }}>{s.company_name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <ThermostatIcon sx={{ fontSize: 15, color: '#38bdf8' }} />
                                                    <Typography variant="body2" sx={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                                                        {s.min_temp_celsius}° – {s.max_temp_celsius}°C
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {hasTemp ? (
                                                    <Box>
                                                        <Chip label={`${s.temperature}°C`} size="small"
                                                            sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.78rem', background: warn ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)', color: warn ? '#f87171' : '#34d399', border: `1px solid ${warn ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'}`, height: 26 }}
                                                        />
                                                        {warn && <Typography variant="caption" sx={{ display: 'block', color: 'var(--danger)', fontSize: '0.65rem', mt: 0.25 }}>⚠ Threshold breached!</Typography>}
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <WifiOffIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Signal</Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {s.power_status ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                        <BoltIcon sx={{ fontSize: 15, color: pwrWarn ? 'var(--danger)' : 'var(--success)' }} />
                                                        <Chip label={s.power_status.replace('_', ' ').toUpperCase()} size="small"
                                                            sx={{ fontWeight: 700, fontSize: '0.65rem', background: pwrWarn ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)', color: pwrWarn ? 'var(--danger)' : 'var(--success)', border: `1px solid ${pwrWarn ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}` }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <WifiOffIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Signal</Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    {s.last_update ? new Date(s.last_update).toLocaleTimeString() : '—'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </div>
    );
};

export default Live;
