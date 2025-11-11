# 📋 Deployment Checklist

## Complete Setup Guide for Web Search Feature

Follow this checklist to deploy your enhanced L'Oréal Routine Builder with web search capabilities.

---

## ✅ Pre-Deployment Checklist

### 1. Accounts & Access
- [ ] OpenAI account created
- [ ] OpenAI API key obtained
- [ ] Brave Search account created (free)
- [ ] Brave Search API key obtained
- [ ] Cloudflare account created (free)
- [ ] Cloudflare logged in via Wrangler

### 2. Local Setup
- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Project files downloaded/cloned
- [ ] Terminal/command prompt open

---

## 🚀 Deployment Steps

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```
**Expected output:** "added X packages"

**Verify:**
```bash
wrangler --version
```
- [ ] Wrangler installed successfully

---

### Step 2: Login to Cloudflare
```bash
wrangler login
```
**What happens:**
- Browser window opens
- Cloudflare login page appears
- Click "Allow" to authorize

- [ ] Successfully logged in to Cloudflare

---

### Step 3: Navigate to Project
```bash
cd "/Users/lizziejohnson/Desktop/GCA /Untitled/09-prj-loreal-routine-builder"
```

**Verify you're in the right place:**
```bash
ls
```
**You should see:**
- index.html
- script.js
- style.css
- worker.js
- wrangler.toml
- products.json

- [ ] In correct project directory

---

### Step 4: Set OpenAI API Key
```bash
wrangler secret put OPENAI_API_KEY
```

**When prompted:**
1. Paste your OpenAI API key
2. Press Enter

**Expected output:** "✨ Success! Uploaded secret OPENAI_API_KEY"

- [ ] OpenAI API key set

---

### Step 5: Set Brave Search API Key
```bash
wrangler secret put BRAVE_API_KEY
```

**When prompted:**
1. Paste your Brave Search API key
2. Press Enter

**Expected output:** "✨ Success! Uploaded secret BRAVE_API_KEY"

- [ ] Brave API key set

---

### Step 6: Deploy Worker
```bash
wrangler deploy
```

**Expected output:**
```
⛅️ wrangler 3.x.x
------------------
Uploaded loreal-routine-builder-worker
Published loreal-routine-builder-worker
  https://loreal-routine-builder-worker.your-subdomain.workers.dev
```

**IMPORTANT:** Copy the worker URL that appears!

- [ ] Worker deployed successfully
- [ ] Worker URL copied

---

### Step 7: Update Frontend Configuration

1. Open `script.js` in your code editor
2. Find line ~11: `const WORKER_URL = "...";`
3. Replace with your actual worker URL
4. Save the file

**Before:**
```javascript
const WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev/";
```

**After:**
```javascript
const WORKER_URL = "https://loreal-routine-builder-worker.yourname.workers.dev/";
```

- [ ] WORKER_URL updated in script.js
- [ ] File saved

---

### Step 8: Test Deployment

1. Open `index.html` in your web browser
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to Console tab

**You should see:**
```
Products loaded successfully: 35 products
```

- [ ] Page loads without errors
- [ ] Products display correctly

---

## 🧪 Testing Web Search

### Test 1: Basic Chat (No Search)
1. Type in chat: "Hello!"
2. Send message

**Expected:**
- AI responds with greeting
- No citations shown
- Console: No "Web search enabled" message

- [ ] Basic chat works

---

### Test 2: Web Search Trigger
1. Type in chat: "What are the latest skincare trends?"
2. Send message

**Expected:**
- Console shows: "Web search enabled for this query"
- AI responds with trend information
- Citations section appears below response
- 2-3 source links displayed

- [ ] Web search activates
- [ ] Citations display correctly
- [ ] Links are clickable

---

### Test 3: Product Selection
1. Click on a product to select it
2. Selected product appears in "Selected Products" section
3. Reload page
4. Product remains selected

- [ ] Product selection works
- [ ] LocalStorage persistence works

---

### Test 4: Routine Generation
1. Select 2-3 products
2. Click "Generate Routine" button

**Expected:**
- Loading indicator appears
- AI generates personalized routine
- Citations may appear (if search triggered)
- Routine includes selected products

- [ ] Routine generation works
- [ ] Products are included in routine

---

## 🔍 Verification Checklist

### Frontend
- [ ] Page loads without JavaScript errors
- [ ] Products display in grid
- [ ] Category filter works
- [ ] Product selection works
- [ ] Selected products persist on reload
- [ ] Chat interface responds
- [ ] Generate Routine button works
- [ ] Citations display properly
- [ ] Links open in new tabs

### Backend (Worker)
- [ ] Worker URL is accessible
- [ ] OpenAI API key works (chat responds)
- [ ] Brave API key works (citations appear)
- [ ] CORS headers allow requests
- [ ] Error handling works (try invalid input)

### Console Logs
Open DevTools → Console and verify:
- [ ] No red error messages
- [ ] "Products loaded successfully" appears
- [ ] "Web search enabled" appears for relevant queries
- [ ] "Conversation history now has X exchanges" appears
- [ ] API responses logged correctly

---

## 🐛 Troubleshooting

### "Worker not found" or 404 errors
**Problem:** WORKER_URL in script.js doesn't match deployed worker

**Fix:**
1. Run `wrangler deployments list` to see your worker URL
2. Update WORKER_URL in script.js
3. Save and reload page

---

### "Chat not responding"
**Problem:** API keys not set or worker not deployed

**Check:**
```bash
# View your worker's environment variables
wrangler secret list
```

**Should show:**
```
OPENAI_API_KEY
BRAVE_API_KEY
```

**If missing, add them:**
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put BRAVE_API_KEY
```

---

### "No citations showing"
**Problem:** Brave API key not working or quota exceeded

**Check:**
1. Go to https://brave.com/search/api/
2. Login to your dashboard
3. Check "API Usage" section
4. Verify you have queries remaining

**Fix:**
- If quota exceeded, wait for monthly reset
- If key invalid, generate new key and update:
  ```bash
  wrangler secret put BRAVE_API_KEY
  ```

---

### "CORS error" in console
**Problem:** Worker CORS headers misconfigured

**Check:** worker.js has:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

**Fix:**
1. Verify corsHeaders in worker.js
2. Redeploy: `wrangler deploy`

---

### Products not persisting on reload
**Problem:** localStorage disabled or private browsing

**Check:**
1. Ensure not in private/incognito mode
2. Check browser settings allow localStorage

**Test:**
```javascript
// In browser console:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should show 'value'
```

---

## 📊 Monitoring

### Check Worker Logs
```bash
wrangler tail
```
**Shows real-time logs from your worker**

---

### Monitor API Usage

**OpenAI:**
- https://platform.openai.com/usage
- Check daily requests and costs

**Brave Search:**
- https://brave.com/search/api/
- Check remaining quota

**Cloudflare:**
- https://dash.cloudflare.com/
- View worker requests and errors

---

## 📈 Performance Benchmarks

### Expected Response Times:
- **Basic chat (no search):** 1-3 seconds
- **Chat with search:** 2-5 seconds
- **Routine generation:** 2-6 seconds
- **Product selection:** Instant (<100ms)

### API Quotas:
- **Brave Search:** 2,000/month (free tier)
- **Cloudflare:** 100,000 requests/day (free tier)
- **OpenAI:** Pay-as-you-go (no hard limit)

---

## ✅ Final Verification

Run through this complete test:

1. [ ] Open index.html in browser
2. [ ] Filter products by "moisturizer"
3. [ ] Select CeraVe Moisturizing Cream
4. [ ] Select La Roche-Posay Toleriane
5. [ ] Click product to view details modal
6. [ ] Close modal
7. [ ] Click "Generate Routine"
8. [ ] Verify routine includes both products
9. [ ] Ask: "What are the latest moisturizer trends?"
10. [ ] Verify web search triggers (console log)
11. [ ] Verify citations appear
12. [ ] Click a citation link (opens in new tab)
13. [ ] Ask follow-up: "Which is better for sensitive skin?"
14. [ ] Verify conversation context maintained
15. [ ] Reload page
16. [ ] Verify selected products still selected
17. [ ] Click "Clear All" to remove products
18. [ ] Click "Clear Chat" to reset conversation

**If all 18 steps work: You're ready to go! 🎉**

---

## 🎓 What to Submit (if for a class)

- [ ] Screenshot of working chat with citations
- [ ] Screenshot of routine generation
- [ ] Link to deployed worker
- [ ] Brief description of customizations made
- [ ] Note any challenges encountered

---

## 🚀 You're Done!

Your L'Oréal Routine Builder is now:
✅ Deployed and live
✅ Secure (API keys in worker)
✅ Intelligent (web search enabled)
✅ Professional (citations displayed)
✅ Branded (L'Oréal colors)
✅ Persistent (localStorage)

**Congratulations!** 🎉💄✨

---

## 📚 Next Steps

Want to enhance further?

1. **Customize Products**
   - Edit products.json with your own products
   - Update images and descriptions

2. **Adjust Styling**
   - Modify colors in style.css
   - Change fonts and layouts

3. **Fine-tune Search**
   - Add more keywords to shouldEnableWebSearch()
   - Adjust number of citations shown

4. **Add Features**
   - Image search for products
   - User accounts and saved routines
   - Share routines via URL
   - Export routine as PDF

5. **Optimize Performance**
   - Cache search results
   - Implement request debouncing
   - Add lazy loading for images

---

**Need help?** Check the other guide files:
- `README.md` - Full documentation
- `QUICK-START.md` - Quick setup
- `WEB-SEARCH-SETUP.md` - Detailed search config
- `ARCHITECTURE-DIAGRAM.md` - System architecture
- `IMPLEMENTATION-COMPLETE.md` - Feature overview

**Happy coding!** 🎨💻
