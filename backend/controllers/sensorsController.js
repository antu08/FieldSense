const db = require('../config/db');

exports.receiveData = async (req, res) => {
    try {
        const { asset_id, temperature, power_status, device_status } = req.body;

        // Log sensor data
        await db.query(
            'INSERT INTO sensor_logs (asset_id, temperature, power_status, device_status) VALUES (?, ?, ?, ?)',
            [asset_id, temperature, power_status, device_status]
        );

        // Fetch threshold configurations for this asset type
        const [assets] = await db.query('SELECT asset_type FROM assets WHERE asset_id = ?', [asset_id]);
        if (assets.length > 0) {
            const asset_type = assets[0].asset_type;
            const [configs] = await db.query('SELECT * FROM threshold_config WHERE asset_type = ?', [asset_type]);

            if (configs.length > 0) {
                const config = configs[0];
                let isAnomaly = false;
                let issueDescription = '';

                if (temperature > config.max_temperature || temperature < config.min_temperature) {
                    isAnomaly = true;
                    issueDescription += `Temperature out of bounds: ${temperature}. `;
                }
                if (config.power_failure_alert && power_status === 'OFF') {
                    isAnomaly = true;
                    issueDescription += `Power failure detected. `;
                }
                if (device_status === 'ONLINE') { 
                    // ONLINE is OK, OFFLINE is anomaly
                } else if (device_status === 'OFFLINE') {
                    isAnomaly = true;
                    issueDescription += `Device is offline. `;
                }

                if (isAnomaly) {
                    // Create automatic issue
                    await db.query(
                        'INSERT INTO issues (asset_id, issue_type, description, priority, status) VALUES (?, ?, ?, ?, ?)',
                        [asset_id, 'Anomaly Detection', issueDescription, 'high', 'open']
                    );
                }
            }
        }

        res.status(201).json({ message: 'Sensor data recorded successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
