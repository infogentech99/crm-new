import Meeting from '../models/Meeting.js';
import { sendEmail } from '../utils/email.js';
export const getAllMeetings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        // Assuming participants can be searched by name/email if populated
        // { 'participants.name': { $regex: search, $options: 'i' } },
        // { 'participants.email': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate({ path: 'participants', select: 'name email phone' })
      .populate({ path: 'createdBy', select: 'name email' }) 
      .sort('-createdAt') 
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      meetings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMeetings: total,
    });
  } catch (err) {
    console.error('getAllMeetings error:', err);
    next(err);
  }
};

export const getMeeting = async (req, res, next) => {
  try {
    const m = await Meeting.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Not found' });
    res.json(m);
  } catch (err) { next(err); }
};

export const createMeeting = async (req, res, next) => {
  try {
    
    const userId = req.user.id;
    const payload = {
      ...req.body,
      createdBy: userId
    };
    const meeting = await Meeting.create(payload);

if (meeting.participants && meeting.participants.length > 0) {
  const meetingDetails = `
    <p><strong>Title:</strong> ${meeting.title}</p>
    <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
    <p><strong>Platform:</strong> ${meeting.platform}</p>
    <p><strong>Meet Link:</strong> <a href="${meeting.meetlink || '#'}" target="_blank">${meeting.meetlink || 'N/A'}</a></p>
    <p><strong>Description:</strong> ${meeting.description || 'N/A'}</p>
  `;

  for (const participantEmail of meeting.participants) {
    console.log(`Sending email to participant: ${participantEmail}`);
    try {
      await sendEmail({
        to: participantEmail,
        subject: `Meeting Invitation: ${meeting.title}`,
        html: `
          <p>Dear participant,</p>
          <p>You are invited to a new meeting with the following details:</p>
          ${meetingDetails}
          <p>We look forward to seeing you there!</p>
        `
      });
    } catch (emailError) {
      console.error(`Failed to send email to ${participantEmail}:`, emailError);
    }
  }
}


    res.status(201).json({
      meeting,
      userId
    });
  } catch (err) {
    next(err);
  }
};

export const updateMeeting = async (req, res, next) => {
  try {
    const m = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(m);
  } catch (err) { next(err); }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
