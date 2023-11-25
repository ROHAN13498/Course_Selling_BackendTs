// routes.ts

import express, { Router, Request, Response } from 'express';
import { User, Course, Admin, Video, IUser, IAdmin, ICourse, IVideo } from '../db';
import jwt from 'jsonwebtoken';
import { SECRET } from '../middleware/auth';
import { authenticateJwt } from '../middleware/auth';

const router: Router = express.Router();

interface User {
    username: string;
    role: string;
  }
  
  interface AuthenticatedRequest extends Request {
    user?: User;
  }

router.get('/me', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const admin = await Admin.findOne({ username: req.user?.username });
  if (!admin) {
    res.status(403).json({ msg: 'Admin doesnt exist' });
    return;
  }
  res.json({
    username: admin.username,
  });
});

router.post('/signup', (req: Request, res: Response) => {
    console.log("hi");
  const { username, password } = req.body;
  function callback(admin: IAdmin | null) {
    if (admin) {
      res.status(403).json({ message: 'Admin already exists' });
    } else {
      const obj = { username: username, password: password };
      const newAdmin = new Admin(obj);
      newAdmin.save();

      const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Admin created successfully', token });
    }
  }
  Admin.findOne({ username }).then(callback);
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

router.post('/courses', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        const username = req.user.username;
        const admin = await Admin.findOne({ username });
  
        if (admin) {
          const course: ICourse = new Course(req.body);
          const courseId = course.id;
          admin.adminCourses.push(courseId);
          await admin.save();
          await course.save();
          res.json({ message: 'Course created successfully', courseId });
        } else {
          res.status(403).json({ message: 'Admin not found' });
        }
      } else {
        res.status(403).json({ message: 'User not authenticated' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.put('/courses/:courseId', authenticateJwt, async (req: Request, res: Response) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
  if (course) {
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

router.get('/courses', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    const username = req.user.username;
    const admin = await Admin.findOne({ username });

    if (admin) {
      await admin.populate('adminCourses');
      res.json({ courses: admin.adminCourses });
    } else {
      res.status(403).json({ message: 'Admin not found' });
    }
  } else {
    res.status(403).json({ message: 'User not authenticated' });
  }
});

router.get('/url/:courseId', authenticateJwt, async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    await course.populate('urls');
    res.json({ urls: course.urls });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

router.post('/url/:courseId', authenticateJwt, async (req: Request, res: Response) => {
    const V = new Video(req.body);
  
    try {

      await V.save();
  
      
      const id = V.id;
  
      const course = await Course.findById(req.params.courseId);
  
      if (course) {
        course.urls.push(id);
        await course.save();
  
        res.json({ message: 'Video added successfully' ,id:id});
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.get('/course/:courseId', authenticateJwt, async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (course) {
    res.json({ course });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

router.get('/getVideo/:videoId', async (req: Request, res: Response) => {
  const videoId = req.params.videoId;
  const video = await Video.findById(videoId);
  if (video) {
    console.log(video);
    res.json({ video });
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
});

export = router;
