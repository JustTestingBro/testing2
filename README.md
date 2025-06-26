# Prescription Management System

A comprehensive prescription management system with Firebase authentication, separate dashboards for doctors and patients, and AI-powered prescription generation.

## Features

### 🔐 Authentication
- **Firebase Authentication** for secure user management
- **Separate login systems** for doctors and patients
- **Predefined doctor credentials** for easy testing
- **Patient signup and login** functionality

### 👨‍⚕️ Doctor Dashboard
- View assigned patients
- Generate AI-powered prescriptions based on symptoms
- Edit and customize prescriptions before saving
- Save prescriptions to database
- Download prescriptions as PDF
- Separate sessions for each doctor

### 👤 Patient Dashboard
- Complete profile management (name, age, diagnosis, medical history)
- Select preferred doctor from available options
- View all prescriptions with download capability
- Track medical history and symptoms

### 🤖 AI Integration
- **Google Gemini AI** for intelligent prescription generation
- **RAG (Retrieval-Augmented Generation)** using similar past prescriptions
- **Hugging Face embeddings** for semantic similarity search
- Context-aware prescription recommendations

### 📄 PDF Generation
- Download prescriptions as professional PDF documents
- Include patient details, symptoms, and prescription
- Proper formatting and medical document structure

## Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API endpoints
- **MongoDB** with Mongoose for data persistence
- **Firebase Admin SDK** for authentication
- **Google Gemini AI** for prescription generation
- **Hugging Face** for embeddings
- **PDFKit** for PDF generation
- **Model Context Protocol (MCP)** for AI tool integration

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Firebase Client SDK** for authentication
- **React Router** for navigation
- **jsPDF** for client-side PDF generation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Firebase project
- Google Gemini API key
- Hugging Face API token

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` files in both `backend` and `frontend` directories:

#### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
HF_API_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
PORT=3000
```

#### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Create a service account and download the JSON file
4. Add the service account JSON to your backend `.env` as `FIREBASE_SERVICE_ACCOUNT`
5. Copy the Firebase config to your frontend `.env`

### 4. Database Setup

1. Create a MongoDB database (local or cloud)
2. Update the `MONGO_URI` in your backend `.env`
3. The system will automatically create the necessary collections

### 5. API Keys Setup

1. **Google Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Hugging Face**: Get token from [Hugging Face](https://huggingface.co/settings/tokens)

### 6. Run the Application

```bash
# Start backend server
cd backend
npm run dev

# Start frontend development server
cd ../frontend
npm run dev
```

## Usage

### Doctor Login
Use these predefined credentials:
- **Doctor 1**: `doctor1@hospital.com` / `doctor123`
- **Doctor 2**: `doctor2@hospital.com` / `doctor456`

### Patient Registration
1. Click "Patient" tab on login screen
2. Click "Sign up" to create a new account
3. Fill in your profile information
4. Select a preferred doctor

### Generating Prescriptions
1. Doctor logs in and sees assigned patients
2. Select a patient and enter their symptoms
3. Click "Generate Prescription" for AI-powered recommendations
4. Edit the prescription if needed
5. Click "Save Prescription" to store in database
6. Use "Download PDF" to save as PDF file

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - Patient registration

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create/update patient
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/doctor-patients/:doctorId` - Get doctor's patients
- `GET /api/patient-prescriptions/:patientId` - Get patient's prescriptions

### Prescriptions
- `POST /api/generate_prescription` - Generate AI prescription
- `POST /api/save_prescription` - Save prescription to database
- `GET /api/download-prescription/:id` - Download prescription as PDF

## Database Schema

### Patient Collection
```javascript
{
  id: String,
  name: String,
  age: Number,
  email: String,
  diagnosis: String,
  history: [String],
  selectedDoctor: String
}
```

### Prescription Collection
```javascript
{
  id: String,
  patient_id: String,
  patient_name: String,
  doctor_id: String,
  doctor_name: String,
  age: Number,
  diagnosis: String,
  history: [String],
  symptoms: String,
  prescription: String,
  timestamp: Date
}
```

## Security Features

- Firebase Authentication for secure user management
- JWT token verification for API endpoints
- Input validation and sanitization
- Secure password handling
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 