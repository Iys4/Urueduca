import mongoose from 'mongoose';

// --- User Schema ---
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Legacy field
  passwordHash: { type: String }, // New hashed field
  avatar: String,
  role: { type: String, default: 'teacher' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// --- Course Schema ---
const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  institution: String,
  grade: String,
  section: String,
  schedule: [mongoose.Schema.Types.Mixed], // { day: String, startTime: String, endTime: String }
  color: String,
  studentCount: { type: Number, default: 0 },
  coursePlanId: String,
  completedClasses: [String],
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  performance: { type: Number, default: 0 }
});

// --- Student Schema ---
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  course_id: String,
  name: { type: String, required: true },
  age: Number,
  birthdate: String,
  avg: { type: Number, default: 0 },
  comments: String,
  updatedAt: { type: Date, default: Date.now }
});

// --- Lesson Schema ---
const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  course_id: { type: String, required: true },
  date: { type: String, required: true },
  topic: String,
  summary: String,
  attendance: mongoose.Schema.Types.Mixed, // { studentId: 'presente'|'ausente' }
  attendanceCompleted: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// --- Evaluation Schema ---
const evaluationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  course_id: { type: String, required: true },
  title: { type: String, required: true },
  type: String,
  date: String,
  weight: Number,
  status: String,
  grades: mongoose.Schema.Types.Mixed, // { studentId: { score: Number } }
  createdAt: { type: Date, default: Date.now }
});

// --- Course Plan Schema ---
const coursePlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  nombre: String,
  descripcion: String,
  grado: String,
  asignatura: String,
  metodologia: String,
  actividades: String,
  modules: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now }
});

// --- Calendar Event Schema ---
const calendarEventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: String,
  date: String,
  startTime: String,
  endTime: String,
  description: String,
  type: String,
  color: String,
  createdAt: { type: Date, default: Date.now }
});

// --- Marketplace Schema ---
const marketplaceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: String,
  descripcion: String,
  materia: String,
  grado: String,
  metodologia: String,
  actividades: String,
  author: String,
  rating: Number,
  image: String,
  userId: String, // If someone uploads their own
  createdAt: { type: Date, default: Date.now }
});

// --- Module Schema ---
const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  coursePlanId: String,
  title: String,
  description: String,
  order: Number,
  classes: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now }
});

// --- Alert Schema ---
const alertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: String,
  message: String,
  type: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

// --- Teaching Group Schema ---
const teachingGroupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: String,
  members: [String],
  createdAt: { type: Date, default: Date.now }
});

// Export Models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
export const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', evaluationSchema);
export const CoursePlan = mongoose.models.CoursePlan || mongoose.model('CoursePlan', coursePlanSchema);
export const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', calendarEventSchema);
export const MarketplaceItem = mongoose.models.MarketplaceItem || mongoose.model('MarketplaceItem', marketplaceSchema);
export const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export const TeachingGroup = mongoose.models.TeachingGroup || mongoose.model('TeachingGroup', teachingGroupSchema);
