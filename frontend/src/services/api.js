export const api = {
  // Stats & Departments
  async getStats() {
    const res = await fetch('/api/stats')
    return res.json()
  },
  async getDepartments() {
    const res = await fetch('/api/departments')
    return res.json()
  },
  async setGeminiKey(apiKey) {
    const res = await fetch('/api/settings/gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    })
    return res.json()
  },

  // Circular Marketplace
  async getMarketplace(department, category, status) {
    const params = new URLSearchParams()
    if (department && department !== 'All') params.append('department', department)
    if (category && category !== 'All') params.append('category', category)
    if (status) params.append('status', status)
    const res = await fetch(`/api/marketplace?${params.toString()}`)
    return res.json()
  },
  async createMarketItem(data) {
    const res = await fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async claimItem(itemId, buyerId, buyerName, meetingPoint, claimedComponent = 'All') {
    const res = await fetch('/api/marketplace/claim', {
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
    return data
  },
  async verifyHandoffPin(itemId, enteredPin) {
    const res = await fetch('/api/marketplace/verify-pin', {
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
    return data
  },
  async getUserPortfolio(userId) {
    const res = await fetch(`/api/user/portfolio/${userId}`)
    return res.json()
  },

  // AI Classification (Gemini 2.5 Flash Vision for Circular Economy)
  async classifyWaste(imageFile) {
    const formData = new FormData()
    formData.append('file', imageFile)
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      body: formData,
    })
    return res.json()
  },

  // AI Repair Troubleshooter
  async diagnoseRepair(deviceName, symptom, deviceCategory) {
    const res = await fetch('/api/repair/diagnose', {
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
  async getRepairTickets() {
    try {
      const res = await fetch('/api/repair/tickets')
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  async createRepairTicket(data) {
    const res = await fetch('/api/repair/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  // Lab Audits & Triage across CSE, Mech, Civil, EEE, IC
  async getAudits() {
    const res = await fetch('/api/audits')
    return res.json()
  },
  async createAudit(data) {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async getAuditAnalytics() {
    const res = await fetch('/api/audits/analytics')
    return res.json()
  },
  async getInventory(department) {
    const params = new URLSearchParams()
    if (department && department !== 'All') params.append('department', department)
    const res = await fetch(`/api/inventory?${params.toString()}`)
    return res.json()
  },
  async upsertInventory(data) {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
}
