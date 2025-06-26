import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNavigate } from 'react-router-dom';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Layout from './Layout';

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  email: string;
  diagnosis: string;
  history: string[];
  selectedDoctor?: string;
}

interface Prescription {
  id: string;
  symptoms: string;
  prescription: string;
  doctorName: string;
  timestamp: string;
}

export default function PatientDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    diagnosis: '',
    history: '',
    selectedDoctor: ''
  });
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogPrescription, setDialogPrescription] = useState<Prescription | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const availableDoctors = [
    { id: 'doctor1', name: 'Dr. Smith - Cardiologist' },
    { id: 'doctor2', name: 'Dr. Johnson - General Physician' }
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Try to load patient profile from backend first
    fetch(`/api/patients/${currentUser.uid}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then(data => {
        setProfile(data);
        setAppointmentBooked(!!data.selectedDoctor);
        localStorage.setItem('patientProfile', JSON.stringify(data));
      })
      .catch(() => {
        // Fallback to localStorage or create new profile
        const savedProfile = localStorage.getItem('patientProfile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          const newProfile: PatientProfile = {
            id: currentUser.uid,
            name: '',
            age: 0,
            email: currentUser.email || '',
            diagnosis: '',
            history: [],
            selectedDoctor: ''
          };
          setProfile(newProfile);
          setIsEditing(true);
        }
      });

    // Load prescriptions
    loadPrescriptions();
  }, [currentUser, navigate]);

  const loadPrescriptions = async () => {
    try {
      const response = await fetch(`/api/patient-prescriptions/${currentUser?.uid}`);
      if (response.ok) {
        let data = await response.json();
        // Map doctor_name to doctorName for frontend compatibility
        data = data.map((p: any) => ({
          ...p,
          doctorName: p.doctor_name || 'Unknown Doctor'
        }));
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!profile || !currentUser) return;
    if (!formData.selectedDoctor || !formData.name || !formData.age || !formData.diagnosis) {
      alert('Please fill all required fields to book an appointment.');
      return;
    }
    const updatedProfile: PatientProfile = {
      id: currentUser.uid,
      name: formData.name,
      age: parseInt(formData.age),
      email: currentUser.email || '',
      diagnosis: formData.diagnosis,
      history: formData.history.split(',').map(h => h.trim()).filter(h => h),
      selectedDoctor: formData.selectedDoctor
    };
    setProfile(updatedProfile);
    setAppointmentBooked(true);
    setSuccessMsg('Appointment booked successfully!');
    localStorage.setItem('patientProfile', JSON.stringify(updatedProfile));
    setIsEditing(false);
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile)
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('userType');
      localStorage.removeItem('patientProfile');
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const downloadPrescriptionPDF = (prescription: Prescription) => {
    const prescriptionData = {
      id: prescription.id,
      patient_name: profile?.name || 'Unknown Patient',
      doctor_name: prescription.doctorName || 'Unknown Doctor',
      age: (prescription as any).age || profile?.age || 0,
      history: (prescription as any).history || profile?.history || [],
      diagnosis: (prescription as any).diagnosis || profile?.diagnosis || '',
      symptoms: prescription.symptoms || '',
      prescription: prescription.prescription,
      timestamp: prescription.timestamp
    };

    generatePrescriptionPDF(prescriptionData);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Patient Dashboard">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Book Appointment</h2>
              {!appointmentBooked && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                  size="sm"
                >
                  Book Appointment
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your legal name as on ID.</p>
                </div>
                <div>
                  <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Current Diagnosis <span className="text-red-500">*</span></Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g., Hypertension"
                  />
                </div>
                <div>
                  <Label htmlFor="history">Medical History (comma-separated)</Label>
                  <Textarea
                    id="history"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension, Asthma"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas.</p>
                </div>
                <div>
                  <Label htmlFor="doctor">Select Doctor <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.selectedDoctor}
                    onValueChange={(value) => setFormData({ ...formData, selectedDoctor: value })}
                  >
                    <SelectTrigger id="doctor">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleBookAppointment}
                  className="w-full"
                  disabled={!(formData.name && formData.age && formData.diagnosis && formData.selectedDoctor)}
                >
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-2 text-base">
                {successMsg && <div className="text-green-600 font-medium mb-2">{successMsg}</div>}
                <div className="flex flex-row flex-wrap gap-6 items-center">
                  <span className="font-semibold text-gray-900 min-w-[120px]">{profile.name}</span>
                  <span className="text-gray-600 min-w-[60px]">Age: {profile.age}</span>
                  <span className="text-gray-600 min-w-[180px]">Doctor: {availableDoctors.find(d => d.id === profile.selectedDoctor)?.name || 'Not selected'}</span>
                  {appointmentBooked && (
                    <span className="text-green-600 font-medium">Appointment Booked</span>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Prescriptions Section */}
          <Card className="p-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <p className="text-gray-600">No prescriptions yet.</p>
            ) : (
              <div className="space-y-2">
                {prescriptions.map((presc) => (
                  <div key={presc.id} className="flex flex-row gap-6 items-center text-base">
                    <span className="font-semibold text-gray-900 min-w-[120px]">{presc.doctorName}</span>
                    <span className="text-gray-600 min-w-[60px]">{new Date(presc.timestamp).toLocaleDateString()}</span>
                    <span className="text-gray-600 flex-1 truncate">Symptoms: {presc.symptoms}</span>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => { setDialogPrescription(presc); setOpenDialog(true); }}>Show Prescription</Button>
                      </DialogTrigger>
                      <DialogContent showCloseButton>
                        <DialogHeader>
                          <DialogTitle>Prescription from {dialogPrescription?.doctorName}</DialogTitle>
                        </DialogHeader>
                        <div className="whitespace-pre-line text-gray-900 mb-4">
                          {dialogPrescription?.prescription}
                        </div>
                        <DialogFooter>
                          <Button onClick={() => downloadPrescriptionPDF(dialogPrescription!)}>Download PDF</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
} 