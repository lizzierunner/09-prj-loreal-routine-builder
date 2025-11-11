# 🔄 Web Search Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     index.html                            │  │
│  │  • Product grid                                           │  │
│  │  • Chat interface                                         │  │
│  │  • Citation display                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     script.js                             │  │
│  │  • shouldEnableWebSearch() - Keyword detection            │  │
│  │  • sendToOpenAI() - API requests                          │  │
│  │  • addMessage() - Citation rendering                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER                            │
│                   (Edge Computing)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     worker.js                             │  │
│  │                                                           │  │
│  │  1. Receives request with enableWebSearch flag           │  │
│  │  2. If search enabled:                                   │  │
│  │     → performWebSearch(query)                            │  │
│  │     → Get top 3 articles                                 │  │
│  │     → Add to OpenAI context                              │  │
│  │  3. Call OpenAI API with enhanced context                │  │
│  │  4. Return response + citations                          │  │
│  │                                                           │  │
│  │  Environment Variables (Secure):                         │  │
│  │  • OPENAI_API_KEY                                        │  │
│  │  • BRAVE_API_KEY                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                   ↕                            ↕
         ┌─────────────────────┐    ┌──────────────────────┐
         │   Brave Search API   │    │    OpenAI API        │
         │   (Web Search)       │    │    (gpt-4o)          │
         │                      │    │                      │
         │  • Search the web    │    │  • Generate response │
         │  • Return articles   │    │  • Use search data   │
         │  • Free: 2K/month    │    │  • Cite sources      │
         └─────────────────────┘    └──────────────────────┘
```

---

## Request Flow (With Web Search)

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: User asks question                                     │
└────────────────────────────────────────────────────────────────┘
   "What are the latest skincare trends?"
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 2: Keyword detection (script.js)                          │
└────────────────────────────────────────────────────────────────┘
   shouldEnableWebSearch("What are the latest skincare trends?")
   → Finds keyword: "latest"
   → Returns: true
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend sends request                                 │
└────────────────────────────────────────────────────────────────┘
   POST https://loreal-routine-builder.esjohn15.workers.dev/
   {
     "model": "gpt-4o",
     "messages": [...conversation history...],
     "enableWebSearch": true  ← Flag set to true
   }
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 4: Worker performs web search                             │
└────────────────────────────────────────────────────────────────┘
   performWebSearch("What are the latest skincare trends?")
   → Calls Brave Search API
   → Gets results:
     [1] "2024 Skincare Trends" - Vogue
     [2] "Skin Cycling Guide" - Allure  
     [3] "Best Drugstore Products" - Cosmopolitan
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 5: Worker enhances OpenAI context                         │
└────────────────────────────────────────────────────────────────┘
   Original messages:
   [
     { role: "system", content: "You are a beauty advisor..." },
     { role: "user", content: "What are the latest trends?" }
   ]
   
   Enhanced messages:
   [
     { role: "system", content: "You are a beauty advisor..." },
     { role: "system", content: "Here is current web info:
        [1] 2024 Skincare Trends - Vogue...
        [2] Skin Cycling Guide - Allure...
        [3] Best Drugstore Products - Cosmopolitan..." },
     { role: "user", content: "What are the latest trends?" }
   ]
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 6: Worker calls OpenAI                                    │
└────────────────────────────────────────────────────────────────┘
   POST https://api.openai.com/v1/chat/completions
   Authorization: Bearer ${OPENAI_API_KEY}
   {
     "model": "gpt-4o",
     "messages": [...enhanced with search results...]
   }
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 7: OpenAI generates response                              │
└────────────────────────────────────────────────────────────────┘
   OpenAI reads search results and generates:
   
   "Based on current trends [1], the top skincare movements
    in 2024 include minimalist routines, skin cycling [2],
    and barrier repair. Products like CeraVe are popular
    for their gentle formulations [3]."
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 8: Worker returns response + citations                    │
└────────────────────────────────────────────────────────────────┘
   {
     "choices": [{
       "message": {
         "content": "Based on current trends [1]..."
       }
     }],
     "searchResults": [
       { title: "2024 Skincare Trends", url: "...", description: "..." },
       { title: "Skin Cycling Guide", url: "...", description: "..." },
       { title: "Best Drugstore Products", url: "...", description: "..." }
     ]
   }
                    ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 9: Frontend displays response + citations                 │
└────────────────────────────────────────────────────────────────┘
   addMessage(response.content, false, searchResults)
   
   Renders:
   • AI message bubble with response text
   • Citations section with 3 numbered cards
   • Clickable links to sources
```

---

## Request Flow (Without Web Search)

```
User asks: "How should I use this moisturizer?"
   ↓
shouldEnableWebSearch() → false (no trigger keywords)
   ↓
Frontend → Worker (enableWebSearch: false)
   ↓
Worker → OpenAI directly (no web search)
   ↓
OpenAI → Response
   ↓
Frontend displays (no citations)
```

---

## Code Flow Diagram

```javascript
// ============= FRONTEND (script.js) =============

chatForm.addEventListener("submit", async (e) => {
  const message = userInput.value.trim();
  
  // 1. Detect if web search needed
  const enableWebSearch = shouldEnableWebSearch(message);
  //    ↓
  //    Checks for keywords: "latest", "trend", "best", etc.
  //    Returns: true/false
  
  // 2. Send to API with search flag
  const result = await sendToOpenAI(message, includeProducts, enableWebSearch);
  //    ↓
  //    Makes fetch request to worker with enableWebSearch parameter
  
  // 3. Display response with citations
  addMessage(result.response, false, result.searchResults);
  //    ↓
  //    Renders AI message + citation cards if searchResults exist
});

// ============= WORKER (worker.js) =============

async function handleRequest(request) {
  const requestData = await request.json();
  
  let searchResults = null;
  let enhancedMessages = [...requestData.messages];
  
  // 1. Check if search requested
  if (requestData.enableWebSearch) {
    //    ↓
    //    Extract user query
    const userQuery = requestData.messages[requestData.messages.length - 1].content;
    
    // 2. Perform web search
    searchResults = await performWebSearch(userQuery);
    //    ↓
    //    Calls Brave Search API
    //    Returns: [{ title, description, url }, ...]
    
    // 3. Enhance messages with search context
    if (searchResults && searchResults.length > 0) {
      const contextMessage = {
        role: 'system',
        content: `Here is current web information:\n${searchContext}...`
      };
      enhancedMessages.splice(enhancedMessages.length - 1, 0, contextMessage);
      //    ↓
      //    Injects search results before user message
    }
  }
  
  // 4. Call OpenAI with enhanced context
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    body: JSON.stringify({
      messages: enhancedMessages  // ← Enhanced with search data
    })
  });
  
  // 5. Return response + citations
  const openaiData = await openaiResponse.json();
  if (searchResults) {
    openaiData.searchResults = searchResults;  // ← Add citations
  }
  
  return new Response(JSON.stringify(openaiData));
}
```

---

## Data Flow Example

### Input:
```
User Query: "What are the best retinol serums in 2024?"
```

### Processing:

**Step 1 - Keyword Detection:**
```javascript
Keywords found: ["best", "in 2024"]
enableWebSearch = true
```

**Step 2 - Web Search Results:**
```json
[
  {
    "title": "Best Retinol Serums of 2024",
    "description": "Dermatologists share their top picks for retinol serums...",
    "url": "https://vogue.com/best-retinol-2024"
  },
  {
    "title": "Retinol vs Retinal: Which is Better?",
    "description": "Understanding the difference between retinol and retinal...",
    "url": "https://allure.com/retinol-vs-retinal"
  },
  {
    "title": "How to Use Retinol for Beginners",
    "description": "A dermatologist's guide to starting retinol safely...",
    "url": "https://cosmopolitan.com/retinol-guide"
  }
]
```

**Step 3 - Enhanced OpenAI Context:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a L'Oréal beauty advisor..."
    },
    {
      "role": "system",
      "content": "Here is current web information:\n\n[1] Best Retinol Serums of 2024\nDermatologists share their top picks...\nSource: https://vogue.com/...\n\n[2] Retinol vs Retinal: Which is Better?\nUnderstanding the difference...\nSource: https://allure.com/...\n\n[3] How to Use Retinol for Beginners\nA dermatologist's guide...\nSource: https://cosmopolitan.com/..."
    },
    {
      "role": "user",
      "content": "What are the best retinol serums in 2024?"
    }
  ]
}
```

**Step 4 - OpenAI Response:**
```
"Based on current expert recommendations [1], the best retinol 
serums in 2024 include products with stabilized retinol formulations. 
When choosing, consider whether you want retinol or the newer 
retinal form [2], which can be more effective but also more 
irritating. For beginners, start with a lower concentration 
and use it 2-3 times per week [3]."
```

### Output:
```
AI Message:
  "Based on current expert recommendations [1], the best..."

Citations:
  [1] Best Retinol Serums of 2024 → vogue.com/...
  [2] Retinol vs Retinal: Which is Better? → allure.com/...
  [3] How to Use Retinol for Beginners → cosmopolitan.com/...
```

---

## Security Flow

```
┌──────────────────────────────────────────────────────┐
│ BROWSER (Insecure - User can inspect)               │
│                                                      │
│  ✗ NO API keys                                      │
│  ✓ Only WORKER_URL visible                          │
│  ✓ User sees citations (public URLs only)           │
└──────────────────────────────────────────────────────┘
                       ↓ HTTPS
┌──────────────────────────────────────────────────────┐
│ CLOUDFLARE WORKER (Secure - Server-side)            │
│                                                      │
│  ✓ OPENAI_API_KEY (encrypted environment variable)  │
│  ✓ BRAVE_API_KEY (encrypted environment variable)   │
│  ✓ Keys never sent to browser                       │
│  ✓ Keys never logged                                │
└──────────────────────────────────────────────────────┘
         ↓ Brave API Key              ↓ OpenAI API Key
┌─────────────────────┐      ┌─────────────────────────┐
│  Brave Search API   │      │      OpenAI API         │
│  (Authenticated)    │      │    (Authenticated)      │
└─────────────────────┘      └─────────────────────────┘
```

---

## Performance Metrics

### Typical Request Times:

**Without Web Search:**
```
User sends message
  ↓ 50ms (network)
Worker receives
  ↓ 1-3 seconds (OpenAI processing)
User sees response
─────────────────
Total: ~1-3 seconds
```

**With Web Search:**
```
User sends message
  ↓ 50ms (network)
Worker receives
  ↓ 300-500ms (Brave Search)
Web results retrieved
  ↓ 2-4 seconds (OpenAI with enhanced context)
User sees response + citations
─────────────────
Total: ~2.5-5 seconds
```

---

This architecture ensures:
✅ Security (keys server-side)
✅ Performance (edge computing)
✅ Reliability (error handling)
✅ Transparency (visible sources)
