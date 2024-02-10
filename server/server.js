const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// MongoDB connection setup (replace with your MongoDB URI)
mongoose.connect('mongodb://localhost:27017/zoomIntegration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Zoom API credentials
const zoomApiKey = process.env.ZOOM_API_KEY;
const zoomApiSecret = process.env.ZOOM_API_SECRET;

// Define MongoDB schema and model (replace with your own schema)
const meetingSchema = new mongoose.Schema({
  topic: String,
  date: Date,
  zoomMeetingId: String,
});

const Meeting = mongoose.model('Meeting', meetingSchema);

// Endpoint to schedule a Zoom meeting
app.post('/api/meetings/schedule', async (req, res) => {
  try {
    // Use Axios to create a Zoom meeting
    const zoomResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: req.body.topic,
        start_time: new Date(req.body.date).toISOString(),
        type: 2, // Scheduled meeting
      },
      {
        headers: {
          Authorization: `Bearer ${zoomApiKey}.${zoomApiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save meeting details to MongoDB
    const newMeeting = new Meeting({
      topic: req.body.topic,
      date: req.body.date,
      zoomMeetingId: zoomResponse.data.id,
    });

    await newMeeting.save();

    res.json({
      message: 'Meeting scheduled successfully',
      zoomMeetingId: zoomResponse.data.id,
    });
  } catch (error) {
    console.error('Failed to schedule Zoom meeting:', error);
    res.status(500).json({ error: 'Failed to schedule Zoom meeting' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
