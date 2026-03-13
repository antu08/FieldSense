const db = require('../config/db');

exports.getSummary = async (req, res) => {
    try {
        const [totalAssets] = await db.query('SELECT COUNT(*) as count FROM assets');
        const [activeIssues] = await db.query('SELECT COUNT(*) as count FROM issues WHERE status != "closed"');
        const [resolvedIssues] = await db.query('SELECT COUNT(*) as count FROM issues WHERE status = "closed"');
        
        // Fault distribution based on issue_type
        const [faultDistribution] = await db.query('SELECT issue_type, COUNT(*) as count FROM issues GROUP BY issue_type');
        
        // Recent alerts
        const [recentAlerts] = await db.query('SELECT * FROM issues WHERE issue_type = "Anomaly Detection" ORDER BY created_at DESC LIMIT 5');

        res.json({
            totalAssets: totalAssets[0].count,
            activeIssues: activeIssues[0].count,
            resolvedIssues: resolvedIssues[0].count,
            faultDistribution,
            recentAlerts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
