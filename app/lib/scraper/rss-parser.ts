'use server';

import { TaxUpdate } from './index';

/**
 * Parses an RSS feed XML into a simplified JSON structure
 * @param xml - The RSS feed XML content
 * @returns Array of parsed items
 */
function parseRSS(xml: string) {
  const items: {
    title: string;
    link: string;
    pubDate: string;
    description: string;
  }[] = [];
  
  // Simple regex-based parser that works in both browser and Node.js
  // Extract items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const itemMatches = xml.match(itemRegex) || [];
  
  for (const itemXml of itemMatches) {
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
    // Use a non-s flag version for better compatibility
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
    let description = descMatch ? descMatch[1] : '';
    
    // Clean up description (remove HTML tags)
    description = description.replace(/<[^>]*>/g, '');
    
    items.push({
      title,
      link,
      pubDate,
      description
    });
  }
  
  return items;
}

/**
 * Fetches tax updates from RSS feeds of financial news sites
 * This is a more reliable alternative to scraping websites directly
 */
export async function fetchTaxRSSFeeds(): Promise<TaxUpdate[]> {
  const rssSources = [
    {
      url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms',
      source: 'Economic Times'
    },
    {
      url: 'https://www.business-standard.com/rss/latest.rss',
      source: 'Business Standard'
    },
    {
      url: 'https://www.livemint.com/rss/money',
      source: 'Mint'
    }
  ];
  
  const updates: TaxUpdate[] = [];
  
  // Create an array of promises for all RSS feeds
  const promises = rssSources.map(async (rssSource) => {
    try {
      const response = await fetch(rssSource.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS from ${rssSource.source}: ${response.status}`);
      }
      
      const data = await response.text();
      const rssItems = parseRSS(data);
      
      // Filter for tax-related items only
      const taxRelatedItems = rssItems.filter(item => {
        const keywords = ['tax', 'gst', 'income tax', 'itr', 'cbdt', 'cbic', 'tds', 'finance ministry'];
        const text = (item.title + ' ' + item.description).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      });
      
      // Convert to our TaxUpdate format
      const taxUpdates = taxRelatedItems.map(item => {
        // Properly handle date parsing with fallback
        let formattedDate;
        try {
          const parsedDate = new Date(item.pubDate);
          formattedDate = !isNaN(parsedDate.getTime()) 
            ? parsedDate.toLocaleDateString() 
            : new Date().toLocaleDateString();
        } catch {
          formattedDate = new Date().toLocaleDateString();
        }
        
        return {
          title: item.title,
          date: formattedDate,
          source: rssSource.source,
          summary: item.description.substring(0, 200) + (item.description.length > 200 ? '...' : ''),
          url: item.link
        };
      });
      
      updates.push(...taxUpdates);
    } catch (error) {
      console.error(`Error fetching RSS feed from ${rssSource.source}:`, error);
    }
  });
  
  // Wait for all promises to settle (even if some fail)
  await Promise.allSettled(promises);
  
  return updates;
} 