import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { conversationHistory = [], lastMessageSent, nResults = 15 } = await request.json();
    
    if (!lastMessageSent) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Ensure the PDF_SERVICE_URL is set in your environment variables
    const pythonMicroserviceUrl = process.env.PYTHON_MICROSERVICE_URL;
    if (!pythonMicroserviceUrl) {
        throw new Error('PYTHON_MICROSERVICE_URL is not defined in environment variables.');
    }

    const response = await fetch(`${pythonMicroserviceUrl}/query-collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationHistory,
        lastMessageSent,
        nResults,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error from Python microservice:', data);
      return NextResponse.json(
          { 
              error: 'Failed to query vector collection',
              details: data
          },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying vector collection:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to query vector collection',
        details: error.message
      },
      { status: 500 }
    );
  }
}