import { supabase } from './supabaseClient'

export const PRESET_ACCOUNTS = {
  student: {
    username: 'student',
    email: 'student@ecoloop.nssce.ac.in',
    password: 'student@123',
    role: 'student',
    full_name: 'Rahul M (S6 CSE)',
    department: 'Computer Science and Engineering',
    description: 'Student Hub: Peer-to-peer hardware reuse, project parts, repair tickets'
  },
  faculty: {
    username: 'faculty',
    email: 'faculty@ecoloop.nssce.ac.in',
    password: 'faculty@123',
    role: 'lab_staff',
    full_name: 'Prof. Haridasan K (Lab In-Charge)',
    department: 'Computer Science and Engineering',
    description: 'Faculty / Lab Staff: Department workshop helpdesk, audit triage, scrap adoption'
  },
  admin: {
    username: 'admin',
    email: 'admin@ecoloop.nssce.ac.in',
    password: 'admin@123',
    role: 'admin',
    full_name: 'Campus E-Waste Cell Admin',
    department: 'Central Administration',
    description: 'Administration: Campus-wide analytics, 5-branch triage, compliance oversight'
  }
}

export const mapUsernameToEmail = (usernameOrEmail) => {
  const clean = (usernameOrEmail || '').trim().toLowerCase()
  if (clean === 'student') return PRESET_ACCOUNTS.student.email
  if (clean === 'faculty' || clean === 'lab_staff' || clean === 'staff') return PRESET_ACCOUNTS.faculty.email
  if (clean === 'admin') return PRESET_ACCOUNTS.admin.email
  if (clean.includes('@')) return clean
  return `${clean}@ecoloop.nssce.ac.in`
}

export const getUserRole = (user) => {
  if (!user) return 'student'
  const metaRole = user.user_metadata?.role
  if (metaRole) return metaRole
  const email = (user.email || '').toLowerCase()
  if (email.startsWith('admin') || email.includes('admin')) return 'admin'
  if (email.startsWith('faculty') || email.includes('staff') || email.includes('lab')) return 'lab_staff'
  return 'student'
}

export const authService = {
  async signIn(usernameOrEmail, password) {
    const email = mapUsernameToEmail(usernameOrEmail)
    const cleanUser = (usernameOrEmail || '').trim().toLowerCase()

    // Try standard Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data?.user) {
      return { user: data.user, session: data.session, role: getUserRole(data.user) }
    }

    // If account doesn't exist yet in this Supabase instance and matches preset, auto-register it
    if (error && (error.message.includes('Invalid login credentials') || error.message.includes('User not found'))) {
      const presetKey = cleanUser === 'student' || email === PRESET_ACCOUNTS.student.email ? 'student'
        : cleanUser === 'faculty' || email === PRESET_ACCOUNTS.faculty.email ? 'faculty'
        : cleanUser === 'admin' || email === PRESET_ACCOUNTS.admin.email ? 'admin'
        : null

      if (presetKey) {
        const preset = PRESET_ACCOUNTS[presetKey]
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: preset.email,
          password: preset.password,
          options: {
            data: {
              role: preset.role,
              full_name: preset.full_name,
              department: preset.department
            }
          }
        })

        if (!signUpError && signUpData?.user) {
          if (signUpData.session) {
            return { user: signUpData.user, session: signUpData.session, role: preset.role }
          }
          // Retry sign in after registration
          const retry = await supabase.auth.signInWithPassword({
            email: preset.email,
            password: preset.password
          })
          if (!retry.error && retry.data?.user) {
            return { user: retry.data.user, session: retry.data.session, role: preset.role }
          }
        }
      }
    }

    // Local fallback for offline / mock testing if Supabase network fails
    const presetKey = cleanUser === 'student' || email === PRESET_ACCOUNTS.student.email ? 'student'
      : cleanUser === 'faculty' || email === PRESET_ACCOUNTS.faculty.email ? 'faculty'
      : cleanUser === 'admin' || email === PRESET_ACCOUNTS.admin.email ? 'admin'
      : null

    if (presetKey && PRESET_ACCOUNTS[presetKey].password === password) {
      const preset = PRESET_ACCOUNTS[presetKey]
      const mockUser = {
        id: `user-${presetKey}`,
        email: preset.email,
        user_metadata: {
          role: preset.role,
          full_name: preset.full_name,
          department: preset.department
        }
      }
      return { user: mockUser, session: null, role: preset.role }
    }

    throw new Error(error?.message || 'Invalid username or password')
  },

  async signUp({ email, password, role, fullName, department }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role || 'student',
          full_name: fullName || email.split('@')[0],
          department: department || 'Computer Science and Engineering'
        }
      }
    })

    if (error) throw error
    return data
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
