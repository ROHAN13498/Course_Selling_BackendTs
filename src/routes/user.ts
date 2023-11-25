import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateJwt, SECRET } from '../middleware/auth';
import { User, Course } from '../db';

const router: Router = express.Router();

interface User {
  username: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

router.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'User created successfully', token });
  }
});

router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

router.get('/courses', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

router.post('/courses/:courseId', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const course = await Course.findById(req.params.courseId);
  console.log(course);
  if (course) {
    const user = await User.findOne({ username: req.user?.username });
    if (user) {
        const courseid=course.id;
      user.purchasedCourses.push(courseid);
      await user.save();
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

router.get('/purchasedCourses', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findOne({ username: req.user?.username }).populate('purchasedCourses');
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});

export = router;
