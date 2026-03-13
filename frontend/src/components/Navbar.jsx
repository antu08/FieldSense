import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <AppBar position="static" sx={{ background: 'var(--bg-card)', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { sm: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'var(--primary-color)' }}>
                    FieldSense Dashboard
                </Typography>
                
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{user.role.toUpperCase()}</Typography>
                        </div>
                        <AccountCircle />
                        <Button color="inherit" onClick={logout} sx={{ ml: 2, border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                            Logout
                        </Button>
                    </div>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
