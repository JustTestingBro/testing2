import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useNavigate } from 'react-router-dom';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Layout from './Layout';

interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  diagnosis: string;
  history: string[];
  selectedDoctor: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  symptoms: string;
  prescription: string;
  timestamp: string;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string>('');
  const [showPast, setShowPast] = useState(false);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogPrescription, setDialogPrescription] = useState<any | null>(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const currentDoctorId = localStorage.getItem('doctorId');
    
    if (userType !== 'doctor' || !currentDoctorId) {
      navigate('/login');
      return;
    }

    setDoctorId(currentDoctorId);
    loadPatients(currentDoctorId);
  }, [navigate]);

  const loadPatients = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-patients/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadPastAppointments = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-past-appointments/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setPastAppointments(data);
      }
    } catch (error) {
      console.error('Error loading past appointments:', error);
    }
  };

  const handleGeneratePrescription = async () => {
    if (!selectedPatient || !symptoms) {
      alert('Please select a patient and enter symptoms');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate_prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          symptoms,
          doctor_id: doctorId
        }),
      });

      const data = await response.json();
      setPrescription(data.prescription);
    } catch (error) {
      console.error('Error generating prescription:', error);
      alert('Error generating prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !prescription) {
      alert('Please select a patient and generate a prescription');
      return;
    }

    try {
      const response = await fetch('/api/save_prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          symptoms,
          prescription,
          doctor_id: doctorId
        }),
      });

      if (response.ok) {
        await fetch(`/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedPatient, selectedDoctor: '' })
        });
        alert('Prescription saved successfully!');
        setPrescription('');
        setSymptoms('');
        setSelectedPatient(null);
        loadPatients(doctorId);
      } else {
        alert('Error saving prescription');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('doctorId');
    navigate('/login');
  };

  const getDoctorName = (doctorId: string) => {
    const doctors = {
      'doctor1': 'Dr. Smith - Cardiologist',
      'doctor2': 'Dr. Johnson - General Physician'
    };
    return doctors[doctorId as keyof typeof doctors] || 'Unknown Doctor';
  };

  const handleDownloadPDF = () => {
    if (!selectedPatient || !prescription) {
      alert('Please select a patient and generate a prescription first');
      return;
    }

    const prescriptionData = {
      id: `temp-${Date.now()}`,
      patient_name: selectedPatient.name,
      doctor_name: getDoctorName(doctorId),
      age: selectedPatient.age,
      history: selectedPatient.history,
      diagnosis: selectedPatient.diagnosis,
      symptoms,
      prescription,
      timestamp: new Date().toISOString()
    };

    generatePrescriptionPDF(prescriptionData);
  };

  return (
    <Layout title="Doctor Dashboard">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-1">{getDoctorName(doctorId)}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Patients</h2>
            {patients.length === 0 ? (
              <p className="text-gray-600">No patients assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`flex flex-row items-center justify-between p-2 cursor-pointer transition-colors text-base ${
                      selectedPatient?.id === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex flex-row gap-6 w-full items-center">
                      <span className="font-semibold text-gray-900 min-w-[120px]">{patient.name}</span>
                      <span className="text-gray-600 min-w-[60px]">Age: {patient.age}</span>
                      <span className="text-gray-600 min-w-[160px]">Diagnosis: {patient.diagnosis}</span>
                      <span className="text-gray-600 flex-1 truncate">History: {patient.history.join(', ')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Prescription Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Generate Prescription</h2>
            
            {selectedPatient && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Patient</h3>
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Age:</strong> {selectedPatient.age}</p>
                <p><strong>Diagnosis:</strong> {selectedPatient.diagnosis}</p>
                <p><strong>History:</strong> {selectedPatient.history.join(', ')}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="symptoms">Current Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter patient's current symptoms..."
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleGeneratePrescription}
                disabled={!selectedPatient || !symptoms || loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Prescription'}
              </Button>

              {prescription && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prescription">Generated Prescription</Label>
                    <Textarea
                      id="prescription"
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Generated prescription will appear here..."
                      className="mt-1"
                      rows={6}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSavePrescription}
                      className="flex-1"
                      variant="default"
                    >
                      Save Prescription
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Button onClick={() => { setShowPast(!showPast); if (!showPast) loadPastAppointments(doctorId); }} variant="outline" className="ml-4">
          {showPast ? 'Hide Past Appointments' : 'Show Past Appointments'}
        </Button>

        {showPast && (
          <Card className="p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Past Appointments</h2>
            {pastAppointments.length === 0 ? (
              <p className="text-gray-600">No past appointments.</p>
            ) : (
              <div className="space-y-2">
                {pastAppointments.map((appt) => (
                  <div key={appt.id} className="flex flex-row gap-6 items-center text-base">
                    <span className="font-semibold text-gray-900 min-w-[120px]">{appt.patient_name}</span>
                    <span className="text-gray-600 min-w-[60px]">Age: {appt.age}</span>
                    <span className="text-gray-600 min-w-[160px]">Diagnosis: {appt.diagnosis}</span>
                    <span className="text-gray-600 flex-1 truncate">History: {appt.history.join(', ')}</span>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => { setDialogPrescription(appt); setOpenDialog(true); }}>Show Prescription</Button>
                      </DialogTrigger>
                      <DialogContent showCloseButton>
                        <DialogHeader>
                          <DialogTitle>Prescription for {dialogPrescription?.patient_name}</DialogTitle>
                        </DialogHeader>
                        <div className="whitespace-pre-line text-gray-900 mb-4">
                          {dialogPrescription?.prescription}
                        </div>
                        <DialogFooter>
                          <Button onClick={() => generatePrescriptionPDF({
                            id: dialogPrescription?.id,
                            patient_name: dialogPrescription?.patient_name,
                            doctor_name: dialogPrescription?.doctor_name,
                            age: dialogPrescription?.age || 0,
                            history: dialogPrescription?.history || [],
                            diagnosis: dialogPrescription?.diagnosis || '',
                            symptoms: dialogPrescription?.symptoms || '',
                            prescription: dialogPrescription?.prescription,
                            timestamp: dialogPrescription?.timestamp
                          })}>Download PDF</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
} 