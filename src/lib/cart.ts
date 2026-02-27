'use client'

export function getGuestSessionId(): string {
  // Prevent SSR crashes
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('vouch_guest_session')
  
  if (!sessionId) {
    // Generate a secure-enough unique string for the guest cart
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('vouch_guest_session', sessionId)
  }
  
  return sessionId
}