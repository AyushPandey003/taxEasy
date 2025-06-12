// Base URL for Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1';

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Function to get tax law explanation from Gemini AI
 */
export async function getTaxLawExplanation(
  section: string,
  financialYear: string,
  apiKey: string
): Promise<GeminiResponse> {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-pro:generateContent?key=${apiKey}`,
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
                  text: `Explain Indian Income Tax Law Section ${section} for Financial Year ${financialYear} in simple, jargon-free language. Include who it applies to, key benefits/deductions, maximum limits, documents needed, and a simple example. Format your answer with clear headings and bullet points.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract generated text from response
    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      return { text: '', error: 'No response from Gemini API' };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        text: '',
        error: error.message || 'Error fetching explanation',
      };
    } else {
      return {
        text: '',
        error: 'An unknown error occurred',
      };
    }
  }
}

/**
 * Function to get personalized tax-saving advice from Gemini AI
 */
export async function getTaxSavingAdvice(
  income: number,
  age: number,
  userType: string,
  investmentsData: { [key: string]: number | string }[],
  expensesData: { [key: string]: number | string },
  apiKey: string
): Promise<GeminiResponse> {
  try {
    const userContext = JSON.stringify({
      income,
      age,
      userType, // e.g., "salaried", "freelancer", "business owner", "senior citizen"
      investmentsData,
      expensesData,
    });

    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-pro:generateContent?key=${apiKey}`,
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
                  text: `Based on the following user information, provide personalized tax-saving advice for an Indian taxpayer. Suggest specific investments and strategies to minimize tax liability legally under both old and new tax regimes. Focus on practical advice applicable to the user's specific situation. User information: ${userContext}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract generated text from response
    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      return { text: '', error: 'No response from Gemini API' };
    }
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      return {
        text: '',
        error: error.message || 'Error fetching tax advice',
      };
    } else {
      return {
        text: '',
        error: 'An unknown error occurred',
      };
    }
  }
} 