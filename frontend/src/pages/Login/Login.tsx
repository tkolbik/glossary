import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import { API_ENDPOINTS } from '../../constants';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSetupRequired();
  }, []);

  const checkSetupRequired = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH_SETUP_REQUIRED);
      setSetupRequired(response.data.setupRequired);
    } catch (error) {
      console.error('Failed to check setup status:', error);
      toast.error('Failed to check setup status');
    } finally {
      setIsCheckingSetup(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(password);
      if (success) {
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error('Invalid password. Please try again.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH_SETUP, {
        password,
      });

      if (response.status === 200) {
        toast.success('Admin account created successfully!');
        setSetupRequired(false);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data || 'Setup failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className='min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100'>
            {setupRequired ? (
              <KeyRound className='h-6 w-6 text-blue-600' />
            ) : (
              <Lock className='h-6 w-6 text-blue-600' />
            )}
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            {setupRequired ? 'Initial Setup' : 'Admin Login'}
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            {setupRequired
              ? 'Set your admin password to get started'
              : 'Enter your password to access the admin panel'}
          </p>
        </div>

        {setupRequired ? (
          <form className='mt-8 space-y-6' onSubmit={handleSetup}>
            <div className='space-y-4'>
              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className='appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='Enter password (min. 8 characters)'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-1'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className='appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='Confirm password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating account...
                  </div>
                ) : (
                  <span className='text-black'>Create Admin Account</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className='mt-8 space-y-6' onSubmit={handleLogin}>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  className='appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Enter admin password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400 hover:text-gray-500' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='rounded-full h-4 w-4 border-b-2 mr-2'></div>
                    Signing in...
                  </div>
                ) : (
                  <span className='text-black'>Sign in</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
