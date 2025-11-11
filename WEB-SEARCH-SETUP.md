# 🔍 Web Search Setup Guide

Your L'Oréal Routine Builder now includes **web search functionality** to provide current, real-world information with citations!

## What's New?

✅ **Current Information**: Chatbot responses include up-to-date beauty trends, product reviews, and skincare advice  
✅ **Visible Citations**: See source links for all web-based information  
✅ **Smart Search Detection**: Automatically enables search for relevant questions  
✅ **Secure Implementation**: Search API key protected in Cloudflare Worker

---

## 🚀 Setup Instructions

### Step 1: Get a Free Brave Search API Key

1. Go to [Brave Search API](https://brave.com/search/api/)
2. Click **"Get Started"** or **"Sign Up"**
3. Create a free account (no credit card required)
4. Navigate to your dashboard
5. Copy your **API Key**

**Free Tier Includes:**
- 2,000 queries per month
- No credit card required
- Perfect for learning and development

---

### Step 2: Add API Key to Cloudflare Worker

#### Option A: Using Wrangler CLI (Recommended)

```bash
# Navigate to your project directory
cd "/Users/lizziejohnson/Desktop/GCA /Untitled/09-prj-loreal-routine-builder"

# Add Brave API key as a secret
wrangler secret put BRAVE_API_KEY
```

When prompted, paste your Brave Search API key.

#### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click on your worker: `loreal-routine-builder`
4. Go to **Settings** → **Variables**
5. Under **Environment Variables**, click **Add variable**
6. Name: `BRAVE_API_KEY`
7. Value: Your Brave Search API key
8. Click **Encrypt** to make it a secret
9. Click **Save**

---

### Step 3: Deploy Updated Worker

```bash
# Deploy the updated worker with web search functionality
wrangler deploy
```

---

## 🎯 How Web Search Works

### Automatic Search Detection

The chatbot automatically enables web search when users ask about:

- **Trends**: "What are the latest skincare trends?"
- **Reviews**: "What are reviews saying about this moisturizer?"
- **Comparisons**: "Which is better for dry skin?"
- **Current info**: "What's popular in K-beauty right now?"
- **Recommendations**: "What do experts recommend for acne?"

### Example Questions That Trigger Search:

✅ "What are the best retinol serums in 2024?"  
✅ "Latest trends in clean beauty"  
✅ "How to layer vitamin C and hyaluronic acid"  
✅ "What's trending in skincare?"  
✅ "Compare CeraVe vs La Roche-Posay moisturizers"

### Citations Display

When web search is used, you'll see:

```
🔗 Sources:
[1] Article Title
    Description from the search result
    → Link to source

[2] Another Article
    More information...
    → Link to source
```

---

## 🧪 Testing Web Search

1. **Open your app** in a browser
2. **Ask a question** like: "What are the latest skincare trends?"
3. **Check the console** for: `Web search enabled for this query`
4. **View the response** with citations at the bottom

---

## 🔧 Troubleshooting

### "Web search not working"

**Check:**
- ✅ Brave API key is set in Cloudflare secrets
- ✅ Worker is deployed with latest code
- ✅ Check browser console for errors
- ✅ Verify API key is valid and not expired

### "No citations showing up"

**Possible causes:**
- Search didn't find relevant results
- API quota exceeded (check Brave dashboard)
- Question didn't trigger search keywords

**Fix:** Try more specific questions with keywords like "trend", "best", "review", "latest"

---

## 💡 Tips for Best Results

### Ask Better Questions

❌ **Vague**: "Tell me about moisturizers"  
✅ **Specific**: "What are the best moisturizers for dry skin in 2024?"

❌ **Generic**: "Skincare routine"  
✅ **Targeted**: "What's the trending Korean skincare routine?"

### Product-Specific Queries

When you have products selected:
- "Are there any recent reviews about these products?"
- "What are current trends for using these ingredients together?"
- "How do experts recommend layering these products?"

---

## 🎨 Customization

### Adjust Search Sensitivity

Edit `shouldEnableWebSearch()` in `script.js`:

```javascript
function shouldEnableWebSearch(message) {
  const searchKeywords = [
    'trend', 'trending', 'popular', 'best', 'review',
    'latest', 'new', 'current', 'recent', 'news',
    // Add your own keywords here!
  ];
  
  const lowerMessage = message.toLowerCase();
  return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}
```

### Change Number of Citations

Edit `worker.js` to show more/fewer results:

```javascript
// Change .slice(0, 3) to show different number of citations
return data.web.results.slice(0, 5).map(result => ({
  title: result.title,
  description: result.description,
  url: result.url,
}));
```

---

## 📊 API Usage Monitoring

**Free Tier Limits:**
- 2,000 queries/month
- ~66 queries/day
- ~3 queries/hour (sustained)

**Monitor your usage:**
1. Go to [Brave Search Dashboard](https://brave.com/search/api/)
2. View **API Usage** section
3. Check remaining quota

---

## 🔐 Security Notes

✅ **API keys stored securely** in Cloudflare environment variables  
✅ **Never exposed** to the browser or frontend code  
✅ **CORS properly configured** to prevent unauthorized access  
✅ **Rate limiting** handled by Brave Search API

---

## 🎓 For Students

This implementation demonstrates:

- **API Integration**: Connecting multiple APIs (OpenAI + Brave Search)
- **Serverless Architecture**: Using Cloudflare Workers as middleware
- **Security Best Practices**: Environment variables for sensitive data
- **User Experience**: Automatic feature detection and smart defaults
- **Data Presentation**: Formatting external data for readability

---

## 📚 Additional Resources

- [Brave Search API Docs](https://brave.com/search/api/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Web Search Best Practices](https://developers.google.com/search/docs/basics/guidelines)

---

## ✨ What's Next?

Want to enhance further? Try:

- Add search result caching to reduce API calls
- Filter results by recency (last month, last week)
- Add image search for product comparisons
- Create a "Trending Now" section on the homepage

---

**Need Help?** Check the browser console for detailed logs about search requests and results!
