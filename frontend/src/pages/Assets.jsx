import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, TextField, Box, Modal } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'var(--bg-card)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [open, setOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({ asset_id: '', asset_type: '', location: '', status: 'active' });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await api.get('/assets');
            setAssets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        try {
            await api.post('/assets', { ...newAsset, installation_date: new Date().toISOString().split('T')[0] });
            setOpen(false);
            fetchAssets();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Asset Management</Typography>
                <Button variant="contained" sx={{ background: 'var(--primary-color)' }} onClick={() => setOpen(true)}>
                    + Add Asset
                </Button>
            </Box>

            <TableContainer component={Paper} className="glass-panel" sx={{ background: 'var(--bg-card)', color: 'white' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Asset ID</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Type</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Location</TableCell>
                            <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.asset_id}>
                                <TableCell sx={{ color: 'white' }}>{asset.asset_id}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{asset.asset_type}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{asset.location}</TableCell>
                                <TableCell sx={{ color: asset.status === 'active' ? 'var(--success)' : 'var(--warning)' }}>
                                    {asset.status.toUpperCase()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={style}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-light)' }}>Add New Asset</Typography>
                    <TextField fullWidth margin="dense" label="Asset ID" value={newAsset.asset_id} onChange={(e) => setNewAsset({...newAsset, asset_id: e.target.value})} sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'gray' } }} />
                    <TextField fullWidth margin="dense" label="Type" value={newAsset.asset_type} onChange={(e) => setNewAsset({...newAsset, asset_type: e.target.value})} sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'gray' } }} />
                    <TextField fullWidth margin="dense" label="Location" value={newAsset.location} onChange={(e) => setNewAsset({...newAsset, location: e.target.value})} sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'gray' } }} />
                    <Button variant="contained" fullWidth sx={{ mt: 3, background: 'var(--success)' }} onClick={handleCreate}>Save Asset</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default Assets;
