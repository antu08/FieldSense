const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const issueRoutes = require('./routes/issues');
const technicianRoutes = require('./routes/technicians');
const sensorRoutes = require('./routes/sensors');
const dashboardRoutes = require('./routes/dashboard');

// Use Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/technicians', technicianRoutes);
app.use('/api/v1/sensors', sensorRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
