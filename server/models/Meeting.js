import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  participants: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  location: { type: String },
  created: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", meetingSchema);
