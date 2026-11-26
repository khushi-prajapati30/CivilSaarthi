const Issue = require('../models/Issue');

// @desc    Get dashboard analytics statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalComplaints = await Issue.countDocuments();
        const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const highPriorityIssues = await Issue.countDocuments({ priority: { $gte: 5 } });

        // Complaints by category for chart
        const categoryStats = await Issue.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Department performance (resolved vs total)
        const departmentStatsRaw = await Issue.aggregate([
            {
                $group: {
                    _id: '$department',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
                    }
                }
            }
        ]);

        const formatCategoryStats = categoryStats.map(stat => ({
            name: stat._id,
            value: stat.count
        }));

        const formatDeptStats = departmentStatsRaw.map(stat => ({
            name: stat._id,
            total: stat.total,
            resolved: stat.resolved
        }));

        res.json({
            totalComplaints,
            pendingIssues,
            resolvedIssues,
            highPriorityIssues,
            categoryStats: formatCategoryStats,
            departmentStats: formatDeptStats
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
