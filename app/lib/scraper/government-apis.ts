'use server';

import { TaxDeadline, TaxLaw } from './index';

/**
 * This file contains functions to fetch tax data from alternative sources
 * when the main government websites are unavailable
 */

/**
 * Fetch tax deadlines from data.gov.in Open Government Data Platform
 * A more reliable alternative to scraping the tax department website
 */
export async function fetchOpenGovTaxDeadlines(): Promise<TaxDeadline[]> {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    // If API key is missing, return simulated deadlines immediately
    if (!apiKey) {
      console.warn('DATA_GOV_API_KEY not found in environment variables, using simulated data');
      return generateSimulatedDeadlines();
    }

    // Try to use the data.gov.in API if available
    // Note: Replace this URL with the actual data.gov.in API endpoint for tax deadlines if available
    const url = new URL('https://api.data.gov.in/resource/tax-deadlines');
    url.searchParams.append('api-key', apiKey);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '100');
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from data.gov.in: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.records) {
      return data.records.map((record: {
        title?: string;
        due_date?: string;
        category?: string;
        description?: string;
      }) => ({
        title: record.title || 'Tax Deadline',
        dueDate: record.due_date || 'Upcoming',
        category: record.category || 'Tax',
        description: record.description || 'Important tax deadline'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tax deadlines from Open Government Data Platform:', error);
    
    // If API is not available or fails, return simulated deadlines
    // based on the current date and known tax deadlines
    return generateSimulatedDeadlines();
  }
}

/**
 * Generate simulated tax deadlines based on known tax filing deadlines
 * Used as a fallback when all other sources fail
 */
function generateSimulatedDeadlines(): TaxDeadline[] {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;
  const prevYear = currentYear - 1;
  
  // Create deadlines based on standard Indian tax deadlines
  return [
    // Income Tax deadlines
    {
      title: `File ITR for FY ${prevYear}-${currentYear} (individuals)`,
      dueDate: `31 July ${currentYear}`,
      category: 'Income Tax',
      description: 'Due date for filing Income Tax Return for individuals not requiring audit'
    },
    {
      title: `File ITR for FY ${prevYear}-${currentYear} (businesses with audit)`,
      dueDate: `31 October ${currentYear}`,
      category: 'Income Tax',
      description: 'Due date for filing Income Tax Return for businesses requiring audit'
    },
    {
      title: 'Advance Tax Payment (1st Installment)',
      dueDate: `15 June ${currentYear}`,
      category: 'Income Tax',
      description: '15% of total advance tax liability'
    },
    {
      title: 'Advance Tax Payment (2nd Installment)',
      dueDate: `15 September ${currentYear}`,
      category: 'Income Tax',
      description: '45% of total advance tax liability'
    },
    {
      title: 'Advance Tax Payment (3rd Installment)',
      dueDate: `15 December ${currentYear}`,
      category: 'Income Tax',
      description: '75% of total advance tax liability'
    },
    {
      title: 'Advance Tax Payment (4th Installment)',
      dueDate: `15 March ${nextYear}`,
      category: 'Income Tax',
      description: '100% of total advance tax liability'
    },
    
    // GST deadlines
    {
      title: 'GSTR-1 Filing (Monthly)',
      dueDate: '11th of every month',
      category: 'GST',
      description: 'Monthly filing of outward supplies under GST'
    },
    {
      title: 'GSTR-3B Filing (Monthly)',
      dueDate: '20th of every month',
      category: 'GST',
      description: 'Monthly GST return filing for regular taxpayers'
    },
    {
      title: 'GSTR-9 & GSTR-9C Filing (Annual)',
      dueDate: `31 December ${currentYear}`,
      category: 'GST',
      description: 'Annual GST return and reconciliation statement'
    },
    
    // TDS deadlines
    {
      title: 'TDS Payment',
      dueDate: '7th of every month',
      category: 'TDS',
      description: 'Due date for depositing TDS for the previous month'
    },
    {
      title: 'TDS Return Filing (Q1)',
      dueDate: `31 July ${currentYear}`,
      category: 'TDS',
      description: 'TDS return for Q1 (April to June)'
    },
    {
      title: 'TDS Return Filing (Q2)',
      dueDate: `31 October ${currentYear}`,
      category: 'TDS',
      description: 'TDS return for Q2 (July to September)'
    },
    {
      title: 'TDS Return Filing (Q3)',
      dueDate: `31 January ${nextYear}`,
      category: 'TDS',
      description: 'TDS return for Q3 (October to December)'
    },
    {
      title: 'TDS Return Filing (Q4)',
      dueDate: `31 May ${nextYear}`,
      category: 'TDS',
      description: 'TDS return for Q4 (January to March)'
    }
  ];
}

/**
 * Fetch tax laws from alternative sources when the main government websites are unavailable
 */
export async function fetchTaxLawsAlternative(): Promise<TaxLaw[]> {
  try {
    // Try this more reliable source for tax laws
    // Note: Replace with a reliable API endpoint if available
    const response = await fetch('https://indiacode.nic.in/api/acts/tax-related', {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tax laws: ${response.status}`);
    }
    
    // Check the content type to ensure it's actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.info('API returned non-JSON response, falling back to common tax laws');
      return generateCommonTaxLaws();
    }
    
    try {
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        return data.map((act: {
          title?: string;
          effective_date?: string;
          category?: string;
          description?: string;
          url?: string;
        }) => ({
          title: act.title || 'Tax Law',
          effectiveDate: act.effective_date || 'Current',
          category: act.category || 'Tax Law',
          summary: act.description || 'Important tax legislation',
          url: act.url || ''
        }));
      }
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      // If JSON parsing fails, fall back to the generated laws
    }
    
    return generateCommonTaxLaws();
  } catch (error) {
    console.error('Error fetching tax laws from alternative source:', error);
    return generateCommonTaxLaws();
  }
}

/**
 * Generate a list of common Indian tax laws as fallback data
 */
function generateCommonTaxLaws(): TaxLaw[] {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      title: 'Income Tax Act, 1961',
      effectiveDate: '1 April 1962 (as amended)',
      category: 'Income Tax',
      summary: 'The main legislation governing income tax in India',
      url: 'https://incometaxindia.gov.in/pages/acts/income-tax-act.aspx'
    },
    {
      title: `Finance Act, ${currentYear}`,
      effectiveDate: `1 April ${currentYear}`,
      category: 'Income Tax',
      summary: 'Annual Finance Act implementing the budget proposals',
      url: 'https://incometaxindia.gov.in/pages/acts/finance-act.aspx'
    },
    {
      title: 'Central Goods and Services Tax Act, 2017',
      effectiveDate: '1 July 2017 (as amended)',
      category: 'GST',
      summary: 'Main legislation for GST on intra-state supplies',
      url: 'https://cbic-gst.gov.in/cgst-act.html'
    },
    {
      title: 'Integrated Goods and Services Tax Act, 2017',
      effectiveDate: '1 July 2017 (as amended)',
      category: 'GST',
      summary: 'Legislation for GST on inter-state supplies',
      url: 'https://cbic-gst.gov.in/igst-act.html'
    },
    {
      title: 'Union Territory Goods and Services Tax Act, 2017',
      effectiveDate: '1 July 2017 (as amended)',
      category: 'GST',
      summary: 'Legislation for GST in Union Territories',
      url: 'https://cbic-gst.gov.in/utgst-act.html'
    },
    {
      title: 'GST Compensation to States Act, 2017',
      effectiveDate: '1 July 2017 (as amended)',
      category: 'GST',
      summary: 'Legislation for compensating states for GST revenue losses',
      url: 'https://cbic-gst.gov.in/gst-compensation-act.html'
    },
    {
      title: 'Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015',
      effectiveDate: '1 July 2015',
      category: 'Income Tax',
      summary: 'Law to deal with undisclosed foreign income and assets',
      url: 'https://incometaxindia.gov.in/pages/acts/black-money-act.aspx'
    },
    {
      title: 'Direct Tax Vivad se Vishwas Act, 2020',
      effectiveDate: '17 March 2020',
      category: 'Income Tax',
      summary: 'Legislation to settle pending direct tax disputes',
      url: 'https://incometaxindia.gov.in/pages/acts/direct-tax-vivad-se-vishwas-act.aspx'
    }
  ];
} 