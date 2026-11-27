const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    locationName: {
      type: String,
      default: "Mathura-Vrindavan, Uttar Pradesh",
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
    },
    department: {
      type: String,
      required: true,
    },
    authorityEmail: {
      type: String,
      default: "khushikprajapati9053@gmail.com",
    },
    priority: {
      type: Number,
      default: 1,
    },
    reportsCount: {
      type: Number,
      default: 1,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", issueSchema);
