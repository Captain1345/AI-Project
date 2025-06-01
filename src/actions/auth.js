'use server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import { headers } from "next/headers";



export async function getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Get User error:', error);
        return { status: 'error', message: error.message, user: null };
    }

    if (!user) {
        console.warn('No user found');
        return { status: 'not_found', message: 'No user found', user: null };
    }

    return { status: 'success', user };
}


export async function SignUpUser(formData) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                username: formData.username
            }
        }
    });

    if (error) {
        console.error('Signup error:', error);
        return { status: 'error', message: error.message, user: null };
    }
    else if (data.user.identities.length === 0) {
        console.error('Signup error: No identities found');
        return { status: 'error', message: 'No identities found', user: null };
    }

    // Optionally, you can send a confirmation email or handle post-signup logic here

    // Revalidate the path to ensure the latest data is fetched
    revalidatePath('/', "layout");

    // Redirect to the home page or sign-in page
    redirect('/');

    return { status: 'success', user: data.user };
}




export async function LogInUser(formData) {

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
    });

    if (error) {
        console.error('Sign In error:', error);
        return { status: 'error', message: error.message, user: null };
    }

    //TODO create instannce of user in users table
    //TODO explore Supabase database functions for this

    const {data:existingUser} = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .limit(1)
        .single();

    if (!existingUser) {
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ email: formData.email, username: data.user.user_metadata.username }]);

        if (insertError) {
            console.error('Insert user error:', insertError);
            return { status: 'error', message: insertError.message, user: null };
        }
    } 

    revalidatePath('/', "layout");

    return { status: 'success', user: data.user };
}



export async function LogOutUser() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Sign Out error:', error);
        return { status: 'error', message: error.message };
    }

    // Revalidate the path to ensure the latest data is fetched
    revalidatePath('/', "layout");

    // Redirect to the home page or sign-in page
    redirect('/login');
}