import React from 'react';
import '@radix-ui/themes/styles.css';
import { redirect } from 'next/navigation';
import { getUser } from '../../actions/auth';


export default async function AuthLayout({ children }) {

  const response = await getUser();
  if (response?.user) {
    redirect("/")
  }
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}


