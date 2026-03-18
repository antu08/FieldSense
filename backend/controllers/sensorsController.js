const db = require('../config/db');

exports.receiveData = async (req, res) => {
    try {
        const { asset_id, temperature, power_status, device_status } = req.body;

        // Log sensor data
        await db.query(
            'INSERT INTO sensor_logs (asset_id, temperature, power_status, device_status) VALUES (?, ?, ?, ?)',
            [asset_id, temperature, power_status, device_status]
        );

        // Fetch threshold configurations from this asset directly
        const [assets] = await db.query('SELECT min_temp_celsius, max_temp_celsius FROM assets WHERE asset_id = ?', [asset_id]);
        if (assets.length > 0) {
            const asset = assets[0];
            let isAnomaly = false;
            let issueDescription = '';

            // Ensure we actually have defined temps to check against
            if (asset.max_temp_celsius !== null && asset.min_temp_celsius !== null) {
                if (temperature > asset.max_temp_celsius || temperature < asset.min_temp_celsius) {
                    isAnomaly = true;
                    // Provide an informative alert message:
                    issueDescription += `Alert! Product temperature (${temperature}°C) is out of safe storage bounds (${asset.min_temp_celsius}°C - ${asset.max_temp_celsius}°C). `;
                }
            }

            if (power_status === 'power_loss' || power_status === 'offline') {
                isAnomaly = true;
                issueDescription += `CRITICAL: Refrigerator power supply interrupted (${power_status}). `;
            }
            if (device_status === 'offline') {
                isAnomaly = true;
                issueDescription += `Warning: IoT Sensor module went offline. `;
            }

            if (isAnomaly) {
                // Determine priority
                let priorityLevel = 'high';
                if (power_status === 'power_loss') priorityLevel = 'critical';

                // Create automatic issue
                await db.query(
                    'INSERT INTO issues (asset_id, issue_type, description, priority, status) VALUES (?, ?, ?, ?, ?)',
                    [asset_id, 'IoT Sensor Alert', issueDescription, priorityLevel, 'open']
                );
            }
        }

        res.status(201).json({ message: 'Sensor data recorded successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
