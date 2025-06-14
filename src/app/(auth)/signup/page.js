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



  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Check if form is valid before proceeding
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Add your signup logic here
    const result = await SignUpUser(formData);

    if (result.status === 'success') {
      // Redirect to the sign-in page or home page after successful signup
      router.push('/login');
    } else {
      // Handle signup error (e.g., show a message)
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

        <Form.Root
          className="space-y-4"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <Form.Field name="username">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-sm font-medium text-gray-700">Username</Form.Label>
              <Form.Message className="text-sm text-red-500" match="valueMissing">
                Please enter a username
              </Form.Message>
              <Form.Message className="text-sm text-red-500" match="tooShort">
                Username must be at least 4 characters
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
                minLength={4}
              />
            </Form.Control>
          </Form.Field>

          <Form.Field name="email">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-sm font-medium text-gray-700">Email</Form.Label>
              <Form.Message className="text-sm text-red-500" match="valueMissing">
                Please enter your email
              </Form.Message>
              <Form.Message className="text-sm text-red-500" match="patternMismatch">
                Please enter a valid email address
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
              />
            </Form.Control>
          </Form.Field>

          <Form.Field name="password">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-sm font-medium text-gray-700">Password</Form.Label>
              <Form.Message className="text-sm text-red-500" match="valueMissing">
                Please enter a password
              </Form.Message>
              <Form.Message className="text-sm text-red-500" match="tooShort">
                Password must be at least 8 characters
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
                minLength={8}
              />
            </Form.Control>
          </Form.Field>

          <button
            type="submit"
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