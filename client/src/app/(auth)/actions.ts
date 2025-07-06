'use server';

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AuthResult = { error: string } | { success: true };

export async function login({ email, password}: { email: string; password: string}): Promise<AuthResult> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email, 
        password
    });
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  }

export async function signup({ email, password}: { email: string; password: string}): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: '/login'
    }
  })

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          email_verified: false,
          provider_user_id: data.user.id,
          auth_provider: 'email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

    if (userError) {
      console.error('Error creating user record:', userError);
    }
  }

  revalidatePath('/', 'layout')
  return { success: true };
}

export async function createGoogleUser(userId: string, email: string, providerUserId?: string) {
  const supabase = await createClient();

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingUser) {
    return { success: true };
  }

  const { error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        email: email,
        email_verified: true,
        provider_user_id: providerUserId || userId,
        auth_provider: 'google',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]);

  if (error) {
    console.error('Error creating Google user record:', error);
    return { error: error.message };
  }

  return { success: true };
}