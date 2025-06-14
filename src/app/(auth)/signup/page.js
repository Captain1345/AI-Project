'use client'
import React, { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { SignUpUser } from '../../../actions/auth';

export default function SignUpPage() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const validateEmail = (email) => {
    // Simple email regex
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailErrorMessage('Invalid email format');
      return;
    }
    // Add your signup logic here
    const result = await SignUpUser(formData);

    if (result.status === 'success') {
      // Redirect to the sign-in page or home page after successful signup
      router.push('/login');
    } else {
      // Handle signup error (e.g., show a messa
      console.log(result.status);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6">
            <Image
              src="/logo.svg"  // Add your logo file in the public folder
              alt="Logo"
              width={48}
              height={48}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Get started with your new account
          </p>
        </div>

        <Form.Root className="space-y-4">
          <Form.Field name="username">
            <Form.Label className="FormLabel">Username</Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </Form.Control>
          </Form.Field>

          <Form.Field name="email">
            <Form.Label className="FormLabel">Email</Form.Label>
            <Form.Control asChild>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </Form.Control>
            <Form.Message className="FormMessage" match="valueMissing">
              Please enter your email
            </Form.Message>
            <Form.Message className="FormMessage" match="typeMismatch">
              Please provide a valid email
            </Form.Message>
          </Form.Field>
          {emailErrorMessage && (
            <div className="mb-4 text-red-600 text-sm font-medium" role="alert">
              {emailErrorMessage}
            </div>
          )}

          <Form.Field name="password">
            <Form.Label className="FormLabel">Password</Form.Label>
            <Form.Control asChild>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
                minLength={6}
              />
            </Form.Control>
          </Form.Field>

          <button
            type="submit"
            onClick={handleSubmit} // Handle form submissi
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign up
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>

          <button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          </div>
        </Form.Root>
      </div>
    </div>
  );
}