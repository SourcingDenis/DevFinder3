import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { UserEmail } from '../../types/supabase';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Add a new user email
export async function addUserEmail(
  userEmail: Omit<UserEmail, 'id' | 'created_at' | 'updated_at'>
): Promise<UserEmail | null> {
  try {
    const { data, error } = await supabase
      .from('user_emails')
      .insert(userEmail)
      .select()
      .single();

    if (error) {
      console.error('Error adding user email:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error adding user email:', err);
    return null;
  }
}

// Get all emails for a specific user
export async function getUserEmails(userId: string): Promise<UserEmail[]> {
  try {
    const { data, error } = await supabase
      .from('user_emails')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user emails:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching user emails:', err);
    return [];
  }
}

// Update email verification status
export async function updateEmailVerificationStatus(
  emailId: string, 
  isVerified: boolean
): Promise<UserEmail | null> {
  try {
    const { data, error } = await supabase
      .from('user_emails')
      .update({ is_verified: isVerified })
      .eq('id', emailId)
      .select()
      .single();

    if (error) {
      console.error('Error updating email verification status:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error updating email verification:', err);
    return null;
  }
}

// Delete a specific user email
export async function deleteUserEmail(
  emailId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_emails')
      .delete()
      .eq('id', emailId);

    if (error) {
      console.error('Error deleting user email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting user email:', err);
    return false;
  }
}
