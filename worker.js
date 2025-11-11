/**
 * Cloudflare Worker for L'Oréal Routine Builder
 * Uses OpenAI for chat and Mistral for web search
 * Intelligently routes requests based on needs
 * No API keys are exposed to the browser
 */

/* CORS headers for allowing requests from your frontend */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* Handle incoming requests */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  /* Handle CORS preflight requests */
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  /* Only allow POST requests */
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    /* Parse the incoming request body */
    const requestData = await request.json();

    /* Validate required fields */
    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    /* Determine which AI to use based on web search requirement */
    const useWebSearch = requestData.enableWebSearch || false;
    let aiResponse;
    let searchResults = null;

    if (useWebSearch) {
      /* Use Mistral with built-in web search for current information */
      console.log('Using Mistral AI with web search');
      
      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: requestData.messages,
          temperature: requestData.temperature || 0.7,
          max_tokens: requestData.max_tokens || 1500,
          web_search: true, // Enable Mistral's web search
        }),
      });

      aiResponse = await mistralResponse.json();
      
      /* Indicate that web search was used */
      if (aiResponse.choices && aiResponse.choices[0]) {
        searchResults = [{
          title: 'Web Search Enabled',
          description: 'Response includes current information from the web via Mistral AI',
          url: '#'
        }];
      }

    } else {
      /* Use OpenAI for standard chat (better quality for routine generation) */
      console.log('Using OpenAI GPT-4o');
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: requestData.model || 'gpt-4o',
          messages: requestData.messages,
          temperature: requestData.temperature || 0.7,
          max_tokens: requestData.max_tokens || 1500,
        }),
      });

      aiResponse = await openaiResponse.json();
      
      /* Log the response for debugging */
      console.log('OpenAI Response Status:', openaiResponse.status);
      console.log('OpenAI Response:', JSON.stringify(aiResponse).substring(0, 200));
      
      /* Check if there's an error in the response */
      if (aiResponse.error) {
        console.error('OpenAI Error:', aiResponse.error);
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API Error',
            message: aiResponse.error.message || 'Unknown error from OpenAI',
            details: aiResponse.error
          }),
          {
            status: openaiResponse.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    /* Add search indicator to response if web search was used */
    if (searchResults && searchResults.length > 0) {
      aiResponse.searchResults = searchResults;
    }

    /* Return the response to the client */
    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    /* Handle errors */
    console.error('Worker error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}
