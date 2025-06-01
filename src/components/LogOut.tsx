'use client'

import React, { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { PersonIcon } from '@radix-ui/react-icons';
import { User } from '@supabase/supabase-js';
// TODO: Ensure the correct path to 'auth' and that it exports 'LogOutUser'
import { LogOutUser } from '../actions/auth';

export default function LogOut() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();
    }, []);

    const handleLogout = async () => {
        await LogOutUser();
    };

    if (!user) return null;

    return (
        <div className="absolute top-4 right-4">
            <button
                className="group p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                title="Profile"
                onClick={handleLogout}
            >
                <PersonIcon className="w-6 h-6 text-gray-700" />
                <div className="invisible group-hover:visible absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg p-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-gray-500 truncate">
                            {user.email}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                            Log Out
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
}