const express = require('express');
const router = express.Router();
const FullRoutine = require('../models/FullRoutine');
const nodemailer = require('nodemailer');
const Student = require('../models/Student');
// const cron = require('node-cron');
const ClassSlot = require('../models/ClassSlot');
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tanvirhasanabir8@gmail.com",
    pass: "pyru dtnh ohce cujg",
  },
});

// Fetch a specific routine by ID
router.get('/full-routines/:id', async (req, res) => {
    try {
      const routine = await FullRoutine.findById(req.params.id);
      res.json(routine);
    } catch (error) {
      console.error('Error fetching routine:', error);
      res.status(500).json({ error: 'Failed to fetch routine' });
    }
  });
  

  router.put('/full-routines/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { expirationDate, startTime, endTime, day, roomNo } = req.body;
  
      // Check if the requested slots are available
      const slotConflict = await ClassSlot.findOne({
        day,
        roomNo,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
        ],
      });
  
      if (slotConflict) {
        return res.status(400).json({ error: 'Requested time slots are not available. Please choose a different time slot.' });
      }
  
      // Update the routine
      const updatedRoutine = await FullRoutine.findByIdAndUpdate(id, req.body, { new: true });
  
      // Find the students related to the updated routine's semester
      const students = await Student.find({ semesterName: updatedRoutine.semesterName });
      const studentEmails = students.map(student => student.email);
  
      // If no students are found, log a message but continue the process
      if (studentEmails.length === 0) {
        console.warn('No students found for this semester');
      }
  
      // Prepare the email options
      const mailOptions = {
        from: {
          name: 'Routine Management System',
          address: process.env.USER,
        },
        to: studentEmails.length > 0 ? studentEmails : "bsse1321@iit.du.ac.bd", // Fallback email
        subject: 'Routine Rescheduled',
        text: `Your routine has been rescheduled. New details:\n\n${JSON.stringify(updatedRoutine, null, 2)}\n\nThis new schedule is valid until ${expirationDate}`,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email notification. Please try again later.' });
        }
        console.log('Email sent:', info.response);
        // Send the updated routine as a response after email is sent
        res.json(updatedRoutine);
      });
    } catch (error) {
      console.error('Error updating routine:', error);
      res.status(500).json({ error: 'An error occurred while updating the routine. Please try again later.' });
    }
  });
  
  module.exports = router;