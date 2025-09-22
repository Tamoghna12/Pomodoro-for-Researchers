import React, { useState, useRef } from 'react'
import { searchService } from '../../services/searchService'
import { aiService } from '../../services/aiService'
import {
  Search,
  Globe,
  Settings,
  Filter,
  Calendar,
  ExternalLink,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  BookOpen,
  Image,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface SearchResult {
  title: string
  url: string
  description: string
  publishedDate?: string
  thumbnail?: {
    src: string
    height: number
    width: number
  }
  type: 'web' | 'news' | 'images'
  source?: string
}

interface SearchFilters {
  type: 'web' | 'news' | 'images' | 'all'
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all'
  country?: string
  safeSearch?: 'strict' | 'moderate' | 'off'
  limit?: number
}

const EnhancedSearchSection: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiSummary, setAISummary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'web',
    timeRange: 'all',
    safeSearch: 'moderate',
    limit: 10
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isSearchConfigured = searchService.isConfigured()
  const isAIEnabled = aiService.isEnabled()

  const handleSearch = async () => {
    if (!query.trim() || !isSearchConfigured) return

    setLoading(true)
    setResults([])
    setAISummary('')

    try {
      if (isAIEnabled) {
        const response = await searchService.searchWithAI(query)
        setResults(response.searchResults.results)
        setSearchTime(response.searchResults.searchTime)
        setTotalResults(response.searchResults.totalResults)
        setAISummary(response.aiSummary || '')
      } else {
        const response = await searchService.search(query, filters)
        setResults(response.results)
        setSearchTime(response.searchTime)
        setTotalResults(response.totalResults)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      const searchSuggestions = await searchService.getSearchSuggestions(searchQuery)
      setSuggestions(searchSuggestions)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      setSuggestions([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInDays === 0) return 'Today'
      if (diffInDays === 1) return 'Yesterday'
      if (diffInDays < 7) return `${diffInDays} days ago`
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
      return `${Math.floor(diffInDays / 30)} months ago`
    } catch {
      return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <MessageSquare className="w-4 h-4" />
      case 'images': return <Image className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  if (!isSearchConfigured) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Search className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Search
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure your Brave Search API key to enable powerful web search capabilities with AI-enhanced results.
          </p>
          <button
            onClick={() => {
              // This would open settings - for now just show instruction
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configure Search API
          </button>
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features Available</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Web, news, and image search</li>
              <li>• AI-powered result summaries</li>
              <li>• Advanced filtering and sorting</li>
              <li>• Research-focused insights</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enhanced Search
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered web search for research and discovery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAIEnabled && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Enhanced</span>
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Search Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    handleSuggestionSearch(e.target.value)
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="Search the web with AI insights..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    setSuggestions([])
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="web">Web</option>
                  <option value="news">News</option>
                  <option value="images">Images</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Any time</option>
                  <option value="day">Past day</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Results
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Safe Search
                </label>
                <select
                  value={filters.safeSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, safeSearch: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="strict">Strict</option>
                  <option value="moderate">Moderate</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-lg">Searching with AI enhancement...</span>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="p-6">
            {/* Search Stats */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
              <span>
                About {totalResults.toLocaleString()} results ({searchTime}ms)
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{(searchTime / 1000).toFixed(2)}s</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">AI Summary</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {aiSummary}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <div className="flex items-start gap-4">
                    {result.thumbnail && (
                      <img
                        src={result.thumbnail.src}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(result.type)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">{result.source}</span>
                        {result.publishedDate && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(result.publishedDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          {result.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !query && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start your research
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter a search query to find relevant information with AI-powered insights
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Latest research trends',
                  'Academic publications',
                  'Industry reports',
                  'Technical documentation'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSearchSection