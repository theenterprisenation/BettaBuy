import { supabase } from './supabase';

export async function createAdminUser(email: string, password: string) {
  // 1. Create the user account
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw signUpError;

  // 2. Get the admin role ID
  const { data: adminRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'admin')
    .single();

  if (roleError) throw roleError;

  // 3. Update the user's role to admin
  const { error: updateError } = await supabase
    .from('users')
    .update({ role_id: adminRole.id })
    .eq('id', authData.user!.id);

  if (updateError) throw updateError;

  return authData.user;
}