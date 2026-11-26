const fs = require("fs");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const Issue = require("../models/Issue");

const ALLOWED_CATEGORIES = [
  "Pothole",
  "Garbage",
  "Water Leakage",
  "Streetlight",
  "Dirty Washroom",
  "Drainage / Sewage",
  "Damaged Road",
  "Stray Animals",
  "Encroachment",
  "Other",
];

// Haversine formula to calculate distance between two coordinates in meters
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371e3; // Radius of the earth in m
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
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

// Logic to determine Department based on category (Mathura-Vrindavan civic bodies)
function getDepartment(category) {
  switch (category) {
    case "Pothole":
    case "Damaged Road":
      return "PWD / Road Department";
    case "Garbage":
    case "Dirty Washroom":
    case "Stray Animals":
      return "Nagar Nigam Sanitation Department";
    case "Water Leakage":
    case "Drainage / Sewage":
      return "Jal Kal / Water & Sewage Department";
    case "Streetlight":
      return "Electricity / Streetlight Department";
    case "Encroachment":
      return "MVDA / Enforcement Department";
    default:
      return "General Maintenance";
  }
}

// @desc    Analyze uploaded civic issue image with Gemini 2.5 Flash Vision
// @route   POST /api/issues/analyze-image
// @access  Private
exports.analyzeIssueImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload or capture an image to analyze" });
    }

    if (!process.env.GEMINI_API_KEY) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(500)
        .json({ message: "GEMINI_API_KEY is missing in backend .env" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              enum: ALLOWED_CATEGORIES,
            },
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            confidence: { type: SchemaType.STRING },
            isCivicIssue: { type: SchemaType.BOOLEAN },
          },
          required: [
            "category",
            "title",
            "description",
            "confidence",
            "isCivicIssue",
          ],
        },
      },
    });

    const imageBuffer = fs.readFileSync(req.file.path);
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `You are a civic infrastructure AI inspector for Mathura-Vrindavan, Uttar Pradesh.
Examine this photo and classify the visible public issue into strictly ONE of these categories:
${ALLOWED_CATEGORIES.join(", ")}.

Rules:
- If it shows an unhygienic, overflowing, or dirty public toilet/washroom, pick "Dirty Washroom".
- If it shows a broken, tilted, or unlit street lamp pole, pick "Streetlight".
- If it shows a crater or hole in asphalt/concrete, pick "Pothole"; for broader road collapse or broken pavement, pick "Damaged Road".
- Generate a concise, clear "title" (max 8 words) and a factual 2-sentence "description" describing the visible hazard and why municipal action is needed.
- Set "confidence" to "High", "Medium", or "Low", and "isCivicIssue" to false only if the photo is completely unrelated to civic infrastructure.`;

    const result = await model.generateContent([prompt, imagePart]);
    const analysis = JSON.parse(result.response.text());

    // Remove temporary preview file after analysis; final submit uploads the form image
    fs.unlink(req.file.path, () => {});

    const safeCategory = ALLOWED_CATEGORIES.includes(analysis.category)
      ? analysis.category
      : "Other";

    return res.status(200).json({
      category: safeCategory,
      title: analysis.title,
      description: analysis.description,
      department: getDepartment(safeCategory),
      confidence: analysis.confidence || "Medium",
      isCivicIssue: analysis.isCivicIssue !== false,
    });
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res
      .status(500)
      .json({ message: "AI image analysis failed", error: error.message });
  }
};

// @desc    Create new issue or merge with existing duplicate
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all required fields (title, description, category)",
        });
    }

    let lat = null;
    let lon = null;
    let duplicateIssue = null;

    if (
      latitude !== undefined &&
      latitude !== null &&
      latitude !== "" &&
      longitude !== undefined &&
      longitude !== null &&
      longitude !== ""
    ) {
      lat = parseFloat(latitude);
      lon = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lon)) {
        const existingIssues = await Issue.find({
          category,
          status: { $ne: "Resolved" },
        });

        for (let issue of existingIssues) {
          if (
            issue.latitude !== undefined &&
            issue.latitude !== null &&
            issue.longitude !== undefined &&
            issue.longitude !== null
          ) {
            const distance = getDistanceFromLatLonInM(
              lat,
              lon,
              issue.latitude,
              issue.longitude,
            );
            if (distance <= 50) {
              duplicateIssue = issue;
              break;
            }
          }
        }
      }
    }

    if (duplicateIssue) {
      duplicateIssue.reportsCount += 1;
      duplicateIssue.priority = calculatePriority(duplicateIssue.reportsCount);
      await duplicateIssue.save();

      return res.status(200).json({
        message:
          "⚠ Similar complaint already exists nearby. Reports Count incremented, Priority upgraded.",
        issue: duplicateIssue,
        isDuplicate: true,
      });
    }

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
      user: req.user.id,
    });

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all issues (for map / public view / admin)
// @route   GET /api/issues
// @access  Public
exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged in user's issues
// @route   GET /api/issues/myissues
// @access  Private
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = status;
    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
