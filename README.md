# SPL-II
# IIT Routine and Lab Management

## Introduction

With the expansion of student intake from 30 to 50 at the University of Dhaka's IIT, efficient management of classrooms, labs, and schedules has become crucial. Our project, "IIT Routine and Lab Management," aims to optimize resource allocation, minimize conflicts, and enhance the use of available facilities for both undergraduate programs and additional courses.

## Purpose

The primary purpose of the IIT Routine and Lab Management System is to streamline and optimize the allocation of resources within the Institute of Information Technology at the University of Dhaka.



## Features

### User Registration and Authentication
- Secure sign-up and login process
- Role-based access control

### Routine Management System
- Create and manage class schedules
- Automatic conflict detection and resolution

### Class Rescheduling and Slot Management
- View available time slots
- Request and manage class rescheduling

### Semester Calendar
- Display weekly schedules for each student group

### Comprehensive Role-Based Access Control (RBAC)
- Differentiated access levels for students, teachers, batch coordinators, and program chairs

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js
- **Database**: MongoDB

## Setup Instructions

To get this project up and running on your local machine, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/thabir303/SPL-II.git
    cd SPL-II
    cd Client
    npm install
    cd Server
    npm i
    ```

2. Create a `.env` file in the root directory and add the following variables:
    ```plaintext
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

3. Run the application:
    ```bash
    cd Server
    npm run dev
    cd Client
    npm start
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

## User Manual

### For Students

#### Registration
1. Navigate to the registration page.
2. Fill in required details (name, email, password, student ID).
3. Select 'Student' as user type.
4. Submit the form.

#### Viewing Schedule
1. Log in to your account.
2. Navigate to 'My Schedule' to view your weekly timetable.

#### Checking Available Slots
1. Go to 'Available Slots' to see free time slots for labs or classrooms.

### For Teachers

#### Registration
1. Follow the same process as students, but select 'Teacher' as user type.

#### Managing Classes
1. After logging in, go to 'My Classes'.
2. Here you can view, add, or modify your class schedules.

#### Rescheduling a Class
1. Navigate to 'Reschedule Request'.
2. Select the class you want to reschedule and propose a new time slot.
3. Wait for admin approval.

### For Administrators

#### Managing Users
1. Access the 'User Management' panel.
2. Add, modify, or remove user accounts as needed.

#### Routine Management
1. Use the 'Routine Manager' to create and modify class schedules.
2. The system will automatically detect and notify of any conflicts.

#### Approving Rescheduling Requests
1. Check the 'Pending Requests' section.
2. Review and approve/deny rescheduling requests from teachers.

## Contributing

We welcome contributions to the IIT Routine and Lab Management System. Please fork the repository and create a pull request for any feature additions or bug fixes.
