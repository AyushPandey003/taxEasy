'use server';

import * as cheerio from 'cheerio';
import { revalidatePath } from 'next/cache';

// Define interfaces for our data types
interface TaxDeadline {
  title: string;
  dueDate: string;
  category: string;
  description: string;
}

interface TaxUpdate {
  title: string;
  date: string;
  source: string;
  summary: string;
  url: string;
}

interface GSTUpdate {
  title: string;
  date: string;
  category: string;
  summary: string;
  url: string;
}

// Function to scrape Income Tax Department deadlines
async function scrapeDeadlines(): Promise<TaxDeadline[]> {
  try {
    // Income Tax Department of India
    const response = await fetch('https://incometaxindia.gov.in/Pages/tax-services/check-your-tax-calendar.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://incometaxindia.gov.in/',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tax calendar: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const deadlines: TaxDeadline[] = [];
    
    // Scrape the tax calendar table (selectors will need adjustment)
    $('.ms-rteTable-default tr').each((i, elem) => {
      if (i === 0) return; // Skip header row
      
      const columns = $(elem).find('td');
      if (columns.length >= 3) {
        deadlines.push({
          title: $(columns[0]).text().trim(),
          dueDate: $(columns[1]).text().trim(),
          category: 'Income Tax',
          description: $(columns[2]).text().trim()
        });
      }
    });
    
    // Also add GST deadlines
    const gstDeadlines = await scrapeGSTDeadlines();
    return [...deadlines, ...gstDeadlines];
  } catch (error) {
    console.error('Error scraping Income Tax deadlines:', error);
    console.log('Proceeding with GST deadlines only');
    
    // If Income Tax website fails, still try to get GST deadlines
    try {
      return await scrapeGSTDeadlines();
    } catch (gstError) {
      console.error('Error scraping GST deadlines as fallback:', gstError);
      return [];
    }
  }
}

// Function to scrape GST deadlines
async function scrapeGSTDeadlines(): Promise<TaxDeadline[]> {
  try {
    // GST Portal
    const response = await fetch('https://www.gst.gov.in/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GST portal: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const deadlines: TaxDeadline[] = [];
    
    // Scrape GST deadline information (selectors will need adjustment)
    $('.due-dates-container tr, .calendar-section tr').each((i, elem) => {
      if (i === 0) return; // Skip header row
      
      const columns = $(elem).find('td');
      if (columns.length >= 2) {
        const title = $(columns[0]).text().trim();
        const dueDate = $(columns[1]).text().trim();
        
        if (title && dueDate) {
          deadlines.push({
            title,
            dueDate,
            category: 'GST',
            description: `Due date for ${title}`
          });
        }
      }
    });
    
    return deadlines;
  } catch (error) {
    console.error('Error scraping GST deadlines:', error);
    return [];
  }
}

// Function to scrape tax updates
async function scrapeUpdates(): Promise<TaxUpdate[]> {
  try {
    // Income Tax Department Press Releases
    const response = await fetch('https://incometaxindia.gov.in/Lists/Press%20Releases/AllItems.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://incometaxindia.gov.in/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch press releases: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const updates: TaxUpdate[] = [];
    
    // Selectors will need adjustment
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
    
    // Also add updates from news sources
    const newsUpdates = await scrapeNewsTaxUpdates();
    return [...updates, ...newsUpdates];
  } catch (error) {
    console.error('Error scraping Income Tax updates:', error);
    console.log('Falling back to news sources');
    
    // If Income Tax website fails, still try to get news updates
    try {
      return await scrapeNewsTaxUpdates();
    } catch (newsError) {
      console.error('Error scraping news updates as fallback:', newsError);
      return [];
    }
  }
}

// Function to scrape tax updates from news sources
async function scrapeNewsTaxUpdates(): Promise<TaxUpdate[]> {
  try {
    // Economic Times Tax section
    const response = await fetch('https://economictimes.indiatimes.com/wealth/tax', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ET tax section: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const updates: TaxUpdate[] = [];
    
    // Selectors will need adjustment
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
          source: 'Economic Times',
          summary: title,
          url: link.startsWith('http') ? link : `https://economictimes.indiatimes.com${link}`
        });
      }
    });
    
    return updates;
  } catch (error) {
    console.error('Error scraping news tax updates:', error);
    return [];
  }
}

// Function to scrape GST updates
async function scrapeGSTUpdates(): Promise<GSTUpdate[]> {
  try {
    // GST Council website
    const response = await fetch('https://gstcouncil.gov.in/meetings', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GST council meetings: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const updates: GSTUpdate[] = [];
    
    // Selectors will need adjustment
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

// Server action to update all tax data and revalidate pages
export async function updateTaxData() {
  try {
    // Concurrently fetch all data types
    const [deadlines, updates, gstUpdates] = await Promise.all([
      scrapeDeadlines(),
      scrapeUpdates(),
      scrapeGSTUpdates()
    ]);
    
    // Store this data to your database or elsewhere
    // For now, we just log it
    console.log(`Fetched ${deadlines.length} tax deadlines`);
    console.log(`Fetched ${updates.length} tax updates`);
    console.log(`Fetched ${gstUpdates.length} GST updates`);
    
    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/taxes');
    revalidatePath('/updates');
    
    return { success: true, message: 'Tax data successfully updated' };
  } catch (error) {
    console.error('Error updating tax data:', error);
    return { success: false, message: 'Failed to update tax data' };
  }
} 
