# 🎓 Full-Stack Learning Management System (LMS)

A comprehensive, production-ready Learning Management System built with modern technologies and AI-powered features.

## 🚀 Features Overview

### 🔐 Authentication & User Management
- **Session-based Authentication** (no JWT required)
- **Role-based Access Control** (Student, Instructor, Admin)
- **Email Invitation System** for user registration
- **First-time Password Setup** with strength validation
- **User Profile Management** with progress tracking

### 📚 Course Management
- **Complete CRUD Operations** for courses
- **Student Enrollment Management** (Admin)
- **Course Progress Tracking**
- **Role-based Course Access**
- **Course Analytics** and reporting

### 🎥 Lecture & Video Management
- **Video Upload & Streaming** with custom player
- **Auto-Transcription** using OpenAI Whisper (99+ languages)
- **AI-Generated Summaries** with key points extraction
- **AI Chat Assistant** for lecture Q&A
- **Smart Search** in lecture transcripts
- **Timestamp Navigation** for quick access

### 📝 Assignment System
- **Assignment Creation & Management**
- **File Upload Support** with virus scanning
- **Automatic Plagiarism Detection** (.NET based simulation)
- **Grading & Feedback System**
- **Submission Tracking** with deadlines
- **Progress Analytics**

### 🧠 Quiz System
- **Interactive Quiz Builder** with multiple choice
- **Timer-based Quiz Taking**
- **Auto-Grading System**
- **Instant Results & Analytics**
- **Question Bank Management**

### 📊 Analytics & Reporting
- **Role-based Dashboards**
  - Student: Personal progress and performance
  - Instructor: Course analytics and student progress
  - Admin: System-wide analytics and reports
- **PDF/Excel Export** functionality
- **Progress Visualization** with interactive charts
- **Performance Metrics** and insights

### 🔔 Communication & Notifications
- **Real-time Notifications** via Socket.io
- **Email Notification System** with templates
- **Bulk Email Support** for announcements
- **In-app Notification Center**

### 🛡️ Security & Monitoring
- **Virus Scanning** on file uploads (stub implementation)
- **Content Moderation** and reporting system
- **Audit Logging** with action tracking
- **Input Validation** and sanitization
- **Rate Limiting** and CORS protection
- **Session Management** with MongoDB store

### 🤖 AI-Powered Features
- **OpenAI Whisper Integration** for transcription
- **GPT-3.5 Powered** summaries and chat
- **Context-aware AI Assistant** for lectures
- **Smart Search** with semantic understanding
- **Multi-language Support** (99+ languages)

## 🛠️ Technology Stack

### Frontend
- **React.js 18** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Express Session** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Express Validator** for input validation

### AI & Python Integration
- **OpenAI Whisper** for transcription
- **OpenAI GPT-3.5** for summaries and chat
- **Python Scripts** for AI processing
- **FFmpeg** for audio extraction

### Security & Middleware
- **Helmet.js** for security headers
- **CORS** configuration
- **Rate Limiting** with express-rate-limit
- **Session Store** with connect-mongo

## 📁 Project Structure

```
project/
├── server/                     # Backend application
│   ├── models/                 # MongoDB models
│   │   ├── User.js            # User schema
│   │   ├── Course.js          # Course schema
│   │   ├── Lecture.js         # Lecture schema with AI fields
│   │   ├── Assignment.js      # Assignment schema
│   │   ├── Quiz.js            # Quiz schema
│   │   ├── Submission.js      # Assignment submission schema
│   │   ├── Notification.js    # Notification schema
│   │   └── AuditLog.js        # Audit logging schema
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management
│   │   ├── courses.js         # Course operations
│   │   ├── lectures.js        # Lecture management
│   │   ├── assignments.js     # Assignment handling
│   │   ├── quizzes.js         # Quiz operations
│   │   ├── submissions.js     # Submission management
│   │   ├── uploads.js         # File upload handling
│   │   ├── analytics.js       # Analytics and reporting
│   │   ├── notifications.js   # Notification system
│   │   ├── ai.js              # AI features (Whisper, GPT)
│   │   ├── audit.js           # Audit logging
│   │   └── moderation.js      # Content moderation
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js    # Error handling
│   │   └── auditLogger.js     # Audit logging middleware
│   ├── utils/                 # Utility functions
│   │   ├── whisperService.js  # AI service integration
│   │   ├── virusScanner.js    # File security scanning
│   │   └── reportGenerator.js # Report generation
│   ├── python/                # Python AI scripts
│   │   ├── whisper_transcribe.py  # Whisper transcription
│   │   ├── ai_summary.py      # GPT summary generation
│   │   ├── ai_chat.py         # AI chat responses
│   │   └── requirements.txt   # Python dependencies
│   ├── uploads/               # File storage directory
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   └── package.json           # Node.js dependencies
├── src/                       # Frontend application
│   ├── components/            # Reusable components
│   │   ├── Layout/            # Layout components
│   │   │   ├── Layout.jsx     # Main layout wrapper
│   │   │   └── Navbar.jsx     # Navigation bar
│   │   └── UI/                # UI components
│   │       ├── Button.jsx     # Button component
│   │       ├── Card.jsx       # Card component
│   │       ├── Modal.jsx      # Modal component
│   │       ├── LoadingSpinner.jsx # Loading component
│   │       ├── PlagiarismChecker.jsx # Plagiarism detection
│   │       ├── ProgressTracker.jsx # Progress visualization
│   │       └── EmailNotifications.jsx # Email system
│   ├── context/               # React contexts
│   │   ├── AuthContext.jsx    # Authentication context
│   │   └── NotificationContext.jsx # Notification context
│   ├── pages/                 # Page components
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Register.jsx   # Registration page
│   │   │   └── SetPassword.jsx # Password setup
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Courses.jsx        # Course management
│   │   ├── Lectures.jsx       # Lecture listing
│   │   ├── LectureView.jsx    # Video player with AI features
│   │   ├── Assignments.jsx    # Assignment management
│   │   ├── Quizzes.jsx        # Quiz system
│   │   ├── UserManagement.jsx # User administration
│   │   ├── Analytics.jsx      # Analytics dashboard
│   │   ├── ContentModeration.jsx # Content moderation
│   │   ├── Profile.jsx        # User profile
│   │   └── AuditLogs.jsx      # Audit log viewer
│   ├── services/              # API services
│   │   └── api.js             # API endpoints and configuration
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── .env                       # Frontend environment variables
├── package.json               # Frontend dependencies
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## 🗄️ Database Structure

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['student', 'instructor', 'admin']),
  isActive: Boolean,
  bio: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  students: [ObjectId] (ref: User),
  category: String,
  level: String (enum: ['beginner', 'intermediate', 'advanced']),
  isPublished: Boolean,
  thumbnail: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Lectures Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  instructor: ObjectId (ref: User),
  videoUrl: String,
  materials: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadDate: Date
  }],
  duration: Number,
  order: Number,
  isPublished: Boolean,
  // AI-powered fields
  transcript: {
    text: String,
    language: String,
    segments: [{
      start: Number,
      end: Number,
      text: String,
      timestamp_formatted: String
    }],
    timestamps: [{
      time: Number,
      text: String,
      formatted_time: String
    }],
    duration: Number,
    confidence: Number,
    generatedAt: Date
  },
  aiSummary: {
    title: String,
    keyPoints: [String],
    mainTopics: [{
      topic: String,
      description: String,
      timestamp: Number
    }],
    studyTime: String,
    difficulty: String,
    prerequisites: [String],
    nextSteps: [String],
    generatedAt: Date,
    aiGenerated: Boolean
  },
  audioFile: String,
  transcriptionStatus: String (enum: ['pending', 'processing', 'completed', 'failed']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Assignments Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  instructor: ObjectId (ref: User),
  dueDate: Date,
  maxPoints: Number,
  instructions: String,
  attachments: [String],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Submissions Collection
```javascript
{
  _id: ObjectId,
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: User),
  content: String,
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadDate: Date
  }],
  submittedAt: Date,
  grade: Number,
  feedback: String,
  gradedAt: Date,
  gradedBy: ObjectId (ref: User),
  status: String (enum: ['SUBMITTED', 'GRADED', 'RETURNED']),
  plagiarismResults: {
    overallScore: Number,
    totalSources: Number,
    matchedWords: Number,
    uniquePercentage: Number,
    matches: [{
      similarity: Number,
      words: Number,
      source: String,
      originalText: String,
      matchedText: String,
      url: String
    }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Quizzes Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  instructor: ObjectId (ref: User),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    points: Number
  }],
  timeLimit: Number,
  maxAttempts: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['info', 'warning', 'success', 'error']),
  isRead: Boolean,
  relatedResource: {
    type: String,
    id: ObjectId
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### AuditLogs Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  action: String (enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ENROLL', 'SUBMIT', 'GRADE']),
  resource: String (enum: ['USER', 'COURSE', 'LECTURE', 'ASSIGNMENT', 'QUIZ', 'NOTIFICATION']),
  resourceId: ObjectId,
  details: Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or cloud)
- FFmpeg (for audio extraction)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lms-project
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Python Dependencies**
```bash
cd python
pip install -r requirements.txt
```

4. **Install Frontend Dependencies**
```bash
cd ..
npm install
```

5. **Environment Setup**

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://d24it142_db_user:Rajani%402958@lms.shp2w8c.mongodb.net/?retryWrites=true&w=majority&appName=LMS
SESSION_SECRET=your_super_secret_session_key
SESSION_NAME=lms_session
ALLOWED_ORIGINS=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
```

Create `.env` (frontend):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

6. **Start the Application**

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
npm run dev
```

### Default Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 🔧 Configuration

### AI Features Setup
1. Install Python dependencies: `pip install -r server/python/requirements.txt`
2. Install FFmpeg for audio extraction
3. Set `OPENAI_API_KEY` environment variable (optional - has fallbacks)

### Database Setup
- MongoDB collections are auto-created on first use
- Indexes are automatically applied via Mongoose schemas
- No manual database setup required

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### AI Endpoints
- `POST /api/ai/transcript/:lectureId` - Generate transcript
- `POST /api/ai/summary/:lectureId` - Generate AI summary
- `POST /api/ai/chat/:lectureId` - AI chat interaction
- `POST /api/ai/search/:lectureId` - Smart search in transcript

### Course Management
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### User Management (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔮 Future Work & Enhancements

### 🎯 Immediate Improvements
- [ ] **Real-time Collaboration** - Live document editing for assignments
- [ ] **Mobile App** - React Native mobile application
- [ ] **Offline Support** - PWA with offline capabilities
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Video Conferencing** - Integrated live classes

### 🤖 AI Enhancements
- [ ] **Advanced Plagiarism Detection** - Integration with Turnitin API
- [ ] **AI-Powered Grading** - Automatic essay grading
- [ ] **Personalized Learning Paths** - AI-recommended content
- [ ] **Voice Commands** - Voice-controlled navigation
- [ ] **Real-time Translation** - Multi-language support

### 📊 Analytics & Reporting
- [ ] **Advanced Dashboards** - Interactive charts with D3.js
- [ ] **Predictive Analytics** - Student performance prediction
- [ ] **Learning Analytics** - Detailed learning behavior analysis
- [ ] **Custom Reports** - User-defined report builder
- [ ] **Data Export** - Multiple format exports (JSON, XML, etc.)

### 🔐 Security Enhancements
- [ ] **Two-Factor Authentication** - SMS/Email 2FA
- [ ] **Single Sign-On (SSO)** - SAML/OAuth integration
- [ ] **Advanced Audit Logging** - Detailed security monitoring
- [ ] **Data Encryption** - End-to-end encryption
- [ ] **Compliance Features** - GDPR, FERPA compliance

### 🌐 Integration & APIs
- [ ] **LTI Integration** - Learning Tools Interoperability
- [ ] **Third-party Integrations** - Google Classroom, Canvas
- [ ] **Payment Gateway** - Course purchase functionality
- [ ] **Calendar Integration** - Google Calendar, Outlook
- [ ] **Email Service** - SendGrid, AWS SES integration

### 🎨 UI/UX Improvements
- [ ] **Dark Mode** - Theme switching capability
- [ ] **Accessibility** - Enhanced WCAG compliance
- [ ] **Customizable Themes** - Institution branding
- [ ] **Advanced Search** - Global search with filters
- [ ] **Drag & Drop** - Enhanced file management

### 📱 Platform Extensions
- [ ] **Desktop App** - Electron-based application
- [ ] **Browser Extensions** - Chrome/Firefox extensions
- [ ] **API Gateway** - Microservices architecture
- [ ] **Containerization** - Docker Swarm/Kubernetes
- [ ] **Cloud Deployment** - AWS/Azure/GCP templates

### 🔄 System Improvements
- [ ] **Caching Layer** - Redis implementation
- [ ] **Message Queue** - Background job processing
- [ ] **Load Balancing** - Multi-instance deployment
- [ ] **Database Optimization** - Query optimization
- [ ] **CDN Integration** - Global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for Whisper and GPT-3.5 APIs
- **MongoDB** for the database platform
- **React Team** for the amazing frontend framework
- **Node.js Community** for the robust backend ecosystem
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

<<<<<<< HEAD
**Built with ❤️ for modern education**
=======
**Built with ❤️ for modern education**
>>>>>>> 81aab73ea5f6cfceb92e6dac683b4446c4643290
