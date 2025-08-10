import { supabase } from './supabase'

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }

    // Only create profile if user was created successfully
    if (data.user && !error) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
      })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected signup error:', err)
    return { data: null, error: { message: 'An unexpected error occurred' } }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Signin error:', error)
    }
    
    return { data, error }
  } catch (err) {
    console.error('Unexpected signin error:', err)
    return { data: null, error: { message: 'An unexpected error occurred' } }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Signout error:', error)
    }
    return { error }
  } catch (err) {
    console.error('Unexpected signout error:', err)
    return { error: { message: 'An unexpected error occurred' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Get user error:', error)
    }
    return user
  } catch (err) {
    console.error('Unexpected get user error:', err)
    return null
  }
}
