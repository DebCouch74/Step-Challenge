import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CHALLENGE_NAME } from '../lib/supabase'
import { Footprints, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
            <Footprints className="w-6 h-6" />
            <span className="hidden sm:block">{CHALLENGE_NAME}</span>
            <span className="sm:hidden">Step Challenge</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  Hi, {profile?.name?.split(' ')[0] || 'there'}!
                </span>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>
                {profile?.is_admin && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}
                <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Join Challenge
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
