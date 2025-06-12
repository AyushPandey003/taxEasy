'use server';

import { TaxUpdate } from '../scraper';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';

// Server action to fetch Income Tax Department Notifications
export async function fetchIncomeTaxNotifications(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://incometaxindia.gov.in/pages/communications/notifications.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // Parse the table structure
    $('.ms-listviewtable tr, .WebPartList tr').each((i, elem) => {
      if (i === 0) return; // Skip header row

      const titleElem = $(elem).find('td:nth-child(1), .notification-title');
      const dateElem = $(elem).find('td:nth-child(2), .notification-date');
      const linkElem = $(elem).find('a');

      const title = titleElem.text().trim();
      const date = dateElem.text().trim();
      const link = linkElem.attr('href') || '';

      if (title) {
        updates.push({
          title,
          date: date || new Date().toLocaleDateString(),
          source: 'Income Tax Department (Notifications)',
          summary: title,
          url: link.startsWith('http') ? link : `https://incometaxindia.gov.in${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching Income Tax notifications:', error);
    return [];
  }
}

// Server action to fetch Income Tax Department Circulars
export async function fetchIncomeTaxCirculars(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://incometaxindia.gov.in/pages/communications/circulars.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch circulars: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // Similar structure expected as notifications
    $('.ms-listviewtable tr, .WebPartList tr').each((i, elem) => {
      if (i === 0) return; // Skip header row

      const titleElem = $(elem).find('td:nth-child(1), .circular-title');
      const dateElem = $(elem).find('td:nth-child(2), .circular-date');
      const linkElem = $(elem).find('a');

      const title = titleElem.text().trim();
      const date = dateElem.text().trim();
      const link = linkElem.attr('href') || '';

      if (title) {
        updates.push({
          title,
          date: date || new Date().toLocaleDateString(),
          source: 'Income Tax Department (Circulars)',
          summary: title,
          url: link.startsWith('http') ? link : `https://incometaxindia.gov.in${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching Income Tax circulars:', error);
    return [];
  }
}

// Server action to fetch GST Notifications
export async function fetchGSTNotifications(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://cbic-gst.gov.in/gst-notifications.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GST notifications: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // GST notifications are in tables
    $('.notification-container tr, .notification-table tr, table tr').each((i, elem) => {
      if (i === 0) return; // Skip header row

      const columns = $(elem).find('td');
      const titleElem = columns.eq(1) || columns.first();
      const dateElem = columns.eq(2) || columns.eq(0);
      const linkElem = $(elem).find('a');

      const title = titleElem.text().trim();
      const date = dateElem.text().trim();
      const link = linkElem.attr('href') || '';

      if (title) {
        updates.push({
          title,
          date: date || new Date().toLocaleDateString(),
          source: 'CBIC (GST Notifications)',
          summary: title,
          url: link.startsWith('http') ? link : `https://cbic-gst.gov.in/${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching GST notifications:', error);
    return [];
  }
}

// Server action to fetch from News API
export async function fetchNewsAPI(): Promise<TaxUpdate[] | NextResponse> {
  // Rate limit first using global key
  const rateLimitResult = await rateLimit('newsApi');
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.warn('NEWS_API_KEY not found in environment variables');
    return [];
  }
  
  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.append('q', 'income+tax+india+OR+section+80C+OR+GST+india');
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('language', 'en');
    url.searchParams.append('domains', 'economictimes.indiatimes.com,livemint.com,business-standard.com');
    url.searchParams.append('pageSize', '10');
    url.searchParams.append('sortBy', 'publishedAt');
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'ok' && data.articles) {
      return data.articles.map((article: NewsApiArticle) => ({
        title: article.title,
        date: new Date(article.publishedAt).toLocaleDateString(),
        source: article.source?.name || 'News API',
        summary: article.description || article.title,
        url: article.url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from News API:', error);
    return [];
  }
}

// Server action to fetch from GNews API
export async function fetchGNews(): Promise<TaxUpdate[] | NextResponse> {
  // Rate limit first using global key
  const rateLimitResult = await rateLimit('newsApi');
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const apiKey = process.env.GNEWS_API_KEY;
  
  if (!apiKey) {
    console.warn('GNEWS_API_KEY not found in environment variables');
    return [];
  }
  
  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.append('q', 'tax');
    url.searchParams.append('lang', 'en');
    url.searchParams.append('country', 'in');
    url.searchParams.append('token', apiKey);
    url.searchParams.append('max', '10');
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.articles) {
      return data.articles.map((article: NewsApiArticle) => ({
        title: article.title,
        date: new Date(article.publishedAt).toLocaleDateString(),
        source: article.source?.name || 'GNews API',
        summary: article.description || article.title,
        url: article.url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from GNews API:', error);
    return [];
  }
}

// Server action to fetch Economic Times (ET Wealth)
export async function fetchETWealth(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://economictimes.indiatimes.com/wealth', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 14400 } // Cache for 4 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ET Wealth: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // ET Wealth articles
    $('.tabdata .story-box, .eachStory, article').each((i, elem) => {
      const titleElem = $(elem).find('h3, .story-title, .title');
      const title = titleElem.text().trim();
      const link = $(elem).find('a').attr('href') || '';
      
      const dateElem = $(elem).find('.date-format, .date-time, .date');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();

      // Filter for tax-related articles
      const taxKeywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance'];
      const isTaxRelated = taxKeywords.some(keyword => title.toLowerCase().includes(keyword));
      
      if (title && isTaxRelated) {
        updates.push({
          title,
          date,
          source: 'Economic Times (ET Wealth)',
          summary: title,
          url: link.startsWith('http') ? link : `https://economictimes.indiatimes.com${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching from ET Wealth:', error);
    return [];
  }
}

// Server action to fetch LiveMint personal finance section
export async function fetchLiveMint(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://www.livemint.com/money/personal-finance', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 14400 } // Cache for 4 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LiveMint: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // LiveMint articles
    $('.storylist li, .article-list .listtostory, article').each((i, elem) => {
      const titleElem = $(elem).find('h2, .headline, .title');
      const title = titleElem.text().trim();
      const link = $(elem).find('a').attr('href') || '';
      
      const dateElem = $(elem).find('.dateline, .date-time, .date');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();

      // Filter for tax-related articles
      const taxKeywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance'];
      const isTaxRelated = taxKeywords.some(keyword => title.toLowerCase().includes(keyword));
      
      if (title && isTaxRelated) {
        updates.push({
          title,
          date,
          source: 'LiveMint (Personal Finance)',
          summary: title,
          url: link.startsWith('http') ? link : `https://www.livemint.com${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching from LiveMint:', error);
    return [];
  }
}

// Server action to fetch LiveMint RSS feed
export async function fetchLiveMintRSS(): Promise<TaxUpdate[]> {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL('https://www.livemint.com/rss/money.xml');
    
    const updates: TaxUpdate[] = [];
    
    for (const item of feed.items || []) {
      // Filter for tax-related articles
      const taxKeywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance'];
      const title = item.title || '';
      const isTaxRelated = taxKeywords.some(keyword => title.toLowerCase().includes(keyword));
      
      if (isTaxRelated) {
        updates.push({
          title,
          date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : new Date().toLocaleDateString(),
          source: 'LiveMint RSS (Money)',
          summary: item.contentSnippet || title,
          url: item.link || ''
        });
      }
    }
    
    return updates;
  } catch (error) {
    console.error('Error fetching LiveMint RSS:', error);
    return [];
  }
}

// Server action to fetch ClearTax Blog
export async function fetchClearTaxBlog(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://cleartax.in/s/all', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ClearTax Blog: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const updates: TaxUpdate[] = [];

    // ClearTax blog articles
    $('.blog-post, .article, .post-card').each((i, elem) => {
      const titleElem = $(elem).find('h2, .post-title, .title');
      const title = titleElem.text().trim();
      const link = $(elem).find('a').attr('href') || '';
      
      const dateElem = $(elem).find('.post-date, .date, .timestamp');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();

      // Filter for tax-related articles
      const taxKeywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance'];
      const isTaxRelated = taxKeywords.some(keyword => title.toLowerCase().includes(keyword));
      
      if (title && isTaxRelated) {
        updates.push({
          title,
          date,
          source: 'ClearTax Blog',
          summary: title,
          url: link.startsWith('http') ? link : `https://cleartax.in${link}`
        });
      }
    });

    return updates;
  } catch (error) {
    console.error('Error fetching from ClearTax Blog:', error);
    return [];
  }
}

// Master server action to fetch all tax updates
export async function fetchAllTaxUpdates(): Promise<TaxUpdate[] | NextResponse> {
  try {
    const promiseResults = await Promise.allSettled([
      fetchIncomeTaxNotifications(),
      fetchIncomeTaxCirculars(),
      fetchGSTNotifications(),
      fetchNewsAPI(),
      fetchGNews(),
      fetchETWealth(),
      fetchLiveMint(),
      fetchLiveMintRSS(),
      fetchClearTaxBlog(),
    ]);

    const allUpdates: TaxUpdate[] = [];
    for (const result of promiseResults) {
      if (result.status === 'fulfilled') {
        if (result.value instanceof NextResponse) {
          return result.value;
        }
        if (Array.isArray(result.value)) {
          allUpdates.push(...result.value);
        }
      } else if (result.status === 'rejected') {
        console.error('Error fetching a tax update source:', result.reason);
      }
    }

    const uniqueUpdates = allUpdates.filter((update, index, self) =>
      index === self.findIndex(u => u.title === update.title)
    );
    uniqueUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return uniqueUpdates;

  } catch (error) {
    console.error('Error in fetchAllTaxUpdates:', error);
    if (error instanceof NextResponse) {
        return error;
    }
    return [];
  }
}

// API response interfaces
interface NewsApiArticle {
  title: string;  publishedAt: string;  description?: string;  url: string;  source?: {    name: string;  };
}
