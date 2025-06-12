/**
 * Application configuration settings
 */

export const API_CONFIG = {
  // News API configuration
  newsApi: {
    apiKey: process.env.NEWS_API_KEY || 'demo',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
      everything: '/everything',
      topHeadlines: '/top-headlines'
    },
    defaultParams: {
      country: 'in',
      language: 'en',
      pageSize: 10
    }
  },
  
  // Gemini API configuration
  geminiApi: {
    apiKey: process.env.GEMINI_API_KEY || '',
    maxTokens: 2048
  }
};

/**
 * Get a query string for News API tax updates
 * @returns A formatted query string
 */
export function getTaxNewsQuery(): string {
  // Return a well-formatted query specifically focused on Indian tax news
  return '(tax OR taxation OR "income tax" OR gst) AND (india OR "indian government" OR cbdt OR cbic OR "finance ministry" OR "tax department" OR "revenue department" OR "finance minister" OR "budget india")';
}

/**
 * Get news API headers with authentication
 * @returns Headers object with API key
 */
export function getNewsApiHeaders(): HeadersInit {
  return {
    'X-Api-Key': API_CONFIG.newsApi.apiKey,
    'Content-Type': 'application/json'
  };
} 