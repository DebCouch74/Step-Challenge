import { useEffect, useState, useCallback } from 'react'
import { supabase, formatSteps, formatDate } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { ShieldCheck, Download, Users, Footprints, Pencil, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'

const TABS = ['Overview', 'Participants', 'All Entries']

export default function Admin() {
  const [tab, setTab] = useState('Overview')
  const [profiles, setProfiles] = useState([])
  const [entries, setEntries] = useState([])
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editSteps, setEditSteps] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('step_entries').select('*, profiles(name, email)').order('entry_date', { ascending: false }),
    ])

    const profileList = (p || []).filter(x => !x.is_admin)
    setProfiles(profileList)
    setEntries(e || [])

    const totals = {}
    for (const entry of e || []) {
      totals[entry.user_id] = (totals[entry.user_id] || 0) + entry.steps
    }
    const ranked = profileList
      .map(pr => ({ ...pr, total: totals[pr.id] || 0, entryCount: (e || []).filter(x => x.user_id === pr.id).length }))
      .sort((a, b) => b.total - a.total)
    setStandings(ranked)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function deleteEntry(id) {
    if (!confirm('Delete this step entry?')) return
    await supabase.from('step_entries').delete().eq('id', id)
    fetchAll()
  }

  async function saveEdit(id) {
    const steps = parseInt(editSteps, 10)
    if (!steps || steps < 1 || steps > 100000) return
    await supabase.from('step_entries').update({ steps }).eq('id', id)
    setEditingId(null)
    fetchAll()
  }

  function exportCSV() {
    const rows = [
      ['Rank', 'Name', 'Email', 'Total Steps', 'Days Logged'],
      ...standings.map((p, i) => [i + 1, p.name, p.email, p.total, p.entryCount]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'step-challenge-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportEntriesCSV() {
    const rows = [
      ['Name', 'Email', 'Date', 'Steps'],
      ...entries.map(e => [e.profiles?.name, e.profiles?.email, e.entry_date, e.steps]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'step-challenge-all-entries.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalSteps = entries.reduce((s, e) => s + e.steps, 0)
  const rankBadge = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-7 h-7 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage the Team Step Challenge</p>
          </div>
          <button onClick={fetchAll} className="ml-auto text-gray-400 hover:text-blue-500 transition-colors" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Users className="w-5 h-5 text-blue-500" />, label: 'Participants', value: profiles.length },
            { icon: <Footprints className="w-5 h-5 text-green-500" />, label: 'Total Steps Logged', value: formatSteps(totalSteps) },
            { icon: <Footprints className="w-5 h-5 text-purple-500" />, label: 'Total Entries', value: entries.length },
            { icon: <Footprints className="w-5 h-5 text-yellow-500" />, label: 'Avg Steps/Entry', value: entries.length ? formatSteps(Math.round(totalSteps / entries.length)) : '–' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card">
              <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '…' : value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'Overview' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Leaderboard (Admin View)</h2>
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Download className="w-4 h-4" /> Export Results CSV
              </button>
            </div>
            {standings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No participants yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Rank</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Name</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4 hidden sm:table-cell">Email</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Total Steps</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((p, i) => (
                      <tr key={p.id} className={`border-b border-gray-50 ${i < 3 ? 'bg-yellow-50/50' : ''}`}>
                        <td className="py-2.5 pr-4 font-bold text-lg">{rankBadge(i)}</td>
                        <td className="py-2.5 pr-4 font-medium text-gray-900">{p.name}</td>
                        <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{p.email}</td>
                        <td className="py-2.5 pr-4 text-right font-bold text-gray-900">{formatSteps(p.total)}</td>
                        <td className="py-2.5 text-right text-gray-500">{p.entryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Participants Tab */}
        {tab === 'Participants' && (
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4">All Participants ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No participants registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Name</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Email</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Total Steps</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 font-medium text-gray-900">{p.name}</td>
                        <td className="py-2.5 pr-4 text-gray-500">{p.email}</td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-gray-900">{formatSteps(p.total)}</td>
                        <td className="py-2.5 text-right text-gray-400">{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Entries Tab */}
        {tab === 'All Entries' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">All Step Entries ({entries.length})</h2>
              <button onClick={exportEntriesCSV} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {entries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Participant</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Date</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Steps</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => {
                      const suspicious = entry.steps > 50000
                      return (
                        <tr key={entry.id} className={`border-b border-gray-50 hover:bg-gray-50 ${suspicious ? 'bg-orange-50' : ''}`}>
                          <td className="py-2.5 pr-4 text-gray-900">{entry.profiles?.name}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{formatDate(entry.entry_date + 'T12:00:00')}</td>
                          <td className="py-2.5 pr-4 text-right">
                            {editingId === entry.id ? (
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
                              <span className={`font-semibold ${suspicious ? 'text-orange-600' : 'text-gray-900'}`}>
                                {suspicious && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                {formatSteps(entry.steps)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              {editingId === entry.id ? (
                                <>
                                  <button onClick={() => saveEdit(entry.id)} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg font-medium transition-colors">Save</button>
                                  <button onClick={() => setEditingId(null)} className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-lg font-medium transition-colors">Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingId(entry.id); setEditSteps(String(entry.steps)) }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
