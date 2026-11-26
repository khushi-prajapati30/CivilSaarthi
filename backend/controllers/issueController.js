const Issue = require('../models/Issue');

// Haversine formula to calculate distance between two coordinates in meters
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371e3; // Radius of the earth in m
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in m
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Logic to determine Priority based on reportsCount
function calculatePriority(count) {
    if (count === 1) return 1;
    if (count === 2) return 4;
    if (count === 3) return 6;
    return 8;
}

// Logic to determine Department based on category
function getDepartment(category) {
    switch (category) {
        case 'Pothole': return 'Road Department';
        case 'Garbage': return 'Sanitation Department';
        case 'Water Leakage': return 'Water Department';
        case 'Streetlight': return 'Electricity Department';
        default: return 'General Maintenance';
    }
}

// @desc    Create new issue or merge with existing duplicate
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
    try {
        const { title, description, category, latitude, longitude } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Please provide all required fields (title, description, category)' });
        }

        let lat = null;
        let lon = null;
        let duplicateIssue = null;

        if (latitude !== undefined && latitude !== null && latitude !== '' &&
            longitude !== undefined && longitude !== null && longitude !== '') {
            lat = parseFloat(latitude);
            lon = parseFloat(longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
                // Duplicate Detection Logic:
                // Find issues of the same category that are NOT Resolved
                const existingIssues = await Issue.find({
                    category,
                    status: { $ne: 'Resolved' }
                });

                for (let issue of existingIssues) {
                    if (issue.latitude !== undefined && issue.latitude !== null &&
                        issue.longitude !== undefined && issue.longitude !== null) {
                        const distance = getDistanceFromLatLonInM(lat, lon, issue.latitude, issue.longitude);
                        if (distance <= 50) { // 50 meters radius
                            duplicateIssue = issue;
                            break;
                        }
                    }
                }
            }
        }

        if (duplicateIssue) {
            // Merge: increment reports count and recalculate priority
            duplicateIssue.reportsCount += 1;
            duplicateIssue.priority = calculatePriority(duplicateIssue.reportsCount);
            await duplicateIssue.save();

            return res.status(200).json({
                message: '⚠ Similar complaint already exists nearby. Reports Count incremented, Priority upgraded.',
                issue: duplicateIssue,
                isDuplicate: true
            });
        }

        // Create new issue
        const department = getDepartment(category);
        const priority = calculatePriority(1);

        const newIssue = await Issue.create({
            title,
            description,
            category,
            latitude: lat,
            longitude: lon,
            image,
            department,
            priority,
            user: req.user.id
        });

        res.status(201).json({
            message: 'Issue reported successfully',
            issue: newIssue
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all issues (for map / public view / admin)
// @route   GET /api/issues
// @access  Public
exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get logged in user's issues
// @route   GET /api/issues/myissues
// @access  Private
exports.getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update issue status (Admin only)
// @route   PUT /api/issues/:id/status
// @access  Private/Admin
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = status;
        const updatedIssue = await issue.save();
        res.json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
