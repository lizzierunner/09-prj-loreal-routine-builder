# ✅ Dual AI Deployment Checklist

Deploy your L'Oréal Routine Builder with OpenAI + Mistral!

---

## 📋 Prerequisites

- [ ] OpenAI API key from https://platform.openai.com/api-keys
- [ ] Mistral API key from https://console.mistral.ai/
- [ ] Wrangler CLI installed
- [ ] Logged into Cloudflare

---

## 🚀 Deployment (3 Simple Steps)

### Step 1: Add OpenAI API Key

```bash
cd "/Users/lizziejohnson/Desktop/GCA /Untitled/09-prj-loreal-routine-builder"
wrangler secret put OPENAI_API_KEY
```

**Paste your OpenAI API key when prompted**

**Expected:** ✨ Success! Uploaded secret OPENAI_API_KEY

- [ ] OpenAI API key added

---

### Step 2: Add Mistral API Key

```bash
wrangler secret put MISTRAL_API_KEY
```

**Paste your Mistral API key when prompted**

**Expected:** ✨ Success! Uploaded secret MISTRAL_API_KEY

- [ ] Mistral API key added

---

### Step 3: Deploy Worker

```bash
wrangler deploy
```

**Expected:**
```
✨ Success!
Published loreal-routine-builder-worker
  https://loreal-routine-builder.esjohn15.workers.dev/
```

- [ ] Worker deployed successfully
- [ ] Worker URL matches WORKER_URL in script.js

---

## 🧪 Testing

### Test 1: OpenAI (Standard Chat)

1. Open `index.html` in browser
2. Open DevTools Console (F12)
3. Select 2 products
4. Click **"Generate Routine"**

**Expected:**
- Console shows: "Using OpenAI GPT-4o"
- Detailed, personalized routine appears
- No errors

- [ ] OpenAI working correctly

---

### Test 2: Mistral (Web Search)

1. In chat input, type: **"What are the latest skincare trends?"**
2. Send message

**Expected:**
- Console shows: "Using Mistral AI with web search"
- Console shows: "Web search enabled for this query"
- AI responds with current trend information
- Small badge/citation appears

- [ ] Mistral working correctly
- [ ] Web search triggered

---

### Test 3: Smart Routing

Test different question types:

**Should use OpenAI:**
- "How do I use retinol?"
- "What's the difference between AHA and BHA?"
- "Create a routine for dry skin"

**Should use Mistral:**
- "What's trending in beauty?"
- "Best rated moisturizers 2024"
- "Latest reviews for CeraVe"

- [ ] Routing works correctly

---

## ✅ Final Verification

- [ ] No JavaScript errors in console
- [ ] Products load and display
- [ ] Product selection works
- [ ] Selected products persist on reload
- [ ] Generate Routine uses OpenAI
- [ ] Trend questions use Mistral
- [ ] Citations appear for web search
- [ ] Conversation history works
- [ ] Clear buttons work

---

## 📊 Monitor API Keys

### Verify Both Keys Are Set

```bash
wrangler secret list
```

**Should show:**
```
OPENAI_API_KEY
MISTRAL_API_KEY
```

- [ ] Both secrets confirmed

---

### Check API Usage

**OpenAI Usage:**
https://platform.openai.com/usage

**Mistral Usage:**
https://console.mistral.ai/usage

- [ ] Monitoring dashboards accessible

---

## 🎯 Expected Behavior

### Typical Flow:

1. **User selects products** → localStorage
2. **User clicks "Generate Routine"** → OpenAI (detailed response)
3. **User asks "What's trending?"** → Mistral (web search)
4. **User asks "How often to use?"** → OpenAI (quality answer)
5. **User asks "Best serums 2024?"** → Mistral (current info)

### Console Logs:

```
Products loaded successfully: 35 products
Using OpenAI GPT-4o
Conversation history now has 1 exchanges
Web search enabled for this query
Using Mistral AI with web search
Conversation history now has 2 exchanges
```

---

## 🐛 Troubleshooting

### "Chat not responding"

**Check:**
```bash
wrangler tail
```

Look for errors in worker logs.

**Common fixes:**
- Redeploy: `wrangler deploy`
- Re-add secrets: `wrangler secret put OPENAI_API_KEY`
- Clear browser cache

---

### "Always using OpenAI" or "Always using Mistral"

**Check** `script.js` for:
```javascript
const enableWebSearch = shouldEnableWebSearch(message);
```

Make sure it's not hardcoded to `true` or `false`.

---

### "API key invalid" errors

**Re-add the failing key:**
```bash
wrangler secret put OPENAI_API_KEY
# or
wrangler secret put MISTRAL_API_KEY
```

Then redeploy:
```bash
wrangler deploy
```

---

## 💰 Cost Estimate

For **100 total messages**:

**OpenAI (70 messages):**
- Routine generation: ~$0.70-2.00
- General chat: ~$0.30-1.00
- **Subtotal: ~$1-3**

**Mistral (30 web searches):**
- With web search: ~€0.12-0.30
- **Subtotal: ~€0.12-0.30 ($0.13-0.33)**

**Total for 100 messages: ~$1.13-3.33**

**Using free credits:**
- OpenAI: Depends on your plan
- Mistral: €5 free = ~400-500 messages
- **Can run free for weeks/months!**

---

## ✨ Success Indicators

You're successful when:

✅ Products display correctly  
✅ Routine generation uses OpenAI (check console)  
✅ Trend questions use Mistral (check console)  
✅ Web search badge appears for relevant questions  
✅ No errors in browser console  
✅ Conversation history works  
✅ All features functional  

---

## 🎉 You're Live!

Your L'Oréal Routine Builder now features:

🤖 **Dual AI Intelligence**
- OpenAI for quality responses
- Mistral for current information

🔍 **Smart Web Search**
- Automatic detection
- Real-time trend data

💄 **Complete Beauty Advisor**
- Product recommendations
- Routine generation
- Trend awareness
- Expert advice

🔐 **Secure & Professional**
- API keys protected
- Production-ready
- Optimized costs

---

**Congratulations!** You've built a cutting-edge, multi-AI beauty application! 🚀💄✨

See `DUAL-AI-SETUP.md` for detailed information about the dual-AI architecture.
