import { NextRequest, NextResponse } from 'next/server';
import { getTaxLawExplanation } from '../../../../actions/gemini';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.section) {
      return NextResponse.json(
        { error: 'Section parameter is required' },
        { status: 400 }
      );
    }

    // Call the server action directly with the request data
    const result = await getTaxLawExplanation(body);

    if ('error' in result && result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ explanation: result.text });
  } catch (error) {
    console.error('Error in tax-laws API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax law explanation' },
      { status: 500 }
    );
  }
} 