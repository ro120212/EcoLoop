import { supabase } from './supabaseClient'

export const isNssceEmail = (email) => {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return clean.endsWith('@nssce.ac.in') || clean === 'student@ecoloop.nssce.ac.in' || clean === 'student'
}

export const PRESET_ACCOUNTS = {
  student: {
    username: 'student',
    email: 'student@ecoloop.nssce.ac.in',
    password: 'student@123',
    role: 'student',
    full_name: 'Rahul M (S6 CSE)',
    department: 'Computer Science and Engineering',
    description: 'NSSCE Student Hub: Peer-to-peer hardware reuse, project parts, public repair clinic'
  }
}

export const mapUsernameToEmail = (usernameOrEmail) => {
  const clean = (usernameOrEmail || '').trim().toLowerCase()
  if (clean === 'student') return PRESET_ACCOUNTS.student.email
  if (clean.includes('@')) return clean
  return `${clean}@nssce.ac.in`
}

export const getUserRole = (_user) => {
  return 'student'
}

export const isProfileComplete = (user) => {
  if (!user) return false
  return Boolean(user.user_metadata?.department)
}

export const authService = {
  async signIn(usernameOrEmail, password) {
    const email = mapUsernameToEmail(usernameOrEmail)
    const cleanUser = (usernameOrEmail || '').trim().toLowerCase()

    // Enforce NSSCE domain check
    if (!isNssceEmail(email)) {
      throw new Error('Access restricted: Only NSS College of Engineering accounts (@nssce.ac.in) are permitted.')
    }

    // Try standard Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data?.user) {
      return { user: data.user, session: data.session, role: 'student' }
    }

    // If account doesn't exist yet in this Supabase instance and matches preset, auto-register it
    if (error && (error.message.includes('Invalid login credentials') || error.message.includes('User not found'))) {
      const isStudentPreset = cleanUser === 'student' || email === PRESET_ACCOUNTS.student.email

      if (isStudentPreset) {
        const preset = PRESET_ACCOUNTS.student
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: preset.email,
          password: preset.password,
          options: {
            data: {
              role: 'student',
              full_name: preset.full_name,
              department: preset.department
            }
          }
        })

        if (!signUpError && signUpData?.user) {
          if (signUpData.session) {
            return { user: signUpData.user, session: signUpData.session, role: 'student' }
          }
          // Retry sign in after registration
          const retry = await supabase.auth.signInWithPassword({
            email: preset.email,
            password: preset.password
          })
          if (!retry.error && retry.data?.user) {
            return { user: retry.data.user, session: retry.data.session, role: 'student' }
          }
        }
      }
    }

    // Local fallback for offline / mock testing if Supabase network fails
    if (cleanUser === 'student' || email === PRESET_ACCOUNTS.student.email) {
      if (PRESET_ACCOUNTS.student.password === password) {
        const preset = PRESET_ACCOUNTS.student
        const mockUser = {
          id: 'user-student',
          email: preset.email,
          user_metadata: {
            role: 'student',
            full_name: preset.full_name,
            department: preset.department
          }
        }
        return { user: mockUser, session: null, role: 'student' }
      }
    }

    throw new Error(error?.message || 'Invalid username or password')
  },

  async signUp({ email, password, fullName, department }) {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!isNssceEmail(cleanEmail)) {
      throw new Error('Access restricted: Registration is exclusively for NSSCE students with @nssce.ac.in email addresses.')
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          role: 'student',
          full_name: fullName || cleanEmail.split('@')[0],
          department: department || 'Computer Science and Engineering'
        }
      }
    })

    if (error) throw error
    return data
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
    return data
  },

  async completeOnboarding({ department, fullName }) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        role: 'student',
        department: department || 'Computer Science and Engineering',
        full_name: fullName,
        onboarded: true
      }
    })

    if (error) throw error
    return data.user
  },

  async signOut() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Sign out warning:', e)
    }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}
