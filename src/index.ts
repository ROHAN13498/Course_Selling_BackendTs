import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRouter from './routes/admin';
import userRouter from './routes/user';

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI: string = '';

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

app.use('/admin', adminRouter);
app.use('/user', userRouter);

app.listen(3000, () => console.log('Server running on port 3000'));
