// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Route to get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// Route to approve a user
router.post('/approve-user', async (req, res) => {
  try {
    const { email, teacherId, studentId, batchNo } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status === 'approved') {
      return res.status(400).json({ error: 'User already approved' });
    }

    // Check for the existence of IDs and batchNo based on user role
    if (user.role === 'student' && !studentId) {
      return res.status(400).json({ error: 'Student ID is required for student approval' });
    } else if (user.role === 'teacher' && !teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required for teacher approval' });
    }

    // Check if the IDs already exist
    if (user.role === 'teacher') {
      const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email: user.email }] });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Teacher ID or email already exists. Please provide a different Teacher ID.' });
      }
    } else if (user.role === 'student') {
      const batchExists = await Batch.findOne({ batchNo });
      if (!batchExists) {
        return res.status(400).json({ error: 'Batch number does not exist. Please create the batch first.' });
      }

      const existingStudent = await Student.findOne({ $or: [{ studentId }, { email: user.email }] });
      if (existingStudent) {
        return res.status(400).json({ error: 'Student ID or email already exists. Please provide a different email or contact support.' });
      }
    }

    user.status = 'approved';
    if (user.role === 'student') {
      user.studentId = user._id.toString(); // Using the MongoDB ObjectID as the student ID
      user.batchNo = batchNo;
    } else if (user.role === 'teacher') {
      user.teacherId = teacherId;
    }

    await user.save();

    // Save user data to the respective schema
    if (user.role === 'teacher') {
      const newTeacher = new Teacher({
        teacherId,
        teacherName: user.name,
        email: user.email,
        departmentName: 'IIT',
        assignedCourses: []
      });
      await newTeacher.save();
      console.log('Teacher created:', newTeacher);
    } else if (user.role === 'student') {
      const newStudent = new Student({
        studentId: user._id.toString(),
        name: user.name,
        email: user.email,
        batchNo,
      });
      await newStudent.save();
      console.log('Student created:', newStudent);
    }

    console.log('User approved:', user);
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error during user approval:', error);
    res.status(500).json({ error: 'Failed to approve user', details: error.message });
  }
});


// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Route to delete a user
router.delete('/delete-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user based on their role
    if (user.role === 'teacher') {
      await Teacher.findOneAndDelete({ teacherId: userId });
      console.log('Teacher deleted');
    } else if (user.role === 'student') {
      await Student.findOneAndDelete({ studentId: userId });
      console.log('Student deleted');
    }

    // Delete the user
    await User.findOneAndDelete({ userId });
    console.log('User deleted');

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

module.exports = router;