import React, { useState } from 'react'
import {
  BookOpen,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Tag,
  Calendar,
  User,
  ExternalLink,
  FolderOpen,
  Grid,
  List,
  SortAsc,
  Plus,
  Edit,
  Trash2,
  Share,
  Eye,
  Clock,
  Bookmark
} from 'lucide-react'

interface Document {
  id: string
  title: string
  authors: string[]
  type: 'paper' | 'book' | 'article' | 'thesis' | 'report' | 'note'
  source?: string
  year: number
  tags: string[]
  url?: string
  filePath?: string
  dateAdded: Date
  lastAccessed?: Date
  rating?: number
  notes?: string
  readingProgress?: number
  isBookmarked: boolean
  abstract?: string
}

interface Collection {
  id: string
  name: string
  description: string
  documentCount: number
  color: string
  createdAt: Date
}

const LibrarySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'collections' | 'notes'>('documents')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | Document['type']>('all')
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'year' | 'rating'>('dateAdded')
  const [showUpload, setShowUpload] = useState(false)

  // Mock data
  const [documents] = useState<Document[]>([
    {
      id: '1',
      title: 'Attention Is All You Need',
      authors: ['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.'],
      type: 'paper',
      source: 'NeurIPS 2017',
      year: 2017,
      tags: ['transformers', 'attention', 'NLP'],
      url: 'https://arxiv.org/abs/1706.03762',
      dateAdded: new Date('2024-01-10'),
      lastAccessed: new Date('2024-01-14'),
      rating: 5,
      readingProgress: 85,
      isBookmarked: true,
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...'
    },
    {
      id: '2',
      title: 'Deep Learning',
      authors: ['Goodfellow, I.', 'Bengio, Y.', 'Courville, A.'],
      type: 'book',
      year: 2016,
      tags: ['deep learning', 'neural networks', 'AI'],
      dateAdded: new Date('2024-01-08'),
      lastAccessed: new Date('2024-01-15'),
      rating: 5,
      readingProgress: 45,
      isBookmarked: true,
      notes: 'Comprehensive introduction to deep learning. Focus on chapters 6-9 for current research.'
    },
    {
      id: '3',
      title: 'Research Methodology Notes',
      authors: ['You'],
      type: 'note',
      year: 2024,
      tags: ['methodology', 'research design'],
      dateAdded: new Date('2024-01-12'),
      lastAccessed: new Date('2024-01-15'),
      isBookmarked: false,
      notes: 'Personal notes on quantitative vs qualitative research methods.'
    },
    {
      id: '4',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: ['Devlin, J.', 'Chang, M.', 'Lee, K.'],
      type: 'paper',
      source: 'NAACL 2019',
      year: 2019,
      tags: ['BERT', 'transformers', 'pretraining'],
      url: 'https://arxiv.org/abs/1810.04805',
      dateAdded: new Date('2024-01-09'),
      rating: 4,
      readingProgress: 100,
      isBookmarked: false
    }
  ])

  const [collections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Transformer Models',
      description: 'Papers and resources on transformer architectures',
      documentCount: 12,
      color: 'blue',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Research Methodology',
      description: 'Books and papers on research design and methodology',
      documentCount: 8,
      color: 'green',
      createdAt: new Date('2024-01-05')
    },
    {
      id: '3',
      name: 'Current Reading',
      description: 'Papers currently being read',
      documentCount: 5,
      color: 'purple',
      createdAt: new Date('2024-01-10')
    }
  ])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'year':
        return b.year - a.year
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'dateAdded':
      default:
        return b.dateAdded.getTime() - a.dateAdded.getTime()
    }
  })

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'paper':
        return <FileText className="w-4 h-4" />
      case 'book':
        return <BookOpen className="w-4 h-4" />
      case 'article':
        return <FileText className="w-4 h-4" />
      case 'thesis':
        return <FileText className="w-4 h-4" />
      case 'report':
        return <FileText className="w-4 h-4" />
      case 'note':
        return <Edit className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'paper':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'book':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'article':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'thesis':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'report':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'note':
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const totalDocuments = documents.length
  const bookmarkedDocuments = documents.filter(d => d.isBookmarked).length
  const avgRating = documents.filter(d => d.rating).reduce((acc, d, _, arr) => acc + (d.rating! / arr.length), 0)
  const readingProgress = documents.filter(d => d.readingProgress).reduce((acc, d, _, arr) => acc + (d.readingProgress! / arr.length), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Research Library</h2>
          <p className="text-gray-600 dark:text-gray-400">Organize and manage your research documents</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{totalDocuments}</div>
            <div className="text-xs text-gray-500">Documents</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{bookmarkedDocuments}</div>
            <div className="text-xs text-gray-500">Bookmarked</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{avgRating.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Avg Rating</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{Math.round(readingProgress)}%</div>
            <div className="text-xs text-gray-500">Avg Progress</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['documents', 'collections', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="paper">Papers</option>
                  <option value="book">Books</option>
                  <option value="article">Articles</option>
                  <option value="note">Notes</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="title">Title</option>
                  <option value="year">Year</option>
                  <option value="rating">Rating</option>
                </select>

                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid/List */}
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
            : 'space-y-3'
          }`}>
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {getTypeIcon(doc.type)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.isBookmarked && (
                      <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {doc.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{doc.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {doc.authors.join(', ')} {doc.year && `(${doc.year})`}
                </p>

                {doc.source && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{doc.source}</p>
                )}

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {doc.readingProgress !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Reading Progress</span>
                      <span>{doc.readingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${doc.readingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {doc.dateAdded.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {doc.url && (
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 rounded">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start building your research library'}
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Your First Document
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-${collection.color}-100 dark:bg-${collection.color}-900/30 rounded-lg`}>
                  <FolderOpen className={`w-6 h-6 text-${collection.color}-600 dark:text-${collection.color}-400`} />
                </div>
                <span className="text-sm text-gray-500">{collection.documentCount} docs</span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{collection.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{collection.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created {collection.createdAt.toLocaleDateString()}</span>
                <button className="text-emerald-600 hover:text-emerald-700">View →</button>
              </div>
            </div>
          ))}

          <button className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-emerald-600">
            <Plus className="w-8 h-8 mb-2" />
            <span>Create Collection</span>
          </button>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="text-center py-12">
          <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Research Notes</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced note-taking features coming soon
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Document</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop files or click to browse
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, MD
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LibrarySection