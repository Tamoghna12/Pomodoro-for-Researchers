export interface SearchResult {
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

export interface SearchResponse {
  query: string
  results: SearchResult[]
  totalResults: number
  searchTime: number
  suggestions?: string[]
}

export interface SearchFilters {
  type: 'web' | 'news' | 'images' | 'all'
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all'
  country?: string
  safeSearch?: 'strict' | 'moderate' | 'off'
  limit?: number
}

class SearchService {
  private readonly baseUrl = 'https://api.search.brave.com/res/v1'

  private getApiKey(): string | null {
    return localStorage.getItem('brave-search-api-key')
  }

  public isConfigured(): boolean {
    return !!this.getApiKey()
  }

  public async search(query: string, filters: SearchFilters = { type: 'web' }): Promise<SearchResponse> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('Brave Search API key not configured')
    }

    try {
      const startTime = Date.now()

      // Build search parameters
      const params = new URLSearchParams({
        q: query,
        count: (filters.limit || 10).toString(),
        offset: '0',
        safesearch: filters.safeSearch || 'moderate',
        freshness: this.mapTimeRange(filters.timeRange),
        country: filters.country || 'US'
      })

      // Determine endpoint based on search type
      let endpoint = 'web/search'
      if (filters.type === 'news') endpoint = 'news/search'
      if (filters.type === 'images') endpoint = 'images/search'

      const response = await fetch(`${this.baseUrl}/${endpoint}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Search failed: ${response.status} ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      const searchTime = Date.now() - startTime

      return this.parseSearchResponse(query, data, searchTime, filters.type)
    } catch (error: any) {
      console.error('Search failed:', error)
      throw new Error(`Search failed: ${error.message}`)
    }
  }

  public async searchWithAI(query: string, context?: string): Promise<{
    searchResults: SearchResponse
    aiSummary?: string
  }> {
    // First, perform the search
    const searchResults = await this.search(query, { type: 'web', limit: 5 })

    // If AI is available, generate a summary
    let aiSummary: string | undefined

    try {
      const { aiService } = await import('./aiService')

      if (aiService.isEnabled()) {
        const searchContext = searchResults.results
          .map((result, index) => `${index + 1}. ${result.title}\n${result.description}\nURL: ${result.url}`)
          .join('\n\n')

        const aiPrompt = `Based on the following search results for the query "${query}", provide a comprehensive summary and analysis for research purposes.

Search Results:
${searchContext}

${context ? `Research Context: ${context}` : ''}

Please provide:
1. A concise summary of the key findings
2. Identification of the most relevant and credible sources
3. Gaps or areas that might need further research
4. Recommendations for next steps

Format your response in a clear, structured manner for academic research.`

        const aiResponse = await aiService.quickQuery(aiPrompt)
        aiSummary = aiResponse.response
      }
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
      // Continue without AI summary
    }

    return {
      searchResults,
      aiSummary
    }
  }

  public async getSearchSuggestions(query: string): Promise<string[]> {
    const apiKey = this.getApiKey()
    if (!apiKey || query.length < 2) {
      return []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        count: '5'
      })

      const response = await fetch(`${this.baseUrl}/suggest?${params}`, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': apiKey
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data[1] || [] // Brave returns suggestions in the second array element
    } catch (error) {
      console.error('Failed to get search suggestions:', error)
      return []
    }
  }

  private parseSearchResponse(query: string, data: any, searchTime: number, type: string): SearchResponse {
    let results: SearchResult[] = []
    let totalResults = 0

    if (type === 'web' && data.web) {
      results = data.web.results?.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        publishedDate: item.age,
        type: 'web' as const,
        source: this.extractDomain(item.url)
      })) || []
      totalResults = data.web.totalCount || 0
    } else if (type === 'news' && data.news) {
      results = data.news.results?.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        publishedDate: item.age,
        thumbnail: item.thumbnail,
        type: 'news' as const,
        source: item.source || this.extractDomain(item.url)
      })) || []
      totalResults = data.news.totalCount || 0
    } else if (type === 'images' && data.images) {
      results = data.images.results?.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        thumbnail: {
          src: item.thumbnail?.src || item.src,
          height: item.thumbnail?.height || 0,
          width: item.thumbnail?.width || 0
        },
        type: 'images' as const,
        source: this.extractDomain(item.url)
      })) || []
      totalResults = data.images.totalCount || 0
    }

    return {
      query,
      results,
      totalResults,
      searchTime,
      suggestions: data.suggest || []
    }
  }

  private mapTimeRange(timeRange?: string): string {
    switch (timeRange) {
      case 'day': return 'pd'
      case 'week': return 'pw'
      case 'month': return 'pm'
      case 'year': return 'py'
      default: return ''
    }
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return 'Unknown'
    }
  }

  public async searchMultipleQueries(queries: string[], context?: string): Promise<{
    combinedResults: SearchResult[]
    individualResults: Record<string, SearchResponse>
    aiAnalysis?: string
  }> {
    try {
      // Execute all searches in parallel
      const searchPromises = queries.map(query => this.search(query, { type: 'web', limit: 3 }))
      const individualResults = await Promise.all(searchPromises)

      // Combine and deduplicate results
      const combinedResults: SearchResult[] = []
      const seenUrls = new Set<string>()
      const resultsMap: Record<string, SearchResponse> = {}

      queries.forEach((query, index) => {
        resultsMap[query] = individualResults[index]

        individualResults[index].results.forEach(result => {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url)
            combinedResults.push(result)
          }
        })
      })

      // Generate AI analysis if available
      let aiAnalysis: string | undefined

      try {
        const { aiService } = await import('./aiService')

        if (aiService.isEnabled()) {
          const allResultsContext = combinedResults
            .map((result, index) => `${index + 1}. ${result.title}\n${result.description}\nSource: ${result.source}\nURL: ${result.url}`)
            .join('\n\n')

          const aiPrompt = `Analyze these search results from multiple related queries: [${queries.join(', ')}]

Combined Search Results:
${allResultsContext}

${context ? `Research Context: ${context}` : ''}

Please provide:
1. A synthesis of the key themes and findings across all results
2. Identification of the most authoritative and relevant sources
3. Analysis of any conflicting information or perspectives
4. Recommendations for focused follow-up research
5. Suggested research questions based on the findings

Structure your response for academic research purposes.`

          const aiResponse = await aiService.quickQuery(aiPrompt)
          aiAnalysis = aiResponse.response
        }
      } catch (error) {
        console.error('Failed to generate AI analysis:', error)
      }

      return {
        combinedResults,
        individualResults: resultsMap,
        aiAnalysis
      }
    } catch (error: any) {
      throw new Error(`Multi-query search failed: ${error.message}`)
    }
  }
}

export const searchService = new SearchService()