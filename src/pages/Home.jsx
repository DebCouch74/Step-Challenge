import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Leaderboard from '../components/Leaderboard'
import { useAuth } from '../contexts/AuthContext'
import { PRIZES, CHALLENGE_START, CHALLENGE_END, formatDate, daysRemaining } from '../lib/supabase'
import { Footprints, Calendar, Users, Award } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const { days, label } = daysRemaining()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <Footprints className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
              Team Step Challenge 2026
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Log your steps every day, climb the leaderboard, and win big!
              The most steps over 4 weeks takes home the prize.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="bg-white/15 rounded-xl px-6 py-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-200" />
                <p className="text-2xl font-bold">{days}</p>
                <p className="text-blue-200 text-sm">{label}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-6 py-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-200" />
                <p className="text-sm text-blue-200">Starts</p>
                <p className="font-semibold">{formatDate(CHALLENGE_START)}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-6 py-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-200" />
                <p className="text-sm text-blue-200">Ends</p>
                <p className="font-semibold">{formatDate(CHALLENGE_END)}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-6 py-4 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-200" />
                <p className="text-sm text-blue-200">Duration</p>
                <p className="font-semibold">4 Weeks</p>
              </div>
            </div>

            {user ? (
              <Link to="/dashboard" className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors text-lg">
                Go to My Dashboard →
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors text-lg">
                  Join the Challenge
                </Link>
                <Link to="/login" className="inline-block bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-xl transition-colors text-lg">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prizes */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Prizes</h2>
            <p className="text-gray-400 mt-1">Top 3 overall step counts win Visa Gift Cards</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-end gap-4 max-w-2xl mx-auto">
            {/* 2nd place */}
            <div className="flex-1 bg-gray-800 rounded-xl p-6 text-center border border-gray-600 order-2 sm:order-1">
              <p className="text-4xl mb-2">🥈</p>
              <p className="text-gray-300 font-semibold">2nd Place</p>
              <p className="text-3xl font-extrabold text-gray-100 mt-1">$100</p>
              <p className="text-gray-500 text-sm mt-1">Visa Gift Card</p>
            </div>
            {/* 1st place — elevated */}
            <div className="flex-1 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-xl p-8 text-center shadow-2xl order-1 sm:order-2 sm:-mt-4">
              <p className="text-5xl mb-2">🥇</p>
              <p className="text-yellow-100 font-semibold">1st Place</p>
              <p className="text-4xl font-extrabold text-white mt-1">$150</p>
              <p className="text-yellow-200 text-sm mt-1">Visa Gift Card</p>
            </div>
            {/* 3rd place */}
            <div className="flex-1 bg-gray-800 rounded-xl p-6 text-center border border-gray-600 order-3">
              <p className="text-4xl mb-2">🥉</p>
              <p className="text-gray-300 font-semibold">3rd Place</p>
              <p className="text-3xl font-extrabold text-gray-100 mt-1">$50</p>
              <p className="text-gray-500 text-sm mt-1">Visa Gift Card</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '1', title: 'Register', desc: 'Create your account to join the challenge.' },
              { step: '2', title: 'Log Daily Steps', desc: 'Enter your steps each day from any fitness app or pedometer.' },
              { step: '3', title: 'Climb the Board', desc: 'Watch your rank rise. Most total steps after 4 weeks wins!' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-3">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <Leaderboard compact />
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        Team Step Challenge 2026 · {formatDate(CHALLENGE_START)} – {formatDate(CHALLENGE_END)}
      </footer>
    </div>
  )
}
