const express = require('express');
const router = express.Router();
const ClassSlot = require('../models/ClassSlot');
const Semester = require('../models/Semester');
const Day = require('../models/Day');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Section = require('../models/Section');
const FullRoutine = require("../models/FullRoutine");
const Coordinator = require('../models/Coordinator');
const User = require('../models/User');
const Batch = require('../models/Batch');

const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");

const startTimes = ['8', '9', '10', '11', '12', '14', '15', '16'];
const endTimes = ['8:50', '9:50', '10:50', '11:50', '12:50', '14:50', '15:50', '16:50'];

// Route to get time slots
router.get('/time-slots', (req, res) => {
  const timeSlots = [
    '8:00-8:50', '9:00-9:50', '10:00-10:50', '11:00-11:50',
    '12:00-12:50', '14:00-14:50', '15:00-15:50', '16:00-16:50'
  ];
  res.json(timeSlots);
});

router.post('/', async (req, res) => {
  try {
    const { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType } = req.body;

    // Validate input data
    if (!semesterName || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo || !section || !classType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if endTime is after startTime
    if (new Date(`1970-01-01T${endTime}:00`) <= new Date(`1970-01-01T${startTime}:00`)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check for existence of each field
    const semester = await Semester.findOne({ semesterName });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });

    const dayExists = await Day.findOne({ dayNo: day });
    if (!dayExists) return res.status(404).json({ error: 'Day not found' });

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const room = await Room.findOne({ roomNo });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const sectionExists = await Section.findOne({ sectionName: section });
    if (!sectionExists) return res.status(404).json({ error: 'Section not found' });

    if (!['Lab', 'Theory'].includes(classType)) {
      return res.status(400).json({ error: 'Invalid class type' });
    }

    // Check if the course is assigned to the given semester
    if (course.semesterName !== semesterName) {
      return res.status(400).json({
        error: `Course ${course.courseId} is assigned to semester ${course.semesterName}, but you are trying to use it in semester ${semesterName}.`,
        solution: `Please use the course in its assigned semester (${course.semesterName}).`
      });
    }

    // Check for time conflicts within the same semester, room, teacher, and section
    const conflictMessages = [];

    const conflictClassSlots = await ClassSlot.find({
      semesterName,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    conflictClassSlots.forEach(slot => {
      if (slot.roomNo === roomNo && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for the same section.');
      }
      if (slot.roomNo === roomNo && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for a different section.');
      }
      if (slot.teacherId === teacherId && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for the same section.');
      }
      if (slot.teacherId === teacherId && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for a different section.');
      }
      if (slot.section === section && slot.roomNo !== roomNo) {
        conflictMessages.push('Conflict: Overlapping class slot for the same section in different rooms.');
      }
    });

    if (conflictMessages.length > 0) {
      return res.status(400).json({ error: conflictMessages });
    }

    const batch = await Batch.findOne({ semesterName });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found for the given semester' });
    }

    // Create a new class slot
    const newClassSlot = new ClassSlot({
      semesterName,
      batchNo: batch.semesterName,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      section,
      classType
    });

    const savedClassSlot = await newClassSlot.save();

    // Create a corresponding entry in the FullRoutine schema
    const newFullRoutineEntry = new FullRoutine({
      semesterName,
      batchNo: batch.semesterName,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      section,
      classType
    });

    await newFullRoutineEntry.save();

    res.json({ message: 'Class slot created successfully', data: savedClassSlot });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ error: 'Class slot already exists for the given combination' });
    }

    console.error('Error creating class slot:', error);
    res.status(500).json({ error: 'Failed to create class slot' });
  }
});

// Route to get all class slots
router.get('/', async (req, res) => {
  try {
    const classSlots = await ClassSlot.find().lean(); // .lean() for better performance
    const populatedClassSlots = await Promise.all(
      classSlots.map(async (slot) => {
        const teacher = await Teacher.findOne({ teacherId: slot.teacherId });
        return {
          ...slot,
          teacherName: teacher ? teacher.teacherName : 'N/A',
        };
      })
    );
    res.json(populatedClassSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Fetch a single class slot by ID and populate teacher name
router.get('/:id', async (req, res) => {
  try {
    const classSlot = await ClassSlot.findById(req.params.id).populate('teacherId', 'teacherName teacherId');
    if (!classSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    res.json(classSlot);
  } catch (error) {
    console.error('Error fetching class slot:', error);
    res.status(500).json({ error: 'Failed to fetch class slot' });
  }
});

router.get('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const coordinator = await Coordinator.findOne({ coordinatorId });

    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    const classSlots = await ClassSlot.find({ semesterName: coordinator.semesterName });
    res.json(classSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

router.get('/coordinator/:batchNo', async (req, res) => {
  const { batchNo } = req.params;
  try {
    const classSlots = await ClassSlot.find({ batchNo });
    res.json(classSlots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Route to fetch class slots for a given semester name
router.get('/semester/:semesterName', async (req, res) => {
  try {
    const { semesterName } = req.params;
    const classSlots = await ClassSlot.find({ semesterName }).lean();
    
    const populatedClassSlots = await Promise.all(
      classSlots.map(async (slot) => {
        const teacher = await Teacher.findOne({ teacherId: slot.teacherId });
        return {
          ...slot,
          teacherName: teacher ? teacher.teacherName : 'N/A',
        };
      })
    );

    res.json(populatedClassSlots);
  } catch (error) {
    console.error('Error fetching class slots:', error);
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Route to fetch teacher name for a given class slot and teacher ID
router.get('/:id/:teacherId', async (req, res) => {
  try {
    const { id, teacherId } = req.params;
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ teacherName: teacher.teacherName });
  } catch (error) {
    console.error('Error fetching teacher name:', error);
    res.status(500).json({ error: 'Failed to fetch teacher name' });
  }
});

// Route to update a class slot by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType } = req.body;

    // Validate input data
    if (!semesterName || !day || !startTime || !endTime || !courseId || !teacherId || !roomNo || !section || !classType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existence of each field
    const semester = await Semester.findOne({ semesterName });
    if (!semester) return res.status(404).json({ error: 'Semester not found' });

    const dayExists = await Day.findOne({ dayNo: day });
    if (!dayExists) return res.status(404).json({ error: 'Day not found' });

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const room = await Room.findOne({ roomNo });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const sectionExists = await Section.findOne({ sectionName: section });
    if (!sectionExists) return res.status(404).json({ error: 'Section not found' });

    if (!['Lab', 'Theory'].includes(classType)) {
      return res.status(400).json({ error: 'Invalid class type' });
    }

    // Check if the course is assigned to the given semester
    if (course.semesterName !== semesterName) {
      return res.status(400).json({
        error: `Course ${course.courseId} is assigned to semester ${course.semesterName}, but you are trying to use it in semester ${semesterName}.`,
        solution: `Please use the course in its assigned semester (${course.semesterName}).`
      });
    }

    // Check for valid time
    if (new Date(`1970-01-01T${startTime}Z`) >= new Date(`1970-01-01T${endTime}Z`)) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    // Check for time conflicts within the same semester, room, teacher, and section
    const conflictMessages = [];

    const conflictClassSlots = await ClassSlot.find({
      _id: { $ne: id }, // Exclude the current class slot being updated
      semesterName,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    conflictClassSlots.forEach(slot => {
      if (slot.roomNo === roomNo && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for the same section.');
      }
      if (slot.roomNo === roomNo && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot in the same room for a different section.');
      }
      if (slot.teacherId === teacherId && slot.section === section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for the same section.');
      }
      if (slot.teacherId === teacherId && slot.section !== section) {
        conflictMessages.push('Conflict: Overlapping class slot with the same teacher for a different section.');
      }
      if (slot.section === section && slot.roomNo !== roomNo) {
        conflictMessages.push('Conflict: Overlapping class slot for the same section in different rooms.');
      }
    });

    if (conflictMessages.length > 0) {
      return res.status(400).json({ error: conflictMessages });
    }

    // Update the class slot
    const updatedClassSlot = await ClassSlot.findByIdAndUpdate(id, {
      semesterName,
      day,
      startTime,
      endTime,
      courseId,
      teacherId,
      roomNo,
      section,
      classType
    }, { new: true });

    // Update the corresponding entry in FullRoutine
    const updatedFullRoutineEntry = await FullRoutine.findOneAndUpdate(
      { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType },
      { semesterName, day, startTime, endTime, courseId, teacherId, roomNo, section, classType },
      { new: true }
    );

    res.json({ message: 'Class slot updated successfully', data: updatedClassSlot });
  } catch (error) {
    console.error('Error updating class slot:', error);
    res.status(500).json({ error: 'Failed to update class slot' });
  }
});

// Route to delete a class slot by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedClassSlot = await ClassSlot.findByIdAndDelete(req.params.id);
    if (!deletedClassSlot) {
      return res.status(404).json({ error: 'Class slot not found' });
    }
    
    // Also delete the corresponding entry in FullRoutine
    await FullRoutine.findOneAndDelete({ _id: req.params.id });

    res.json({ message: 'Class slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting class slot:', error);
    res.status(500).json({ error: 'Failed to delete class slot' });
  }
});

module.exports = router;










// Route to fetch teacher name for a given class slot and teacher ID

// router.get('/:id/:teacherId', async (req, res) => {
//   try {
//     const { id, teacherId } = req.params;
//     const teacher = await Teacher.findOne({ teacherId });
//     if (!teacher) {
//       return res.status(404).json({ error: 'Teacher not found' });
//     }
//     res.json({ teacherName: teacher.teacherName });
//   } catch (error) {
//     console.error('Error fetching teacher name:', error);
//     res.status(500).json({ error: 'Failed to fetch teacher name' });
//   }
// });

// In routes/classSlotRoutes.js
