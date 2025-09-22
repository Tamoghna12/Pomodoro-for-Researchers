import React, { useState } from 'react'
import MusicPlayer from '../MusicPlayer'
import { Music, Headphones, Radio, ListMusic, Heart, TrendingUp, Clock } from 'lucide-react'

const MusicSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'playlists' | 'radio' | 'library'>('player')

  const focusPlaylists = [
    {
      name: 'Deep Focus',
      description: 'Ambient sounds for concentrated work',
      tracks: 45,
      duration: '3h 12m',
      image: '🎯',
      color: 'blue',
      isLiked: true
    },
    {
      name: 'Coding Flow',
      description: 'Electronic beats for programming',
      tracks: 32,
      duration: '2h 45m',
      image: '💻',
      color: 'purple',
      isLiked: false
    },
    {
      name: 'Study Beats',
      description: 'Lo-fi hip-hop for studying',
      tracks: 28,
      duration: '2h 15m',
      image: '📚',
      color: 'green',
      isLiked: true
    },
    {
      name: 'Ambient Research',
      description: 'Nature sounds and white noise',
      tracks: 38,
      duration: '4h 20m',
      image: '🌊',
      color: 'teal',
      isLiked: false
    },
    {
      name: 'Classical Study',
      description: 'Instrumental classical music',
      tracks: 42,
      duration: '3h 55m',
      image: '🎼',
      color: 'indigo',
      isLiked: true
    },
    {
      name: 'Productivity Mix',
      description: 'Curated mix for maximum focus',
      tracks: 35,
      duration: '2h 58m',
      image: '⚡',
      color: 'orange',
      isLiked: false
    }
  ]

  const radioStations = [
    { name: 'Focus FM', genre: 'Ambient', listeners: '12.3K', color: 'blue' },
    { name: 'Study Radio', genre: 'Lo-Fi', listeners: '8.7K', color: 'purple' },
    { name: 'Work Beats', genre: 'Electronic', listeners: '15.2K', color: 'green' },
    { name: 'Calm Waves', genre: 'Nature', listeners: '6.9K', color: 'teal' }
  ]

  const tabs = [
    { id: 'player' as const, label: 'Player', icon: Music },
    { id: 'playlists' as const, label: 'Playlists', icon: ListMusic },
    { id: 'radio' as const, label: 'Radio', icon: Radio },
    { id: 'library' as const, label: 'Library', icon: Headphones }
  ]

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Music & Sounds
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enhance your focus with carefully curated music and ambient sounds
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-2 border border-gray-200/50 dark:border-gray-700/50">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'player' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <MusicPlayer />
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Controls
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-left">
                    <div className="font-medium text-blue-900 dark:text-blue-100">Focus Mode</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Block distracting sounds</div>
                  </button>
                  <button className="w-full p-3 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors text-left">
                    <div className="font-medium text-green-900 dark:text-green-100">Timer Sync</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Auto-pause with breaks</div>
                  </button>
                  <button className="w-full p-3 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors text-left">
                    <div className="font-medium text-purple-900 dark:text-purple-100">Smart Mix</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">AI-curated for your task</div>
                  </button>
                </div>
              </div>

              {/* Recently Played */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recently Played
                </h3>
                <div className="space-y-3">
                  {['Concentration Flow', 'Deep Work Ambient', 'Study Session Mix'].map((track, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                        ♪
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{track}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Focus Sounds</div>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {focusPlaylists.map((playlist, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-${playlist.color}-100 dark:bg-${playlist.color}-900/30 rounded-xl flex items-center justify-center text-3xl`}>
                      {playlist.image}
                    </div>
                    <button className={`p-2 rounded-lg transition-colors ${playlist.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                      <Heart className={`w-5 h-5 ${playlist.isLiked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {playlist.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{playlist.tracks} tracks</span>
                    <span>{playlist.duration}</span>
                  </div>
                  <button className={`w-full mt-4 py-2 px-4 bg-${playlist.color}-500 hover:bg-${playlist.color}-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100`}>
                    Play Playlist
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'radio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {radioStations.map((station, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${station.color}-100 dark:bg-${station.color}-900/30 rounded-full flex items-center justify-center`}>
                      <Radio className={`w-6 h-6 text-${station.color}-600 dark:text-${station.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {station.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {station.genre} • {station.listeners} listening
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center">
              <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Music Library
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your music services to access your personal library
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Liked Songs</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">0 tracks</div>
                </div>
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <ListMusic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Playlists</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">0 playlists</div>
                </div>
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Recent</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">0 tracks</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MusicSection