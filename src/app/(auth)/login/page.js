'use client';

import React from 'react';
import * as Form from '@radix-ui/react-form';
import { Button } from '@radix-ui/themes';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogInUser } from '../../../actions/auth';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your signup logic here
    const result = await LogInUser(formData);

    if (result.status === 'success') {
      // Redirect to the sign-in page or home page after successful signup
      router.push('/');
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
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6">
            <Image
              src="/logo.svg"  // Add your logo in public folder
              alt="Logo"
              width={48}
              height={48}
              className="w-full h-full"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-base text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        <Form.Root className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Form.Field name="email">
                <Form.Control asChild>
                  <input
                    type="email"
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    required
                  />
                </Form.Control>
              </Form.Field>
            </div>
            <div>
              <Form.Field name="password">
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
            </div>

            <button 
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue with Email
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button 
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              New to our platform?{' '}
              <Link 
                href="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Form.Root>
      </div>
    </div>
  );
}