'use server';

import * as cheerio from 'cheerio';
import { TaxUpdate, GSTUpdate } from '../../lib/scraper';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';

/**
 * This file contains server actions for scraping tax data from various sources
 * It replaces the previous axios-based approach with modern Next.js server actions
 */

// ----- Income Tax Department Sources -----

// Income Tax Department Press Releases
export async function scrapeIncomeTaxPressReleases(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://incometaxindia.gov.in/Lists/Press%20Releases/AllItems.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://incometaxindia.gov.in/',
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    $('.ms-listviewtable tr').each((i, elem) => {
      if (i === 0) return; // Skip header row
      
      const title = $(elem).find('td:nth-child(1)').text().trim();
      const date = $(elem).find('td:nth-child(2)').text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title && date) {
        updates.push({
          title,
          date,
          source: 'Income Tax Department',
          summary: title,
          url: link ? `https://incometaxindia.gov.in${link}` : ''
        });
      }
    });
    
    return updates;
  } catch (error) {
    console.error('Error scraping Income Tax press releases:', error);
    return [];
  }
}

// Income Tax Department Notifications
export async function scrapeIncomeTaxNotifications(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://incometaxindia.gov.in/pages/communications/notifications.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
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
    console.error('Error scraping Income Tax notifications:', error);
    return [];
  }
}

// Income Tax Department Circulars
export async function scrapeIncomeTaxCirculars(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://incometaxindia.gov.in/Pages/communications/circulars.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
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
    console.error('Error scraping Income Tax circulars:', error);
    return [];
  }
}

// ----- GST Sources -----

// GST Council/CBIC Website
export async function scrapeGSTUpdates(): Promise<GSTUpdate[]> {
  try {
    const response = await fetch('https://gstcouncil.gov.in/meetings', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: GSTUpdate[] = [];
    
    $('.view-content .views-row').each((i, elem) => {
      const title = $(elem).find('.views-field-title').text().trim();
      const date = $(elem).find('.views-field-field-date').text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title) {
        updates.push({
          title,
          date: date || 'Recent',
          category: 'GST Council',
          summary: `GST Council Meeting: ${title}`,
          url: link ? `https://gstcouncil.gov.in${link}` : ''
        });
      }
    });
    
    return updates;
  } catch (error) {
    console.error('Error scraping GST updates:', error);
    return [];
  }
}

// CBIC Website Circulars
export async function scrapeCBICCirculars(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://cbic-gst.gov.in/gst-goods-services-rates.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    // CBIC often uses tables for their circulars
    $('.table-responsive table tr, .circular-table tr').each((i, elem) => {
      if (i === 0) return; // Skip header row
      
      const title = $(elem).find('td:nth-child(2)').text().trim();
      const date = $(elem).find('td:nth-child(1), td:nth-child(3)').text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title) {
        updates.push({
          title,
          date: date || new Date().toLocaleDateString(),
          source: 'CBIC (GST)',
          summary: title,
          url: link ? (link.startsWith('http') ? link : `https://cbic-gst.gov.in${link}`) : ''
        });
      }
    });
    
    return updates;
  } catch (error) {
    console.error('Error scraping CBIC circulars:', error);
    return [];
  }
}

// ----- News Sources -----

// Economic Times (ET Wealth)
export async function scrapeETWealth(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://economictimes.indiatimes.com/wealth/tax', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    $('.newslist li, .article-list .eachStory').each((i, elem) => {
      const titleElem = $(elem).find('h3, .title');
      const title = titleElem.text().trim();
      const link = titleElem.find('a').attr('href') || '';
      const dateElem = $(elem).find('.date-format, .date');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();
      
      if (title) {
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
    console.error('Error scraping ET Wealth:', error);
    return [];
  }
}

// LiveMint
export async function scrapeLiveMint(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://www.livemint.com/money/personal-finance', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    // Tax related articles from LiveMint
    $('.article-box, .feedStory, .story-list li').each((i, elem) => {
      const titleElem = $(elem).find('h2, h3, .headline');
      const title = titleElem.text().trim();
      const link = $(elem).find('a').attr('href') || '';
      
      // Extract date if available, otherwise use current date
      const dateElem = $(elem).find('.dateline, .date');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();
      
      // Only include tax-related articles
      const taxKeywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance'];
      const isTaxRelated = taxKeywords.some(keyword => title.toLowerCase().includes(keyword));
      
      if (title && isTaxRelated) {
        updates.push({
          title,
          date,
          source: 'LiveMint',
          summary: title,
          url: link.startsWith('http') ? link : `https://www.livemint.com${link}`
        });
      }
    });
    
    return updates;
  } catch (error) {
    console.error('Error scraping LiveMint:', error);
    return [];
  }
}

// ClearTax Blog
export async function scrapeClearTaxBlog(): Promise<TaxUpdate[]> {
  try {
    const response = await fetch('https://cleartax.in/s/all', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    $('.blog-post, .article, .post-card').each((i, elem) => {
      const titleElem = $(elem).find('h2, .post-title, .title');
      const title = titleElem.text().trim();
      const link = $(elem).find('a').attr('href') || '';
      
      // Extract date if available, otherwise use current date
      const dateElem = $(elem).find('.post-date, .date, .timestamp');
      const date = dateElem.text().trim() || new Date().toLocaleDateString();
      
      // Only include tax-related articles
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
    console.error('Error scraping ClearTax Blog:', error);
    return [];
  }
}

// ----- API Integrations -----

// News API Interface
interface NewsApiArticle {
  title: string;
  publishedAt: string;
  description?: string;
  url: string;
  source: {
    name: string;
  };
}

// News API Integration
export async function fetchNewsAPI(): Promise<TaxUpdate[] | NextResponse> {
  try {
    // Rate limit first using global key due to linter issues with headers()
    const rateLimitResult = await rateLimit('newsApi');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // Note: You need a News API key stored in environment variables
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      console.error('NEWS_API_KEY not found in environment variables');
      return [];
    }
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=income+tax+india+OR+gst+india&language=en&sortBy=publishedAt&apiKey=${API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    
    const data = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid response from News API:', data);
      return [];
    }
    
    const updates: TaxUpdate[] = data.articles.slice(0, 15).map((article: NewsApiArticle) => ({
      title: article.title,
      date: new Date(article.publishedAt).toLocaleDateString(),
      source: `${article.source.name} (News API)`,
      summary: article.description || article.title,
      url: article.url
    }));
    
    return updates;
  } catch (error) {
    console.error('Error fetching from News API:', error);
    return [];
  }
}

// GNews API Interface
interface GNewsApiArticle {
  title: string;
  publishedAt: string;
  description?: string;
  url: string;
  source: {
    name: string;
  };
}

// GNews API Integration
export async function fetchGNewsAPI(): Promise<TaxUpdate[] | NextResponse> {
  try {
    // Rate limit first using global key due to linter issues with headers()
    const rateLimitResult = await rateLimit('newsApi'); // Using 'newsApi' type for GNews too
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // Note: You need a GNews API key stored in environment variables
    const API_KEY = process.env.GNEWS_API_KEY;
    
    if (!API_KEY) {
      console.error('GNEWS_API_KEY not found in environment variables');
      return [];
    }
    
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=income+tax+india+OR+gst+india&lang=en&country=in&max=10&apikey=${API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    
    const data = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid response from GNews API:', data);
      return [];
    }
    
    const updates: TaxUpdate[] = data.articles.map((article: GNewsApiArticle) => ({
      title: article.title,
      date: new Date(article.publishedAt).toLocaleDateString(),
      source: `${article.source.name} (GNews API)`,
      summary: article.description || article.title,
      url: article.url
    }));
    
    return updates;
  } catch (error) {
    console.error('Error fetching from GNews API:', error);
    return [];
  }
}

// ----- RSS Feeds -----

// Parse an RSS feed and convert to TaxUpdate format
async function parseRSSFeed(url: string, sourceName: string): Promise<TaxUpdate[]> {
  try {
    const response = await fetch(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });
    
    const xml = await response.text();
    
    // Simple regex-based parser that works in both browser and Node.js
    // Extract items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const itemMatches = [...xml.matchAll(itemRegex)];
    
    const updates: TaxUpdate[] = [];
    
    for (const match of itemMatches) {
      const itemXml = match[0];
      
      // Extract title
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : '';
      
      // Extract link
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1] : '';
      
      // Extract publication date
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      const pubDate = pubDateMatch ? pubDateMatch[1] : '';
      
      // Extract description
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
      let description = descMatch ? descMatch[1] : '';
      
      // Clean up description (remove HTML tags)
      description = description.replace(/<[^>]*>/g, '');
      
      if (title) {
        updates.push({
          title,
          date: pubDate ? new Date(pubDate).toLocaleDateString() : new Date().toLocaleDateString(),
          source: sourceName,
          summary: description || title,
          url: link
        });
      }
    }
    
    return updates;
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
}

// Fetch all RSS feeds
export async function fetchAllRSSFeeds(): Promise<TaxUpdate[]> {
  try {
    const rssSources = [
      { url: 'https://economictimes.indiatimes.com/wealth/tax/rssfeeds/1052732854.cms', name: 'Economic Times (RSS)' },
      { url: 'https://www.livemint.com/rss/money', name: 'LiveMint (RSS)' },
      // Add more RSS feeds as needed
    ];
    
    const promises = rssSources.map(source => parseRSSFeed(source.url, source.name));
    const results = await Promise.all(promises);
    
    return results.flat();
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return [];
  }
}

// Main function to fetch all tax updates from all sources
export async function fetchAllTaxUpdates(): Promise<TaxUpdate[] | NextResponse> {
  try {
    const promiseResults = await Promise.allSettled([
      scrapeIncomeTaxPressReleases(),
      scrapeIncomeTaxNotifications(),
      scrapeIncomeTaxCirculars(),
      scrapeETWealth(),
      scrapeLiveMint(),
      scrapeClearTaxBlog(),
      fetchNewsAPI(), 
      fetchGNewsAPI(),
      fetchAllRSSFeeds()
    ]);
    
    const allUpdates: TaxUpdate[] = [];
    
    for (const result of promiseResults) {
      if (result.status === 'fulfilled') {
        if (result.value instanceof NextResponse) {
          // If any source is rate-limited, return the rate limit response immediately
          return result.value;
        }
        // Functions like fetchAllRSSFeeds still return TaxUpdate[] directly or other scrapers.
        // NewsAPI/GNewsAPI will return TaxUpdate[] if not rate limited.
        if (Array.isArray(result.value)) {
            allUpdates.push(...result.value);
        }
      } else if (result.status === 'rejected') {
        // Log rejected promises but continue processing others
        console.error('A data source failed:', result.reason);
      }
    }
    
    // Deduplicate by title
    const uniqueUpdates = allUpdates.filter((update, index, self) => 
      index === self.findIndex(u => u.title === update.title)
    );
    
    // Sort by date (newest first)
    uniqueUpdates.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Revalidate the updates page
    revalidatePath('/updates');
    
    return uniqueUpdates;
  } catch (error) {
    console.error('Error fetching all tax updates:', error);
    return [];
  }
}

// Main function to fetch all GST updates
export async function fetchAllGSTUpdates(): Promise<GSTUpdate[]> {
  try {
    const [gstCouncil, cbicCirculars] = await Promise.allSettled([
      scrapeGSTUpdates(),
      scrapeCBICCirculars() as Promise<TaxUpdate[]>
    ]);
    
    const allUpdates: GSTUpdate[] = [];
    
    if (gstCouncil.status === 'fulfilled') {
      allUpdates.push(...gstCouncil.value);
    }
    
    if (cbicCirculars.status === 'fulfilled') {
      // Convert TaxUpdate to GSTUpdate format
      const convertedUpdates = cbicCirculars.value.map((update: TaxUpdate) => ({
        title: update.title,
        date: update.date,
        category: 'CBIC Circular',
        summary: update.summary,
        url: update.url
      }));
      
      allUpdates.push(...convertedUpdates);
    }
    
    // Revalidate the updates page
    revalidatePath('/updates');
    
    return allUpdates;
  } catch (error) {
    console.error('Error fetching all GST updates:', error);
    return [];
  }
} 