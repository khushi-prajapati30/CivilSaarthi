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

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371e3;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function calculatePriority(count) {
  if (count === 1) return 1;
  if (count === 2) return 4;
  if (count === 3) return 6;
  return 8;
}

function getDepartmentInfo(category) {
  switch (category) {
    case "Pothole":
    case "Damaged Road":
      return {
        department: "PWD / Road Department",
        authorityEmail: "khushikprajapati9053@gmail.com",
      };
    case "Water Leakage":
    case "Drainage / Sewage":
      return {
        department: "Jal Kal / Water & Sewage Department",
        authorityEmail: "khushikprajapati9053@gmail.com",
      };
    case "Garbage":
    case "Dirty Washroom":
    case "Stray Animals":
      return {
        department: "Nagar Nigam Sanitation Department",
        authorityEmail: "mishraprashantpm2005@gmail.com",
      };
    case "Streetlight":
      return {
        department: "Electricity / Streetlight Department",
        authorityEmail: "mishraprashantpm2005@gmail.com",
      };
    case "Encroachment":
      return {
        department: "MVDA / Enforcement Department",
        authorityEmail: "mishraprashantpm2005@gmail.com",
      };
    default:
      return {
        department: "General Maintenance",
        authorityEmail: "mishraprashantpm2005@gmail.com",
      };
  }
}

async function getAvailableVisionModels(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();
    if (!data.models) return [];

    const valid = data.models
      .filter(
        (m) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent") &&
          m.name.includes("gemini") &&
          !m.name.includes("embedding") &&
          !m.name.includes("tts") &&
          !m.name.includes("image") &&
          !m.name.includes("thinking"),
      )
      .map((m) => m.name.replace("models/", ""));

    return valid.sort((a, b) => {
      const score = (name) => {
        if (name.includes("lite")) return 1;
        if (name.includes("2.0-flash")) return 2;
        if (name.includes("flash")) return 3;
        return 4;
      };
      return score(a) - score(b);
    });
  } catch {
    return [];
  }
}

// @desc    Analyze uploaded civic issue image with Gemini Vision
// @route   POST /api/issues/analyze-image
// @access  Private
exports.analyzeIssueImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload or capture an image to analyze" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(500)
        .json({ message: "GEMINI_API_KEY is missing in backend .env" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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

    const tryModel = async (modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
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
      return await model.generateContent([prompt, imagePart]);
    };

    let result = null;
    let lastError = null;

    try {
      result = await tryModel("gemini-3.8-flash");
    } catch (err) {
      lastError = err;
      const dynamicModels = await getAvailableVisionModels(apiKey);
      for (const fallbackModel of dynamicModels.slice(0, 3)) {
        if (fallbackModel === "gemini-3.8-flash") continue;
        try {
          result = await tryModel(fallbackModel);
          break;
        } catch (fallbackErr) {
          lastError = fallbackErr;
        }
      }
    }

    fs.unlink(req.file.path, () => {});

    if (!result) {
      throw (
        lastError || new Error("No available Gemini vision model responded")
      );
    }

    const analysis = JSON.parse(result.response.text());
    const safeCategory = ALLOWED_CATEGORIES.includes(analysis.category)
      ? analysis.category
      : "Other";
    const deptInfo = getDepartmentInfo(safeCategory);

    return res.status(200).json({
      category: safeCategory,
      title: analysis.title,
      description: analysis.description,
      department: deptInfo.department,
      authorityEmail: deptInfo.authorityEmail,
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
    const { title, description, category, locationName, latitude, longitude } =
      req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description || !category) {
      return res.status(400).json({
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

    const deptInfo = getDepartmentInfo(category);
    const priority = calculatePriority(1);

    const newIssue = await Issue.create({
      title,
      description,
      category,
      locationName: locationName?.trim() || "Mathura-Vrindavan, Uttar Pradesh",
      latitude: lat,
      longitude: lon,
      image,
      department: deptInfo.department,
      authorityEmail: deptInfo.authorityEmail,
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

// @desc    Citizen / Reporter verification to mark an issue as Completed (Resolved)
// @route   PUT /api/issues/:id/resolve
// @access  Private
exports.resolveIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = "Resolved";
    issue.resolvedBy = req.user.id;
    const updatedIssue = await issue.save();

    res.json({
      message: "Issue verified and marked as Completed!",
      issue: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
