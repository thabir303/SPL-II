// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Batch =require("../models/Batch");
const RoutineCommittee = require("../models/RoutineCommittee");
const Coordinator = require("../models/Coordinator");
const ClassSlot = require("../models/ClassSlot");
const nodemailer = require("nodemailer");
const uuid = require("uuid");
const {
  generateToken,
  authenticateUser,
  authorizeRole,
  PROGRAM_CHAIR_USER,
} = require("../utils/auth");
const { ROLES } = require("../models/Role");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  // service: 'gmail', // Email service provider
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    

    user: process.env.USER, // Your email address
    pass: process.env.APP_PASSWORD, // Your email password
  },
});

// Middleware to check if the user is the program chair
const isProgramChair = (req, res, next) => {
  // Check if the program chair is logged in
  if (req.session.isProgramChairLoggedIn) {
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized (pC)" });
  }
};

// Middleware to check if the user is a coordinator
const isCoordinator = (req, res, next) => {
  if (req.session.isCoordinatorLoggedIn) {
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized ngg" });
  }
};

// Middleware to check if the user is approved
const isUserApproved = (req, res, next) => {
  if (req.session.user && req.session.user.status === "approved") {
    next();
  } else {
    return res
      .status(403)
      .json({
        error: "Account not approved. Please contact the program chair.",
      });
  }
};

// Route for user signup (only for students and teacher)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userId = uuid.v4(); // Generate a unique userId using uuid

    if (
      !Object.values(ROLES)
        .map((r) => r.name)
        .includes(role) ||
      role === "coordinator" ||
      role === "admin"
    ) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      status: "pending",
    });
    const savedUser = await newUser.save();

    res.json({
      message: "User created successfully, pending approval",
      data: savedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/approveUser", async (req, res) => {
  try {
    const { email, batchNo, teacherId } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.status === "approved") {
      return res.status(400).json({ error: "User already approved" });
    }
    user.status = "approved";
    let newEntity;
    let roleMessage = '';
    if (user.role === "teacher") {
      if (!teacherId) {
        return res.status(400).json({ error: "teacherId is required for teacher approval" });
      }
      const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email: user.email }] });
      if (existingTeacher) {
        return res.status(400).json({ error: "Teacher ID or email already exists" });
      }
      user.teacherId = teacherId; // Assign teacherId here
      await user.save(); // Save user with teacherId
      newEntity = new Teacher({
        teacherId,
        teacherName: user.name,
        email: user.email,
        departmentName: "IIT",
        assignedCourses: [] // Initialize with an empty array
      });
      await newEntity.save();
      roleMessage = 'Teacher';
    } else if (user.role === "student") {
      if (!batchNo) {
        return res.status(400).json({ error: "batchNo is required for student approval" });
      }
      const existingStudent = await Student.findOne({ $or: [{ studentId: user.userId }, { email: user.email }] });
      if (existingStudent) {
        return res.status(400).json({ error: "Student ID or email already exists" });
      }

       // Fetch semesterName from the Batch model
       const batch = await Batch.findOne({ batchNo });
       if (!batch) {
         return res.status(404).json({ error: "Batch not found" });
       }

      user.batchNo = batchNo;
      await user.save();
      newEntity = new Student({
        studentId: user.userId,
        name: user.name,
        email: user.email,
        batchNo,
        semesterName : batch.semesterName,
      });
      await newEntity.save();
      roleMessage = 'Student';
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    console.log(`${roleMessage} created:`, newEntity);

    // Send email notification
    const mailOptions = {
      from: {
        name: "Routine Management System",
        address: process.env.USER 
      },
      to: email,
      subject: "Account Approved",
      text: `Dear ${user.name},\n\nYour account has been approved. You can now login to the Routine Management System.\n\nBest regards,\nRoutine Management System`,
      html: `<p>Dear ${user.name},</p>
             <p>Your account has been approved. You can now <a href="http://localhost:3000/login">login</a> to the Routine Management System.</p>
             <p>Best regards,<br>Routine Management System</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email", details: error.message });
      } else {
        console.log("Email sent:", info.response);
        console.log("User approved:", user);
        res.json({ message: "User approved and email sent successfully" });

      }
    });

    console.log("User approved:", user);
    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Error during user approval:", error);
    res.status(500).json({ error: "Failed to approve user", details: error.message });
  }
});

// Route for user login (including students and teacher)


// routes/authRoutes.js


// routes/authRoutes.js
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received with:", { email, password });

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the user's status is approved for other roles
    if (user.status !== "approved") {
      return res.status(403).json({
        error: "Your Account is not approved yet. You will be notified once approved.",
      });
    }

    // If user is a teacher, include teacherId
    let userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      teacherId: user.teacherId,
      coordinatorId: user.coordinatorId,
    };

    // Generate a token for the user
    const token = generateToken(userData);
    res.json({ message: "Login successful", user: userData, token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// Logout route for all users
router.post("/logout", (req, res) => {
  if (req.session.isProgramChairLoggedIn) {
    req.session.isProgramChairLoggedIn = false;
    req.session.user = null; // Clear user data from session
  } else if (req.session.isCoordinatorLoggedIn) {
    req.session.isCoordinatorLoggedIn = false;
    req.session.user = null; // Clear user data from session
  }
  res.clearCookie("connect.sid"); // Clear the cookie that holds the session ID
  res.json({ message: "Logged out successfully" });
});

// Example protected route
router.get("/protected", (req, res) => {
  res.json({ message: "You have access to this protected route." });
});

// Route to add a new program chair
router.post('/program-chair', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the role of program chair
    const newUser = new User({
      userId: email, // Assuming userId is the email for simplicity
      name: 'Program Chair',
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'approved', // Automatically approve the program chair
    });

    await newUser.save();

    res.json({ message: 'Program Chair created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating program chair:', error);
    res.status(500).json({ error: 'Failed to create program chair' });
  }
});



// Route for creating a new coordinator (accessible only to program chair)
// Route for creating a new coordinator (accessible only to program chair)

router.post("/coordinators", async (req, res) => {
  try {
    const { name, email, password, batchNo, coordinatorId, expired_date } = req.body;

    // Check if the coordinator already exists
    const existingCoordinator = await Coordinator.findOne({ email });
    if (existingCoordinator) {
      return res.status(400).json({ error: "Coordinator already exists" });
    }

    // Check if the coordinator already exists in User schema
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Check if the coordinatorId is unique
    const existingCoordinatorId = await Coordinator.findOne({ coordinatorId });
    if (existingCoordinatorId) {
      return res.status(400).json({ error: "CoordinatorId already exists" });
    }

    // Check if the batchNo is unique
    const existingBatchNo = await Coordinator.findOne({ batchNo });
    if (existingBatchNo) {
      return res.status(400).json({ error: "Batch number already assigned to another coordinator" });
    }

    const batch = await Batch.findOne({ batchNo });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Coordinator document
    const newCoordinator = new Coordinator({
      coordinatorId,
      coordinatorName: name,
      email,
      password: hashedPassword,
      batchNo,
      expired_date: new Date(expired_date),
      semesterName: batch.semesterName,
    });

    await newCoordinator.save();

    // Create a new User document
    const newUser = new User({
      userId : coordinatorId,
      name,
      email,
      password: hashedPassword,
      role: "coordinator",
      status: "approved", // Automatically approved
      coordinatorId : coordinatorId,
      semesterName: batch.semesterName,
    });

    await newUser.save();

    // Send email invitation
    const mailOptions = {
      from: {
        name: "Routine Management System",
        address: process.env.USER,
      },
      to: email,
      subject: "Routine Committee Invitation",
      text: `You have been invited to join the routine committee. This invitation will expire on ${new Date(expired_date).toLocaleString()}.`,
      html: `<p>You have been invited to join the routine committee. This invitation will expire on ${new Date(expired_date).toLocaleString()}.</p>
             <p>Your login details are as follows:</p>
             <p>Email: ${email}</p>
             <p>Password: ${password}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({
      message: "Coordinator created successfully",
      data: newCoordinator,
    });
  } catch (error) {
    console.error("Error creating coordinator:", error);
    res.status(500).json({ error: "Failed to create coordinator" });
  }
});


// Route to get all coordinators
router.get('/coordinators', async (req, res) => {
  try {
    const coordinators = await Coordinator.find().lean();

    // Fetch the in_committee status for each coordinator
    const coordinatorsWithCommitteeStatus = await Promise.all(coordinators.map(async (coordinator) => {
      const routineCommittee = await RoutineCommittee.findOne({ coordinatorId: coordinator.coordinatorId });
      return {
        ...coordinator,
        in_committee: !!routineCommittee,
      };
    }));

    res.json(coordinatorsWithCommitteeStatus);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ error: 'Failed to fetch coordinators' });
  }
});

// // Route to assign a coordinator from existing teachers
// // Route to assign a coordinator from existing teachers
// router.post("/assign-coordinator", async (req, res) => {
//   try {
//     const { teacherId, batchNo, expired_date } = req.body;

//     // Check if the teacher exists in the Teacher schema
//     const teacher = await Teacher.findOne({ teacherId });
//     if (!teacher) {
//       return res.status(404).json({ error: 'Teacher not found' });
//     }

//     // Check if the batchNo is unique
//     const existingCoordinator = await Coordinator.findOne({ batchNo });
//     if (existingCoordinator) {
//       return res.status(400).json({ error: "Batch number already assigned to another coordinator" });
//     }

//     console.log(teacher.email);
//     console.log(teacher.password);
//     console.log(teacher.teacherName);
//     console.log(teacher.teacherId);

//     // Create a new Coordinator document
//     const newCoordinator = new Coordinator({
//       coordinatorId: teacher.teacherId,
//       coordinatorName: teacher.teacherName,
//       email: teacher.email,
//       password: teacher.password,
//       batchNo,
//       expired_date: new Date(expired_date),
//       in_committee: true
//     });

//     await newCoordinator.save();

//     // Check if the user already exists in the User schema
//     let user = await User.findOne({ userId: teacher.teacherId });
//     if (user) {
//       // Update the user role to coordinator
//       user.role = 'coordinator';
//       await user.save();
//     } else {
//       // Create a new User document if it doesn't exist
//       user = new User({
//         userId: teacher.teacherId,
//         name: teacher.teacherName,
//         email: teacher.email,
//         password: teacher.password, // Ensure the password is hashed
//         role: 'coordinator'
//       });
//       await user.save();
//     }

//     res.json({ message: "Coordinator assigned successfully", data: newCoordinator });
//   } catch (error) {
//     console.error("Error assigning coordinator:", error.message);
//     res.status(500).json({ error: "Failed to assign coordinator", details: error.message });
//   }
// });


// module.exports = router;

// Route to get a coordinator by ID
// router.get('/coordinators/:coordinatorId', async (req, res) => {
//   try {
//     const coordinatorId = req.params.coordinatorId;
//     const coordinator = await Coordinator.findOne({ coordinatorId }).lean();

//     if (!coordinator) {
//       return res.status(404).json({ error: ' not found' });
//     }

//     // Fetch the in_committee status
//     const routineCommittee = await RoutineCommittee.findOne({ coordinatorId });
//     const coordinatorWithCommitteeStatus = {
//       ...coordinator,
//       in_committee: !!routineCommittee,
//     };

//     res.json(coordinatorWithCommitteeStatus);
//   } catch (error) {
//     console.error('Error fetching coordinator:', error);
//     res.status(500).json({ error: 'Failed to fetch coordinator' });
//   }
// });



// Route to update a coordinator
router.put('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const { name, email, batchNo, expired_date } = req.body;

    // Check if the coordinator exists
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

     // Check if the batchNo is unique
     if (batchNo && batchNo !== coordinator.batchNo) {
      const existingBatchNo = await Coordinator.findOne({ batchNo });
      if (existingBatchNo) {
        return res.status(400).json({ error: "Batch number already assigned to another coordinator" });
      }
    }

    // Update the coordinator details
    coordinator.coordinatorName = name || coordinator.coordinatorName;
    coordinator.email = email || coordinator.email;
    coordinator.batchNo = batchNo || coordinator.batchNo;
    coordinator.expired_date = expired_date ? new Date(expired_date) : coordinator.expired_date;

    await coordinator.save();

    // Also update the User document if email was changed
    if (email) {
      const user = await User.findOne({ userId: coordinatorId });
      user.email = email;
      await user.save();
    }

    res.json({ message: 'Coordinator updated successfully', data: coordinator });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    res.status(500).json({ error: 'Failed to update coordinator' });
  }
});


// Request password reset
router.post('/password-reset/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      from: process.env.USER,
      to: "bsse1321@iit.du.ac.bd",
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3000/password-reset/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send email', error });
      }
      res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
});

// Reset password
router.post('/password-reset/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = req.body.password; // Make sure to hash the password before saving
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: ' occurred', error });
  }
});


// Route to get a coordinator by their coordinatorId
router.get('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params; // Retrieve the coordinatorId parameter from the request
    const user = await User.findOne({ userId: coordinatorId }); // Use findOne to find the user by their userId

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const coordinator = await Coordinator.findOne({ coordinatorId: user.userId }); // Use the userId to find the coordinator

    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Respond with the required fields
    res.json({
      coordinatorName: coordinator.coordinatorName,
      email: coordinator.email,
      batchNo: coordinator.batchNo,
      expired_date: coordinator.expired_date,
      semesterName: coordinator.semesterName
    });
  } catch (error) {
    console.error('Error fetching coordinator:', error);
    res.status(500).json({ error: 'Failed to fetch coordinator' });
  }
});

// In routes/classSlotRoutes.js

router.get('/coordinator/:batchNo', async (req, res) => {
  const { batchNo } = req.params;
  try {
    const classSlots = await ClassSlot.find({ batchNo });
    res.json(classSlots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class slots' });
  }
});

// Route to delete a coordinator
router.delete('/coordinators/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;

    const deletedCoordinator = await Coordinator.findOneAndDelete({ coordinatorId });
    if (!deletedCoordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Also delete the corresponding User document
    await User.findOneAndDelete({ userId: coordinatorId });

    res.json({ message: 'Coordinator deleted successfully' });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ error: 'Failed to delete coordinator' });
  }
});



router.post("/routine-committees", async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    // Check if the coordinator exists
    const coordinator = await Coordinator.findOne({ coordinatorId });
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    // Check if the routine committee already exists
    const existingRoutineCommittee = await RoutineCommittee.findOne({ coordinatorId });
    if (existingRoutineCommittee) {
      return res.status(400).json({ error: 'Routine committee already exists for this coordinator' });
    }

    const routineCommittee = new RoutineCommittee({
      coordinatorId,
      expired_date: coordinator.expired_date,
    });

    await routineCommittee.save();

    res.json({ message: 'Routine committee added successfully', data: routineCommittee });
  } catch (error) {
    console.error('Error adding routine committee:', error);
    res.status(500).json({ error: 'Failed to add routine committee' });
  }
});

// Route to get all routine committees
// GET /api/routine-committees
router.get("/routine-committees",  async (req, res) => {
  try {
    const routineCommittees = await RoutineCommittee.find();
    res.json(routineCommittees);
  } catch (error) {
    console.error("Error fetching routine committees:", error);
    res.status(500).json({ error: "Failed to fetch routine committees" });
  }
});

// Route to get a routine committee by coordinatorId
// GET /api/routine-committees/:coordinatorId
router.get(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const routineCommittee = await RoutineCommittee.findOne({
        coordinatorId,
      });

      if (!routineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      res.json(routineCommittee);
    } catch (error) {
      console.error("Error fetching routine committee:", error);
      res.status(500).json({ error: "Failed to fetch routine committee" });
    }
  }
);

// Route to update a routine committee
// PUT /api/routine-committees/:coordinatorId
// Request Body: { expired_date }
router.put(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const { expired_date, in_committee } = req.body;

      // Check if the routine committee exists
      const routineCommittee = await RoutineCommittee.findOne({
        coordinatorId,
      });
      if (!routineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      // Update the routine committee fields
      if (expired_date) {
        const expired_on = new Date(expired_date);
        routineCommittee.expired_date = expired_on;
      }

      if (in_committee !== undefined) {
        routineCommittee.in_committee = in_committee;
      }

      await routineCommittee.save();

      res.json({
        message: "Routine committee updated successfully",
        data: routineCommittee,
      });
    } catch (error) {
      console.error("Error updating routine committee:", error);
      res.status(500).json({ error: "Failed to update routine committee" });
    }
  }
);

// Route to delete a routine committee
// DELETE /api/routine-committees/:coordinatorId
router.delete(
  "/routine-committees/:coordinatorId",
  async (req, res) => {
    try {
      const coordinatorId = req.params.coordinatorId;
      const deletedRoutineCommittee = await RoutineCommittee.findOneAndDelete({
        coordinatorId,
      });

      if (!deletedRoutineCommittee) {
        return res.status(404).json({ error: "Routine committee not found" });
      }

      res.json({ message: "Routine committee deleted successfully" });
    } catch (error) {
      console.error("Error deleting routine committee:", error);
      res.status(500).json({ error: "Failed to delete routine committee" });
    }
  }
);

module.exports = router;
