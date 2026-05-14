import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, formatSteps, formatDate, CHALLENGE_START, CHALLENGE_END } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Leaderboard from '../components/Leaderboard'
import StepEntryForm from '../components/StepEntryForm'
import { Footprints, TrendingUp, Calendar, Star, Pencil, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState({ total: 0, days: 0, avg: 0, rank: null })
  const [editingEntry, setEditingEntry] = useState(null)
  const [editSteps, setEditSteps] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from('step_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
    setEntries(data || [])

    const total = (data || []).reduce((s, e) => s + e.steps, 0)
    const days = (data || []).length
    setStats(prev => ({ ...prev, total, days, avg: days ? Math.round(total / days) : 0 }))
    setLoading(false)
  }, [user.id])

  const fetchRank = useCallback(async () => {
    const { data: allEntries } = await supabase
      .from('step_entries')
      .select('user_id, steps')

    const totals = {}
    for (const e of allEntries || []) {
      totals[e.user_id] = (totals[e.user_id] || 0) + e.steps
    }
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
    const rank = sorted.findIndex(([id]) => id === user.id) + 1
    setStats(prev => ({ ...prev, rank: rank > 0 ? rank : null }))
  }, [user.id])

  useEffect(() => {
    fetchEntries()
    fetchRank()
  }, [fetchEntries, fetchRank])

  async function handleDelete(entryId) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('step_entries').delete().eq('id', entryId)
    fetchEntries()
    fetchRank()
  }

  async function handleEdit(entry) {
    if (editingEntry?.id === entry.id) {
      const steps = parseInt(editSteps, 10)
      if (!steps || steps < 1 || steps > 100000) return
      await supabase.from('step_entries').update({ steps }).eq('id', entry.id)
      setEditingEntry(null)
      fetchEntries()
      fetchRank()
    } else {
      setEditingEntry(entry)
      setEditSteps(String(entry.steps))
    }
  }

  function handleSaved() {
    fetchEntries()
    fetchRank()
  }

  const rankEmoji = stats.rank === 1 ? '🥇' : stats.rank === 2 ? '🥈' : stats.rank === 3 ? '🥉' : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.name?.split(' ')[0] || 'Challenger'}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Challenge: {formatDate(CHALLENGE_START)} – {formatDate(CHALLENGE_END)}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Footprints className="w-5 h-5 text-blue-500" />, label: 'Total Steps', value: formatSteps(stats.total) },
            { icon: <Calendar className="w-5 h-5 text-green-500" />, label: 'Days Logged', value: stats.days },
            { icon: <TrendingUp className="w-5 h-5 text-purple-500" />, label: 'Daily Avg', value: formatSteps(stats.avg) },
            { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Current Rank', value: stats.rank ? `${rankEmoji || ''}#${stats.rank}` : '–' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card">
              <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500 font-medium">{label}</span></div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '…' : value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Entry form + history */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Footprints className="w-5 h-5 text-blue-500" />
                Log Your Steps
              </h2>
              <StepEntryForm onSaved={handleSaved} />
            </div>

            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4">My Step History</h2>
              {entries.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No entries yet — log your first steps above!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-gray-500 font-medium pb-2">Date</th>
                        <th className="text-right text-gray-500 font-medium pb-2">Steps</th>
                        <th className="text-right text-gray-500 font-medium pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(entry => (
                        <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 text-gray-700">{formatDate(entry.entry_date + 'T12:00:00')}</td>
                          <td className="py-2.5 text-right font-semibold text-gray-900">
                            {editingEntry?.id === entry.id ? (
                              <input
                                type="number"
                                className="input w-28 text-right"
                                value={editSteps}
                                min="1"
                                max="100000"
                                onChange={e => setEditSteps(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              formatSteps(entry.steps)
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEdit(entry)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  editingEntry?.id === entry.id
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                                }`}
                                title={editingEntry?.id === entry.id ? 'Save' : 'Edit'}
                              >
                                {editingEntry?.id === entry.id
                                  ? <span className="text-xs font-bold px-1">Save</span>
                                  : <Pencil className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="card h-fit">
            <Leaderboard currentUserId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
