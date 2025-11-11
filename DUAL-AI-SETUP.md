# 🤖 Dual AI Setup: OpenAI + Mistral

Your L'Oréal Routine Builder now uses **the best of both worlds**!

---

## ✨ How It Works

### Intelligent AI Routing

The worker automatically chooses the right AI for each request:

| Request Type | AI Used | Reason |
|--------------|---------|--------|
| **Routine Generation** | OpenAI GPT-4o | Best for detailed, personalized content |
| **Product Questions** | OpenAI GPT-4o | Excellent at product recommendations |
| **General Chat** | OpenAI GPT-4o | High-quality conversational responses |
| **Trend Questions** | Mistral + Web Search | Access to current web information |
| **"What's latest..."** | Mistral + Web Search | Real-time data from the internet |
| **Reviews/Comparisons** | Mistral + Web Search | Current reviews and comparisons |

---

## 🎯 Smart Detection

The system automatically detects when to use web search based on keywords:

**Triggers Mistral with Web Search:**
- "What are the **latest** skincare trends?"
- "What's **trending** in K-beauty?"
- "**Best** moisturizers for dry skin"
- "Product **reviews** for retinol"
- "**Compare** CeraVe vs La Roche-Posay"

**Uses OpenAI:**
- "Generate a routine for my products"
- "How do I use this serum?"
- "What order should I apply these?"
- "Tell me about hyaluronic acid"

---

## 🔑 Setup Requirements

You need **both** API keys:

### 1. OpenAI API Key
- Get from: https://platform.openai.com/api-keys
- Used for: Chat, routines, product questions
- Cost: ~$0.01-$0.05 per conversation

### 2. Mistral API Key
- Get from: https://console.mistral.ai/
- Used for: Web search queries only
- Cost: Free €5 credit, then ~€0.004 per query

---

## 🚀 Deployment Steps

### Step 1: Add Both API Keys

```bash
cd "/Users/lizziejohnson/Desktop/GCA /Untitled/09-prj-loreal-routine-builder"

# Add OpenAI key
wrangler secret put OPENAI_API_KEY
# Paste your OpenAI key when prompted

# Add Mistral key
wrangler secret put MISTRAL_API_KEY
# Paste your Mistral key when prompted
```

### Step 2: Verify Secrets

```bash
wrangler secret list
```

**Should show:**
```
OPENAI_API_KEY
MISTRAL_API_KEY
```

### Step 3: Deploy

```bash
wrangler deploy
```

---

## 🧪 Testing Both AIs

### Test OpenAI (Standard Chat)

1. Open `index.html`
2. Select 2-3 products
3. Click **"Generate Routine"**

**Expected:**
- Console: "Using OpenAI GPT-4o"
- High-quality, detailed routine
- Personalized to your products

### Test Mistral (Web Search)

1. In chat, ask: **"What are the latest skincare trends?"**

**Expected:**
- Console: "Using Mistral AI with web search"
- Console: "Web search enabled for this query"
- Response with current trend information
- Citation badge showing web search was used

---

## 💡 How Routing Works

```javascript
// In worker.js
if (requestData.enableWebSearch) {
  // Use Mistral with web search
  response = await fetch('https://api.mistral.ai/...');
} else {
  // Use OpenAI
  response = await fetch('https://api.openai.com/...');
}
```

**Frontend decides** → **Worker routes** → **Right AI responds**

---

## 📊 Cost Optimization

This dual-AI approach is **cost-effective** because:

✅ **OpenAI** - Used for most queries (better quality, reasonable cost)  
✅ **Mistral** - Only used when web search needed (~10-20% of queries)  
✅ **Smart Routing** - No wasted API calls  
✅ **Free Tiers** - Both offer credits to start  

**Estimated Monthly Cost (for 1000 messages):**
- OpenAI (800 messages): ~$8-40
- Mistral (200 web searches): ~€0.80-1.60
- **Total: ~$10-45/month** for production use

**For learning/development:**
- Use free credits from both
- Typically: Free for months!

---

## 🎨 User Experience

Users don't need to know which AI is being used. They just:

1. Ask questions naturally
2. Get intelligent responses
3. See citations when web search is used

**Behind the scenes**, the system:
- Analyzes the question
- Routes to the best AI
- Combines results seamlessly

---

## 🔧 Configuration

### Force OpenAI for All Requests

In `script.js`:
```javascript
// Always use OpenAI (disable auto-routing)
const enableWebSearch = false;
```

### Force Mistral for All Requests

In `script.js`:
```javascript
// Always use Mistral with web search
const enableWebSearch = true;
```

### Customize Routing Logic

In `script.js`, edit `shouldEnableWebSearch()`:
```javascript
function shouldEnableWebSearch(message) {
  const searchKeywords = [
    'trend', 'latest', 'review', 'best', 'compare',
    // Add your own keywords!
  ];
  
  const lowerMessage = message.toLowerCase();
  return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}
```

---

## 📈 Monitoring

### View Which AI is Used

Open browser console to see:
```
Using OpenAI GPT-4o
```
or
```
Using Mistral AI with web search
```

### Monitor API Usage

**OpenAI:**
- https://platform.openai.com/usage

**Mistral:**
- https://console.mistral.ai/usage

### Worker Logs

```bash
wrangler tail
```

---

## ✅ Advantages of Dual AI

### Best Quality
- OpenAI GPT-4o for routine generation
- Mistral for current web information

### Cost Effective
- Pay for OpenAI only when needed
- Mistral cheaper for web search

### Future Proof
- Can switch between AIs
- Can add more AIs easily
- Not locked into one provider

### Redundancy
- If one API is down, can fallback
- If one hits rate limit, use the other

---

## 🐛 Troubleshooting

### "Using OpenAI GPT-4o" but no response

**Check:**
```bash
# Verify OpenAI key is set
wrangler secret list
```

**Fix:**
```bash
wrangler secret put OPENAI_API_KEY
wrangler deploy
```

### "Using Mistral" but no web search results

**This is normal!** Mistral includes web data in the response content, not as separate citations.

The citation badge just indicates web search was enabled.

### Both APIs failing

**Check:**
1. Both API keys are valid
2. Both APIs have available quota
3. Worker is deployed
4. WORKER_URL is correct in script.js

---

## 🎓 What You're Learning

This dual-AI architecture teaches:

- ✅ **API Composition** - Combining multiple services
- ✅ **Intelligent Routing** - Choosing the right tool
- ✅ **Cost Optimization** - Using resources efficiently
- ✅ **Graceful Degradation** - Fallback strategies
- ✅ **Serverless Patterns** - Edge computing
- ✅ **Modern Architecture** - Best-of-breed approach

---

## 📚 Architecture Diagram

```
User Question
    ↓
Frontend (script.js)
    ↓
shouldEnableWebSearch()?
    ↓          ↓
   YES        NO
    ↓          ↓
Mistral    OpenAI
(Web Search) (Chat)
    ↓          ↓
    Response with
    current info
```

---

## 🚀 Next Steps

### Enhance Routing Logic
Add more sophisticated detection:
```javascript
// Route based on message length, context, etc.
if (message.length > 100) {
  // Long questions → OpenAI
} else if (hasProductContext) {
  // Product questions → OpenAI
} else if (needsWebSearch) {
  // Current info → Mistral
}
```

### Add Caching
Cache frequently asked questions to reduce API calls.

### Implement Fallbacks
If OpenAI fails, try Mistral (and vice versa).

---

## ✨ Summary

Your app now has:

🤖 **Dual AI Power**
- OpenAI GPT-4o for quality
- Mistral for web search

🎯 **Smart Routing**
- Automatic AI selection
- Optimized for each use case

💰 **Cost Effective**
- Only use web search when needed
- Free tiers for development

🔐 **Secure**
- Both API keys in worker
- Nothing exposed to browser

💄 **Seamless UX**
- Users don't see the complexity
- Just great responses

---

**You now have a production-ready, multi-AI beauty advisor!** 🎉💄✨

See `DEPLOYMENT-CHECKLIST-DUAL-AI.md` for step-by-step deployment!
