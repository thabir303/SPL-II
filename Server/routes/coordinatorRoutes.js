// routes/coordinator.js
const express = require('express');
const router = express.Router();
const Coordinator = require('../models/Coordinator');
const User = require('../models/User');
router.get('/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }
    res.json({ semesterName: coordinator.semesterName });
  } catch (error) {
    console.error('Error fetching coordinator details:', error);
    res.status(500).json({ error: 'Failed to fetch coordinator details' });
  }
});

module.exports = router;
