// db.ts

import mongoose, { Schema, Types, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  password: string;
  purchasedCourses: Types.ObjectId[];
}

interface IAdmin extends Document {
  username: string;
  password: string;
  adminCourses: Types.ObjectId[] ;
}

interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  imageLink: string;
  published: boolean;
  urls: Types.ObjectId[];
}

interface IVideo extends Document {
  title: string;
  description: string;
  imageLink: string;
  url: string;
}

const userSchema = new Schema<IUser>({
  username: String,
  password: String,
  purchasedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
});

const adminSchema = new Schema<IAdmin>({
  username: String,
  password: String,
  adminCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
});

const courseSchema = new Schema<ICourse>({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
  urls: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
});

const videoSchema = new Schema<IVideo>({
  title: String,
  description: String,
  imageLink: String,
  url: String,
});

const User = mongoose.model<IUser>('User', userSchema);
const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
const Course = mongoose.model<ICourse>('Course', courseSchema);
const Video = mongoose.model<IVideo>('Video', videoSchema);

export { User, Admin, Course, Video, IUser, IAdmin, ICourse, IVideo };
