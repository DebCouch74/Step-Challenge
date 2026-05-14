import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const CHALLENGE_START = new Date('2026-05-20T12:00:00')
export const CHALLENGE_END = new Date('2026-06-20T12:00:00')
export const CHALLENGE_NAME = 'Team Step Challenge 2026'

export const PRIZES = [
  { place: 1, label: '1st Place', amount: '$150', color: 'gold', emoji: '🥇' },
  { place: 2, label: '2nd Place', amount: '$100', color: 'silver', emoji: '🥈' },
  { place: 3, label: '3rd Place', amount: '$50',  color: 'bronze', emoji: '🥉' },
]

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatSteps(n) {
  return Number(n).toLocaleString()
}

export function isChallengeActive() {
  const now = new Date()
  return now >= CHALLENGE_START && now <= CHALLENGE_END
}

export function isChallengeOver() {
  return new Date() > CHALLENGE_END
}

export function isChallengeNotStarted() {
  return new Date() < CHALLENGE_START
}

export function daysRemaining() {
  const now = new Date()
  if (now < CHALLENGE_START) {
    const diff = CHALLENGE_START - now
    return { label: 'until start', days: Math.ceil(diff / (1000 * 60 * 60 * 24)) }
  }
  if (now > CHALLENGE_END) return { label: 'Challenge over', days: 0 }
  const diff = CHALLENGE_END - now
  return { label: 'days remaining', days: Math.ceil(diff / (1000 * 60 * 60 * 24)) }
}
