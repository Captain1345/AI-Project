import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { conversationId, allMessages } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    if(!allMessages){
      return NextResponse.json({ error: 'Missing allMessages' }, { status: 400 });
    }
    // Forward the request to the Python microservice
    const pythonServiceUrl = 'http://localhost:8002/pm-feedback'; // Assuming this is the endpoint
    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id: conversationId, allMessages }), // Match Python service's expected payload
    });

    if (!response.ok) {
      // Forward the error from the Python service
      const errorData = await response.text();
      return NextResponse.json({ error: 'Python service error', details: errorData }, { status: response.status });
    }

    const data = await response.json();

    // Forward the successful response from the Python service
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
