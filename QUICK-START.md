# 🚀 Quick Start Guide

Get your L'Oréal Routine Builder up and running in 5 minutes!

## ✅ What You Need

- [ ] OpenAI API key
- [ ] Brave Search API key (free)
- [ ] Cloudflare account (free)
- [ ] Node.js installed

---

## 📋 5-Minute Setup

### Step 1: Get API Keys (3 minutes)

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and save it securely

**Brave Search API Key (FREE):**
1. Go to https://brave.com/search/api/
2. Sign up for free account
3. Get your API key from dashboard

### Step 2: Install Wrangler (30 seconds)

```bash
npm install -g wrangler
```

### Step 3: Deploy to Cloudflare (1 minute)

```bash
# Navigate to project directory
cd "/Users/lizziejohnson/Desktop/GCA /Untitled/09-prj-loreal-routine-builder"

# Login to Cloudflare
wrangler login

# Add OpenAI API key
wrangler secret put OPENAI_API_KEY
# Paste your OpenAI key when prompted

# Add Brave Search API key
wrangler secret put BRAVE_API_KEY
# Paste your Brave key when prompted

# Deploy!
wrangler deploy
```

**Copy the worker URL** that appears after deployment!

### Step 4: Update Configuration (30 seconds)

Open `script.js` and replace:

```javascript
const WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev/";
```

With your actual worker URL from step 3.

### Step 5: Launch! (10 seconds)

Open `index.html` in your browser. Done! 🎉

---

## 🧪 Test It Works

1. **Select a product** by clicking on it
2. **Click "Generate Routine"** button
3. **Ask a question** like: "What are the latest skincare trends?"
4. **Check for citations** at the bottom of the response

---

## 🆘 Troubleshooting

### "Worker deployment failed"
```bash
# Make sure you're logged in
wrangler login

# Try deploying again
wrangler deploy
```

### "Chat not responding"
- Check browser console for errors
- Verify WORKER_URL in script.js matches your deployed worker
- Refresh the page

### "No web search results"
- Brave API might need a few minutes to activate
- Check your Brave dashboard for API status
- Try questions with keywords: "trend", "best", "review", "latest"

---

## 📊 Check Your Setup

### Verify Worker is Live
Visit your worker URL directly in browser. You should see:
```
Method not allowed
```
This is correct! (Workers only accept POST requests)

### Check Console Logs
Open browser DevTools (F12) → Console. You should see:
- ✅ "Products loaded successfully"
- ✅ "Conversation history now has X exchanges"
- ✅ "Web search enabled for this query" (when relevant)

---

## 🎯 Next Steps

Once everything works:

1. **Customize products**: Edit `products.json`
2. **Adjust styling**: Modify colors in `style.css`
3. **Fine-tune search**: Edit `shouldEnableWebSearch()` in `script.js`
4. **Read full docs**: See `README.md` and `WEB-SEARCH-SETUP.md`

---

## 💰 Cost Tracking

**Free Tiers:**
- Cloudflare Workers: 100,000 requests/day FREE
- Brave Search: 2,000 queries/month FREE
- OpenAI: Pay-as-you-go (typically $0.01-$0.05 per query)

**Monitor Usage:**
- Cloudflare: https://dash.cloudflare.com/
- Brave: https://brave.com/search/api/
- OpenAI: https://platform.openai.com/usage

---

## 🎓 Learning Checklist

As you explore the code, look for:

- [ ] How products are loaded from JSON
- [ ] How localStorage persists selected products
- [ ] How conversation history maintains context
- [ ] How the worker proxies API requests
- [ ] How web search is triggered automatically
- [ ] How citations are formatted and displayed

---

**Need more help?** Check the detailed guides:
- `README.md` - Full project documentation
- `WEB-SEARCH-SETUP.md` - Web search configuration
- `CLOUDFLARE-WORKER-GUIDE.md` - Worker deployment details
