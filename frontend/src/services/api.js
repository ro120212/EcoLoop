export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

// In-Memory Client Cache (SWR Pattern for 0ms Tab Switching)
const clientCache = new Map()
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

function getFromCache(key) {
  const entry = clientCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    clientCache.delete(key)
    return null
  }
  return entry.data
}

function setToCache(key, data, ttlMs = CACHE_TTL_MS) {
  clientCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

function invalidateCache(pattern) {
  if (!pattern) {
    clientCache.clear()
    return
  }
  for (const key of clientCache.keys()) {
    if (key.includes(pattern)) {
      clientCache.delete(key)
    }
  }
}

export const api = {
  // Cache Management
  invalidateCache,
  getCached(key) {
    return getFromCache(key)
  },

  // Cold-start keepalive ping
  async pingHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`)
      return res.ok
    } catch {
      return false
    }
  },

  // Stats & Departments
  async getStats(options = {}) {
    const cacheKey = 'stats:global'
    if (!options.forceRefresh) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }
    const res = await fetch(`${API_BASE}/api/stats`)
    const data = await res.json()
    setToCache(cacheKey, data)
    return data
  },
  async getDepartments() {
    const cacheKey = 'departments:all'
    const cached = getFromCache(cacheKey)
    if (cached) return cached

    const res = await fetch(`${API_BASE}/api/departments`)
    const data = await res.json()
    setToCache(cacheKey, data, 24 * 60 * 60 * 1000) // 24hr TTL
    return data
  },
  async setGeminiKey(apiKey) {
    const res = await fetch(`${API_BASE}/api/settings/gemini-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    })
    return res.json()
  },

  // Circular Marketplace
  async getMarketplace(department, category, status, options = {}) {
    const cacheKey = `marketplace:${department || 'All'}:${category || 'All'}:${status || 'All'}`
    if (!options.forceRefresh) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const params = new URLSearchParams()
    if (department && department !== 'All') params.append('department', department)
    if (category && category !== 'All') params.append('category', category)
    if (status) params.append('status', status)
    const res = await fetch(`${API_BASE}/api/marketplace?${params.toString()}`)
    const data = await res.json()
    setToCache(cacheKey, data)
    return data
  },
  async createMarketItem(data) {
    const res = await fetch(`${API_BASE}/api/marketplace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    invalidateCache('marketplace')
    invalidateCache('portfolio')
    invalidateCache('stats')
    return result
  },
  async claimItem(itemId, buyerId, buyerName, meetingPoint, claimedComponent = 'All') {
    const res = await fetch(`${API_BASE}/api/marketplace/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: itemId,
        buyer_id: buyerId,
        buyer_name: buyerName,
        meeting_point: meetingPoint,
        claimed_component: claimedComponent,
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || 'Failed to claim item.')
    }
    invalidateCache('marketplace')
    invalidateCache('portfolio')
    invalidateCache('stats')
    return data
  },
  async verifyHandoffPin(itemId, enteredPin) {
    const res = await fetch(`${API_BASE}/api/marketplace/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: itemId,
        entered_pin: enteredPin,
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.detail || data?.message || `Server error (${res.status})`)
    }
    invalidateCache('marketplace')
    invalidateCache('portfolio')
    invalidateCache('stats')
    return data
  },
  async getUserPortfolio(userId, email, name, options = {}) {
    const cacheKey = `portfolio:${userId}:${email || ''}:${name || ''}`
    if (!options.forceRefresh) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const params = new URLSearchParams()
    if (email) params.append('email', email)
    if (name) params.append('name', name)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${API_BASE}/api/user/portfolio/${encodeURIComponent(userId)}${qs}`)
    const data = await res.json()
    setToCache(cacheKey, data)
    return data
  },

  // AI Classification (Vision for Circular Economy)
  async classifyWaste(imageFile) {
    const formData = new FormData()
    formData.append('file', imageFile)
    const res = await fetch(`${API_BASE}/api/ai/classify`, {
      method: 'POST',
      body: formData,
    })
    return res.json()
  },

  // AI Repair Troubleshooter
  async diagnoseRepair(deviceName, symptom, deviceCategory) {
    const res = await fetch(`${API_BASE}/api/repair/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_name: deviceName,
        symptom: symptom,
        device_category: deviceCategory,
      }),
    })
    return res.json()
  },
  async getRepairTickets(department, userId, options = {}) {
    const cacheKey = `tickets:${department || 'All'}:${userId || 'All'}`
    if (!options.forceRefresh) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      const params = new URLSearchParams()
      if (department && department !== 'All') params.append('department', department)
      if (userId) params.append('user_id', userId)
      const res = await fetch(`${API_BASE}/api/repair/tickets?${params.toString()}`)
      if (!res.ok) return []
      const data = await res.json()
      setToCache(cacheKey, data)
      return data
    } catch {
      return []
    }
  },
  async createRepairTicket(data) {
    const res = await fetch(`${API_BASE}/api/repair/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    invalidateCache('tickets')
    invalidateCache('stats')
    return result
  },
  async resolveRepairTicket(ticketId, data) {
    const res = await fetch(`${API_BASE}/api/repair/tickets/${ticketId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(body?.detail || body?.message || 'Failed to resolve ticket.')
    }
    invalidateCache('tickets')
    invalidateCache('stats')
    return body
  },

  // Lab Audits & Triage across CSE, Mech, Civil, EEE, IC
  async getAudits() {
    const res = await fetch(`${API_BASE}/api/audits`)
    return res.json()
  },
  async createAudit(data) {
    const res = await fetch(`${API_BASE}/api/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    invalidateCache('stats')
    return res.json()
  },
  async getAuditAnalytics() {
    const res = await fetch(`${API_BASE}/api/audits/analytics`)
    return res.json()
  },
  async getInventory(department) {
    const params = new URLSearchParams()
    if (department && department !== 'All') params.append('department', department)
    const res = await fetch(`${API_BASE}/api/inventory?${params.toString()}`)
    return res.json()
  },
  async upsertInventory(data) {
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
}
