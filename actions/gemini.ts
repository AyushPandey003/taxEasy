'use server';

import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Base URL for Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1';
const GEMINI_MODEL_NAME = 'gemini-1.5-pro'; // Use the stable Gemini 1.5 Pro model
// Fallback models in case the primary one is not available
const FALLBACK_MODELS = ['gemini-pro', 'gemini-1.0-pro', 'gemini-pro-latest'];

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Fetches the list of available Gemini models
 */
async function listAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to list models:', response.status);
      return FALLBACK_MODELS;
    }

    const data = await response.json();
    if (!data.models || !Array.isArray(data.models)) {
      return FALLBACK_MODELS;
    }

    return data.models
      .filter((model: { name?: string }) => model.name && model.name.includes('gemini'))
      .map((model: { name: string }) => model.name.split('/').pop() as string);
  } catch (error) {
    console.error('Error listing models:', error);
    return FALLBACK_MODELS;
  }
}

/**
 * Attempts to find a working model and generate content
 */
async function generateWithFallbacks(
  prompt: string, 
  apiKey: string, 
  temperature: number = 0.2
): Promise<GeminiResponse> {
  // Try primary model first
  const result = await tryGenerateContent(GEMINI_MODEL_NAME, prompt, apiKey, temperature);
  if (!result.error) {
    return result;
  }

  // If primary model fails, try to list available models
  const availableModels = await listAvailableModels(apiKey);
  console.log('Available models:', availableModels);

  // Try each model until one works
  for (const model of availableModels) {
    const result = await tryGenerateContent(model, prompt, apiKey, temperature);
    if (!result.error) {
      return result;
    }
  }

  // If all models fail, return the last error
  return { text: '', error: `Failed with all models. Last error: ${result.error}` };
}

/**
 * Try to generate content with a specific model
 */
async function tryGenerateContent(
  model: string,
  prompt: string,
  apiKey: string,
  temperature: number = 0.2
): Promise<GeminiResponse> {
  try {
    console.log(`Trying model: ${model}`);
    const response = await fetch(
      `${GEMINI_API_URL}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        text: '', 
        error: errorData.error?.message || `API error: ${response.status}` 
      };
    }

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      return { text: '', error: 'No response from Gemini API' };
    }
  } catch (error: unknown) {
    return {
      text: '',
      error: error instanceof Error ? error.message : `Error with model ${model}`,
    };
  }
}

/**
 * Server Action to get tax law explanation from Gemini AI
 */
export async function getTaxLawExplanation(
  formData: FormData | { section: string; financialYear?: string }
): Promise<GeminiResponse | NextResponse> {
  try {
    // Rate limit first using global key due to linter issues with headers()
    const rateLimitResult = await rateLimit('gemini');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // Extract parameters from FormData or direct object
    const section = formData instanceof FormData 
      ? formData.get('section')?.toString() 
      : formData.section;
    
    const financialYear = formData instanceof FormData 
      ? formData.get('financialYear')?.toString() || '2024-25' 
      : formData.financialYear || '2024-25';

    if (!section) {
      return { text: '', error: 'Section parameter is required' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { text: '', error: 'API key not configured' };
    }

    const prompt = `Explain Indian Income Tax Law Section ${section} for Financial Year ${financialYear} in simple, jargon-free language. Include who it applies to, key benefits/deductions, maximum limits, documents needed, and a simple example. Format your answer with clear headings and bullet points.`;
    
    return await generateWithFallbacks(prompt, apiKey, 0.2);
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Error fetching explanation',
    };
  }
}

/**
 * Server Action to get personalized tax-saving advice from Gemini AI
 */
export async function getTaxSavingAdvice(
  formData: FormData | { 
    income: number; 
    age: number; 
    userType: string;
    investmentsData?: Record<string, unknown>;
    expensesData?: Record<string, unknown>;
  }
): Promise<GeminiResponse | NextResponse> {
  try {
    // Rate limit first using global key due to linter issues with headers()
    const rateLimitResult = await rateLimit('gemini');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // Extract parameters
    let income, age, userType, investmentsData, expensesData;
    
    if (formData instanceof FormData) {
      income = Number(formData.get('income'));
      age = Number(formData.get('age'));
      userType = formData.get('userType')?.toString() || 'salaried';
      investmentsData = formData.get('investmentsData') 
        ? JSON.parse(formData.get('investmentsData')?.toString() || '{}') 
        : {};
      expensesData = formData.get('expensesData') 
        ? JSON.parse(formData.get('expensesData')?.toString() || '{}') 
        : {};
    } else {
      income = formData.income;
      age = formData.age;
      userType = formData.userType;
      investmentsData = formData.investmentsData || {};
      expensesData = formData.expensesData || {};
    }

    if (!income || !age || !userType) {
      return { text: '', error: 'Missing required parameters' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { text: '', error: 'API key not configured' };
    }

    const userContext = JSON.stringify({
      income,
      age,
      userType,
      investmentsData,
      expensesData,
    });

    const prompt = `Based on the following user information, provide personalized tax-saving advice for an Indian taxpayer. Suggest specific investments and strategies to minimize tax liability legally under both old and new tax regimes. Focus on practical advice applicable to the user's specific situation. User information: ${userContext}`;
    
    return await generateWithFallbacks(prompt, apiKey, 0.3);
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Error fetching tax advice',
    };
  }
} 