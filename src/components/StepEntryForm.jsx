import { useState } from 'react'
import { supabase, CHALLENGE_START, CHALLENGE_END, formatDate } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertCircle } from 'lucide-react'

function toLocalDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function StepEntryForm({ onSaved }) {
  const { user } = useAuth()
  const today = new Date()
  const minDate = toLocalDateString(CHALLENGE_START)
  const maxDate = toLocalDateString(today > CHALLENGE_END ? CHALLENGE_END : today)
  const defaultDate = today >= CHALLENGE_START && today <= CHALLENGE_END
    ? toLocalDateString(today)
    : maxDate

  const [date, setDate] = useState(defaultDate)
  const [steps, setSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    const stepCount = parseInt(steps, 10)
    if (!stepCount || stepCount < 1 || stepCount > 100000) {
      setMessage({ type: 'error', text: 'Steps must be between 1 and 100,000.' })
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('step_entries')
      .upsert({ user_id: user.id, entry_date: date, steps: stepCount }, { onConflict: 'user_id,entry_date' })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: `Saved! ${stepCount.toLocaleString()} steps for ${formatDate(date + 'T12:00:00')}.` })
      setSteps('')
      onSaved?.()
    }
  }

  const challengeNotStarted = today < CHALLENGE_START
  const challengeOver = today > CHALLENGE_END

  if (challengeNotStarted) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Step entry opens on {formatDate(CHALLENGE_START)}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Date</label>
        <input
          type="date"
          className="input"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={e => setDate(e.target.value)}
          disabled={challengeOver}
          required
        />
      </div>
      <div>
        <label className="label">Steps</label>
        <input
          type="number"
          className="input"
          placeholder="e.g. 8500"
          value={steps}
          min="1"
          max="100000"
          onChange={e => setSteps(e.target.value)}
          disabled={challengeOver}
          required
        />
        <p className="text-xs text-gray-400 mt-1">Max 100,000 per day. Re-submitting the same date updates your entry.</p>
      </div>

      {message && (
        <div className={`flex items-start gap-2 text-sm rounded-lg p-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          {message.text}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading || challengeOver}
      >
        {loading ? 'Saving...' : challengeOver ? 'Challenge Ended' : 'Log Steps'}
      </button>
    </form>
  )
}
