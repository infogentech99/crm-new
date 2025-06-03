import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  assignee:    { type: String },
  dueDate:     { type: String },
  priority:    {
    type: String,
    enum: ['Low','Medium','High'],
    default: 'Medium'
  },
  status:      {
    type: String,
    enum: ['Pending','In Progress','Completed'],
    default: 'Pending'
  },
  repeat:      {
    type: String,
    enum: ['None','Daily','Weekly','Monthly'],
    default: 'None'
  },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  created:     { type: Date, default: Date.now },
});

export default mongoose.models.Task ||
  mongoose.model('Task', taskSchema);
