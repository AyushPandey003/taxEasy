'use server';

import * as cheerio from 'cheerio';
import { cache } from 'react';
import { fetchTaxRSSFeeds } from './rss-parser';
import { fetchOpenGovTaxDeadlines, fetchTaxLawsAlternative } from './government-apis';
import { API_CONFIG, getTaxNewsQuery, getNewsApiHeaders } from '../config';

// Data types
export interface TaxDeadline {
  title: string;
  dueDate: string;
  category: string;
  description: string;
}

export interface TaxUpdate {
  title: string;
  date: string;
  source: string;
  summary: string;
  url: string;
}

export interface TaxLaw {
  title: string;
  effectiveDate: string;
  category: string;
  summary: string;
  url: string;
}

// GST specific data type
export interface GSTUpdate {
  title: string;
  date: string;
  category: string;
  summary: string;
  url: string;
}

// Cached fetchers using React cache
export const fetchTaxDeadlines = cache(async (): Promise<TaxDeadline[]> => {
  try {
    // First try to get deadlines from the more reliable Open Government Data Platform
    try {
      const openGovDeadlines = await fetchOpenGovTaxDeadlines();
      if (openGovDeadlines.length > 0) {
        console.log('Successfully fetched tax deadlines from Open Government Data:', openGovDeadlines.length);
        return openGovDeadlines;
      }
    } catch (openGovError) {
      console.error('Error fetching Open Government tax deadlines:', openGovError);
    }

    // Fall back to Income Tax Department of India if the above fails
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
    
    // Scrape the tax calendar table
    // This selector will need adjustment based on actual page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.ms-rteTable-default tr').each((i: number, elem: any) => {
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
    
    // Also fetch GST deadlines and add them
    try {
      const gstDeadlines = await fetchGSTDeadlines();
      return [...deadlines, ...gstDeadlines];
    } catch (error) {
      console.error("Error fetching GST deadlines:", error);
      return deadlines;
    }
  } catch (error) {
    console.error('Error fetching tax deadlines:', error);
    return [];
  }
});

// New function to fetch GST deadlines
export const fetchGSTDeadlines = cache(async (): Promise<TaxDeadline[]> => {
  try {
    // GST Portal
    const response = await fetch('https://www.gst.gov.in/', {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GST portal: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const deadlines: TaxDeadline[] = [];
    
    // Scrape relevant GST deadline information
    // This selector will need adjustment based on actual GST portal structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.due-dates-container tr, .calendar-section tr').each((i: number, elem: any) => {
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
    console.error('Error fetching GST deadlines:', error);
    return [];
  }
});

// Function to fetch tax updates from News API
export const fetchNewsAPiTaxUpdates = cache(async (): Promise<TaxUpdate[]> => {
  try {
    // Use the configuration from config.ts
    const query = getTaxNewsQuery();
    const apiConfig = API_CONFIG.newsApi;
    
    const url = new URL(`${apiConfig.baseUrl}${apiConfig.endpoints.everything}`);
    url.searchParams.append('q', query);
    url.searchParams.append('language', apiConfig.defaultParams.language);
    url.searchParams.append('pageSize', apiConfig.defaultParams.pageSize.toString());
    url.searchParams.append('sortBy', 'publishedAt');
    
    // Add domains to prefer Indian news sources
    const indianDomains = [
      'economictimes.indiatimes.com',
      'livemint.com',
      'business-standard.com',
      'financialexpress.com',
      'thehindubusinessline.com',
      'zeebiz.com',
      'moneycontrol.com',
      'taxscan.in',
      'taxguru.in',
      'caclubindia.com'
    ].join(',');
    
    url.searchParams.append('domains', indianDomains);
    
    const response = await fetch(url.toString(), {
      headers: getNewsApiHeaders(),
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from News API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Invalid response format from News API');
    }
    
    // Process the articles into our format
    const updates: TaxUpdate[] = data.articles.map((article: {
      title?: string;
      publishedAt?: string;
      source?: { name?: string };
      description?: string;
      url?: string;
    }) => {
      // Properly format date
      let formattedDate;
      try {
        const parsedDate = new Date(article.publishedAt || '');
        formattedDate = !isNaN(parsedDate.getTime()) 
          ? parsedDate.toLocaleDateString() 
          : 'Recently Published';
      } catch {
        formattedDate = 'Recently Published';
      }
      
      return {
        title: article.title || 'Tax Update',
        date: formattedDate,
        source: article.source?.name || 'News Source',
        summary: article.description || article.title || 'Tax related news update',
        url: article.url || ''
      };
    });
    
    // Additional filtering for Indian content
    const indianUpdates = updates.filter(update => {
      // Check if the content is related to India
      const indianKeywords = [
        'india', 'indian', 'cbdt', 'cbic', 'gst', 'income tax', 'itr', 
        'budget', 'finance ministry', 'finance minister', 'nirmala', 
        'sitharaman', 'tax department', 'revenue department'
      ];
      
      const text = (update.title + ' ' + update.summary).toLowerCase();
      return indianKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
    
    return indianUpdates.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error fetching from News API:', error);
    return [];
  }
});

export const fetchTaxUpdates = cache(async (): Promise<TaxUpdate[]> => {
  try {
    // First try to get updates from News API (most reliable and up-to-date)
    try {
      const newsApiUpdates = await fetchNewsAPiTaxUpdates();
      if (newsApiUpdates.length > 0) {
        console.log('Successfully fetched tax updates from News API:', newsApiUpdates.length);
        return newsApiUpdates;
      }
    } catch (newsApiError) {
      console.error('Error fetching from News API:', newsApiError);
    }
    
    // Fall back to RSS feeds if News API fails
    try {
      const rssUpdates = await fetchTaxRSSFeeds();
      if (rssUpdates.length > 0) {
        console.log('Successfully fetched tax updates from RSS feeds:', rssUpdates.length);
        return rssUpdates;
      }
    } catch (rssError) {
      console.error('Error fetching RSS feeds:', rssError);
    }

    // Fetch from Income Tax Department Press Releases as fallback
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
    
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.ms-listviewtable tr').each((i: number, elem: any) => {
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
    
    // Also fetch updates from Economic Times
    try {
      const newsUpdates = await fetchNewsTaxUpdates();
      return [...updates, ...newsUpdates];
    } catch (error) {
      console.error("Error fetching news updates:", error);
      return updates;
    }
  } catch (error) {
    console.error('Error fetching tax updates from Income Tax Department:', error);
    console.log('Falling back to news sources and fallback data');
    
    // Try to fetch from news sources even if the primary source fails
    try {
      const newsUpdates = await fetchNewsTaxUpdates();
      if (newsUpdates.length > 0) {
        return newsUpdates;
      }
    } catch (newsError) {
      console.error('Error fetching news updates as fallback:', newsError);
    }
    
    // Return fallback data if both attempts fail
    return await getTaxUpdatesFallback();
  }
});

// Function to fetch tax updates from news sources
export const fetchNewsTaxUpdates = cache(async (): Promise<TaxUpdate[]> => {
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
    
    // Selector will need adjustment based on actual ET page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.newslist li, .article-list .eachStory').each((i: number, elem: any) => {
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
    console.error('Error fetching news tax updates:', error);
    return [];
  }
});

export const fetchGSTUpdates = cache(async (): Promise<GSTUpdate[]> => {
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
    
    // Selector will need adjustment based on actual page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.view-content .views-row').each((i: number, elem: any) => {
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
    console.error('Error fetching GST updates:', error);
    return [];
  }
});

export const fetchTaxLaws = cache(async (): Promise<TaxLaw[]> => {
  try {
    // First try to get tax laws from a more reliable alternative source
    try {
      const alternativeLaws = await fetchTaxLawsAlternative();
      if (alternativeLaws.length > 0) {
        console.log('Successfully fetched tax laws from alternative source:', alternativeLaws.length);
        return alternativeLaws;
      }
    } catch (alternativeError) {
      console.error('Error fetching tax laws from alternative source:', alternativeError);
    }

    // Fall back to Income Tax Department of India
    const response = await fetch('https://incometaxindia.gov.in/Pages/acts/income-tax-act.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tax laws: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const laws: TaxLaw[] = [];
    
    // Selector will need adjustment based on actual page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.ms-rteTable-default tr').each((i: number, elem: any) => {
      if (i === 0) return; // Skip header row
      
      const columns = $(elem).find('td');
      const title = $(columns[0]).text().trim();
      const effectiveDate = $(columns[1]).text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title) {
        laws.push({
          title,
          effectiveDate: effectiveDate || 'Not specified',
          category: 'Income Tax',
          summary: title,
          url: link ? `https://incometaxindia.gov.in${link}` : ''
        });
      }
    });
    
    // Also try to fetch GST laws
    try {
      const gstLaws = await fetchGSTLaws();
      return [...laws, ...gstLaws];
    } catch (error) {
      console.error("Error fetching GST laws:", error);
      return laws;
    }
  } catch (error) {
    console.error('Error fetching tax laws:', error);
    return [];
  }
});

// Function to fetch GST laws
export const fetchGSTLaws = cache(async (): Promise<TaxLaw[]> => {
  try {
    // GST Acts and Rules
    const response = await fetch('https://cbic-gst.gov.in/acts-rules.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GST acts and rules: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const laws: TaxLaw[] = [];
    
    // Selector will need adjustment based on actual page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.acts-section li, .rules-section li').each((i: number, elem: any) => {
      const title = $(elem).text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title) {
        laws.push({
          title,
          effectiveDate: 'As amended',
          category: 'GST',
          summary: title,
          url: link || ''
        });
      }
    });
    
    return laws;
  } catch (error) {
    console.error('Error fetching GST laws:', error);
    return [];
  }
});

// Fallback data in case scraping fails
export async function getTaxDeadlinesFallback(): Promise<TaxDeadline[]> {
  return [
    {
      title: 'File ITR for FY 2023-24 (AY 2024-25)',
      dueDate: '31 July 2024',
      category: 'Income Tax',
      description: 'Due date for filing Income Tax Return for individuals not requiring audit'
    },
    {
      title: 'File ITR for FY 2023-24 (businesses requiring audit)',
      dueDate: '31 October 2024',
      category: 'Income Tax',
      description: 'Due date for filing Income Tax Return for businesses requiring audit'
    },
    {
      title: 'GSTR-3B Filing',
      dueDate: '20th of every month',
      category: 'GST',
      description: 'Monthly GST return filing for regular taxpayers'
    },
    {
      title: 'GSTR-1 Filing',
      dueDate: '11th of every month',
      category: 'GST',
      description: 'Monthly filing of outward supplies under GST'
    },
    {
      title: 'TDS Payment',
      dueDate: '7th of every month',
      category: 'TDS',
      description: 'Due date for depositing TDS for the previous month'
    },
    {
      title: 'Advance Tax Payment (1st Installment)',
      dueDate: '15 June 2024',
      category: 'Income Tax',
      description: '15% of total advance tax liability'
    }
  ];
}

export async function getTaxUpdatesFallback(): Promise<TaxUpdate[]> {
  return [
    {
      title: 'FM must rethink',
      date: '5/3/2010',
      source: 'Economic Times',
      summary: 'TT Ram Mohan has rightly suggested that the tax-GDP ratio measures structural improvement. The FM must rethink his medium-term debtto-GDP target.',
      url: 'https://economictimes.indiatimes.com/news/economy/finance/fm-must-rethink'
    },
    {
      title: 'Why you should save tax on education loans',
      date: 'Recently Published',
      source: 'Mint',
      summary: 'Learn about tax-saving benefits available on education loans and how they can help reduce your tax liability.',
      url: 'https://www.livemint.com/money/tax-education-loans'
    },
    {
      title: '5 key income tax provisions every Indian taxpayer should know',
      date: 'Recently Published',
      source: 'Mint',
      summary: 'Important income tax provisions that all Indian taxpayers should be aware of to optimize their tax planning.',
      url: 'https://www.livemint.com/money/key-income-tax-provisions'
    },
    {
      title: 'New Income Tax Regime Changes for FY 2024-25',
      date: '1 April 2024',
      source: 'Ministry of Finance',
      summary: 'Changes to tax slabs and deductions under the new tax regime effective from FY 2024-25',
      url: 'https://incometaxindia.gov.in/news/new-tax-regime-fy-2024-25.html'
    },
    {
      title: 'Extension of Due Date for ITR Filing',
      date: '15 June 2024',
      source: 'CBDT',
      summary: 'The Central Board of Direct Taxes extends the due date for filing Income Tax Returns for AY 2024-25',
      url: 'https://incometaxindia.gov.in/news/due-date-extension-june-2024.html'
    },
    {
      title: 'GST Council Recommendations in 52nd Meeting',
      date: '10 May 2024',
      source: 'GST Council',
      summary: 'Key decisions on rate rationalization and procedural simplifications',
      url: 'https://gst.gov.in/newsroom/52nd-gst-council-meeting.html'
    }
  ];
}

export async function getTaxLawsFallback(): Promise<TaxLaw[]> {
  return [
    {
      title: 'Finance Act 2024',
      effectiveDate: '1 April 2024',
      category: 'Income Tax',
      summary: 'Annual Finance Act implementing the budget proposals for FY 2024-25',
      url: 'https://incometaxindia.gov.in/acts/finance-act-2024.html'
    },
    {
      title: 'CGST (Amendment) Act, 2023',
      effectiveDate: '1 January 2024',
      category: 'GST',
      summary: 'Amendments to Central Goods and Services Tax Act',
      url: 'https://gst.gov.in/acts/cgst-amendment-2023.html'
    },
    {
      title: 'Income Tax (32nd Amendment) Rules, 2024',
      effectiveDate: '1 March 2024',
      category: 'Income Tax',
      summary: 'Amendments to Income Tax Rules regarding TDS provisions',
      url: 'https://incometaxindia.gov.in/rules/it-32-amendment-rules-2024.html'
    },
    {
      title: 'IGST (Amendment) Rules, 2024',
      effectiveDate: '1 April 2024',
      category: 'GST',
      summary: 'Amendments to Integrated Goods and Services Tax Rules',
      url: 'https://gst.gov.in/rules/igst-amendment-2024.html'
    }
  ];
}

// Helper function to fetch all types of GST notifications
export const fetchAllGSTNotifications = cache(async (): Promise<GSTUpdate[]> => {
  try {
    const response = await fetch('https://cbic-gst.gov.in/gst-notifications.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GST notifications: ${response.status}`);
    }
    
    const data = await response.text();
    const $ = cheerio.load(data);
    
    const updates: GSTUpdate[] = [];
    
    // Selector will need adjustment based on actual page structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.notification-container tr, .notification-table tr, table tr').each((i: number, elem: any) => {
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
          category: 'GST',
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
}); 