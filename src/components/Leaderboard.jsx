import { useEffect, useState } from 'react'
import { supabase, formatSteps, PRIZES } from '../lib/supabase'
import { Trophy, RefreshCw } from 'lucide-react'

export default function Leaderboard({ currentUserId, compact = false }) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStandings()
  }, [])

  async function fetchStandings() {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('is_admin', false)
      .order('name')

    const { data: entries } = await supabase
      .from('step_entries')
      .select('user_id, steps')

    const totals = {}
    for (const e of entries || []) {
      totals[e.user_id] = (totals[e.user_id] || 0) + e.steps
    }

    const ranked = (profiles || [])
      .map(p => ({ ...p, total: totals[p.id] || 0 }))
      .sort((a, b) => b.total - a.total)

    setStandings(ranked)
    setLoading(false)
  }

  const prizeMap = { 0: PRIZES[0], 1: PRIZES[1], 2: PRIZES[2] }
  const borderColors = {
    0: 'border-yellow-300 bg-yellow-50',
    1: 'border-gray-300 bg-gray-50',
    2: 'border-amber-600 bg-amber-50',
  }

  const displayList = compact ? standings.slice(0, 5) : standings

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-lg text-gray-800">Leaderboard</h2>
        </div>
        <button onClick={fetchStandings} className="text-gray-400 hover:text-blue-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {standings.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No steps logged yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {displayList.map((participant, idx) => {
            const prize = prizeMap[idx]
            const isMe = participant.id === currentUserId
            const border = borderColors[idx] || ''

            return (
              <div
                key={participant.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  idx < 3 ? `border-2 ${border}` : 'border border-gray-100 bg-white'
                } ${isMe ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
              >
                <div className="w-8 text-center font-bold text-gray-500">
                  {prize ? (
                    <span className="text-xl">{prize.emoji}</span>
                  ) : (
                    <span className="text-sm">#{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {participant.name}
                    {isMe && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
                  </p>
                  {prize && (
                    <p className="text-xs font-medium mt-0.5" style={{
                      color: idx === 0 ? '#B45309' : idx === 1 ? '#6B7280' : '#92400E'
                    }}>
                      {prize.label} · {prize.amount} Visa Gift Card
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatSteps(participant.total)}</p>
                  <p className="text-xs text-gray-400">steps</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {compact && standings.length > 5 && (
        <p className="text-center text-sm text-gray-400 mt-3">
          +{standings.length - 5} more participants
        </p>
      )}
    </div>
  )
}
