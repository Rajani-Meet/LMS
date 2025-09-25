import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { authAPI } from '../services/api';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    verifyToken();
  }, [token]);

  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);

  const verifyToken = async () => {
    if (!token || !email) {
      setVerifying(false);
      return;
    }

    try {
      await authAPI.verifyPasswordToken(token, email);
      setValidToken(true);
    } catch (error) {
      console.error('Invalid token:', error);
      setValidToken(false);
    } finally {
      setVerifying(false);
    }
  };

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = (score) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      alert('Please choose a stronger password');
      return;
    }

    setLoading(true);
    try {
      await authAPI.setPassword({
        token,
        email,
        password: formData.password
      });
      
      alert('Password set successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      console.error('Failed to set password:', error);
      alert('Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Verifying invitation..." />
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
          <p className="text-gray-600">
            Welcome! Please set your password to complete your account setup.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Account: {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className="flex items-center space-x-2">
                <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                  {formData.password.length >= 8 ? '✓' : '○'}
                </span>
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                  {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                </span>
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                  {/[a-z]/.test(formData.password) ? '✓' : '○'}
                </span>
                <span>One lowercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                  {/\d/.test(formData.password) ? '✓' : '○'}
                </span>
                <span>One number</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                  {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'}
                </span>
                <span>One special character</span>
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading || passwordStrength.score < 3 || formData.password !== formData.confirmPassword}
            className="w-full"
          >
            {loading ? 'Setting Password...' : 'Set Password & Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetPassword;