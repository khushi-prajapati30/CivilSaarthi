const express = require("express");
const router = express.Router();
const {
  createIssue,
  getIssues,
  getMyIssues,
  updateIssueStatus,
  analyzeIssueImage,
} = require("../controllers/issueController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/analyze-image",
  protect,
  upload.single("image"),
  analyzeIssueImage,
);

router
  .route("/")
  .get(getIssues)
  .post(protect, upload.single("image"), createIssue);

router.route("/all").get(getIssues);

router.route("/myissues").get(protect, getMyIssues);

router.route("/:id/status").put(protect, admin, updateIssueStatus);

module.exports = router;
