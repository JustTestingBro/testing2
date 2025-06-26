import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Layout from './Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'doctor' | 'patient'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      if (userType === 'doctor') {
        // For doctors, we'll use predefined credentials
        if (email === 'doctor1@hospital.com' && password === 'doctor123') {
          // Simulate login for doctor
          localStorage.setItem('userType', 'doctor');
          localStorage.setItem('doctorId', 'doctor1');
          navigate('/doctor-dashboard');
        } else if (email === 'doctor2@hospital.com' && password === 'doctor456') {
          localStorage.setItem('userType', 'doctor');
          localStorage.setItem('doctorId', 'doctor2');
          navigate('/doctor-dashboard');
        } else {
          setError('Invalid doctor credentials');
        }
      } else {
        // For patients, use Firebase authentication
        if (!email || !password) {
          setError('Please enter a valid email and password.');
          setLoading(false);
          return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await login(email, password);
        localStorage.setItem('userType', 'patient');
        navigate('/patient-dashboard');
      }
    } catch (error) {
      setError('Failed to log in');
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Validation for sign up
    if (!name) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (!email || !password) {
      setError('Please enter a valid email and password.');
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      localStorage.setItem('userType', 'patient');
      localStorage.setItem('patientName', name);
      // Save patient info to backend
      const user = auth.currentUser;
      if (user) {
        await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.uid,
            name,
            email,
            age: 0,
            diagnosis: '',
            history: [],
            selectedDoctor: ''
          })
        });
      }
      navigate('/patient-dashboard');
    } catch (error) {
      setError('Failed to create an account');
    }

    setLoading(false);
  }

  // Reset fields when switching between login and signup
  function handleShowSignup(val: boolean) {
    setShowSignup(val);
    setError('');
    setLoading(false);
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <Layout title="Login">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'patient'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUserType('patient')}
            disabled={showSignup}
          >
            Patient
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'doctor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUserType('doctor')}
            disabled={showSignup}
          >
            Doctor
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        {!showSignup && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Sign Up Form for Patient */}
        {showSignup && userType === 'patient' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !name || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => handleShowSignup(false)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Sign up link for patient */}
        {!showSignup && userType === 'patient' && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => handleShowSignup(true)}
                disabled={loading}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {userType === 'doctor' && !showSignup && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Doctor Credentials:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Doctor 1: doctor1@hospital.com / doctor123</p>
              <p>Doctor 2: doctor2@hospital.com / doctor456</p>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
} 