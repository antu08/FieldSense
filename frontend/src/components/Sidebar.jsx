import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EngineeringIcon from '@mui/icons-material/Engineering';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    const getNavItems = () => {
        const items = [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
            { text: 'Assets', icon: <InventoryIcon />, path: '/assets' },
            { text: 'Issues', icon: <ReportProblemIcon />, path: '/issues' },
        ];

        if (user?.role === 'admin' || user?.role === 'manager') {
            items.push({ text: 'Technicians', icon: <EngineeringIcon />, path: '/technicians' });
        }
        return items;
    };

    return (
        <div style={{
            width: '240px',
            background: 'var(--bg-card)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem' }}>FieldSense</h2>
                <small style={{ color: 'var(--text-muted)' }}>Operations Visibility</small>
            </div>
            <List>
                {getNavItems().map((item) => (
                    <NavLink
                        key={item.text}
                        to={item.path}
                        style={({ isActive }) => ({
                            textDecoration: 'none',
                            color: isActive ? 'var(--text-light)' : 'var(--text-muted)',
                            background: isActive ? 'var(--primary-hover)' : 'transparent',
                            display: 'block',
                            borderRadius: '8px',
                            margin: '0.25rem 1rem'
                        })}
                    >
                        <ListItem button sx={{ borderRadius: '8px', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItem>
                    </NavLink>
                ))}
            </List>
        </div>
    );
};

export default Sidebar;
