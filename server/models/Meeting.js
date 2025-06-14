import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  date: { type: Date, required: true },
  duration: { type: Number, default: 30 },

  platform: {
    type: String,
    enum: ["google", "zoom", "microsoft", "other"],
    required: true,
  },

  meetlink: { type: String, required: true },

  participants: { type: [String], default: [] , required: true },

  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
