# Project 9: L'Oréal Routine Builder

L'Oréal is expanding what's possible with AI, and now your chatbot is getting smarter. This week, you'll upgrade it into a product-aware routine builder with **real-time web search capabilities**! 

Users can browse real L'Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor. Plus, the chatbot now searches the web for current beauty trends, reviews, and expert advice with visible citations!

## ✨ Features

### 🛍️ Product Selection
- Browse 35 real L'Oréal brand products (CeraVe, La Roche-Posay, Lancôme, etc.)
- Filter by category (cleanser, moisturizer, serum, makeup, haircare, sunscreen)
- Click to select/unselect products with visual feedback
- View full product descriptions in a modal
- Selected products persist across page reloads (localStorage)

### 🤖 AI-Powered Routines
- Generate personalized beauty routines based on selected products
- Get step-by-step instructions for morning and evening routines
- Ask follow-up questions with full conversation context
- Chat remembers your previous questions and answers

### 🔍 **NEW: Web Search Integration**
- Chatbot searches the web for current beauty information
- Automatic search detection for relevant questions
- Visible citations with links to sources
- Up-to-date trends, reviews, and expert recommendations

### 🎨 L'Oréal Brand Styling
- Official L'Oréal colors (red #ff003b, gold #e3a535)
- Gradient styling throughout
- Smooth animations and transitions
- Responsive design for all devices

### 🔐 Security
- API keys secured in Cloudflare Worker environment
- No sensitive credentials exposed in browser
- CORS properly configured

## 📁 Project Structure

```
09-prj-loreal-routine-builder/
├── index.html              # Main HTML structure
├── script.js               # Application logic & API integration
├── style.css               # L'Oréal brand styling
├── products.json           # 35 L'Oréal products data
├── worker.js               # Cloudflare Worker (API proxy + web search)
├── wrangler.toml           # Worker configuration
├── .dev.vars.example       # Environment variables template
├── .gitignore              # Git ignore rules
├── WEB-SEARCH-SETUP.md     # Web search setup guide
└── img/
    └── loreal-logo.png     # L'Oréal logo
```

## 🚀 Setup Instructions

### Prerequisites
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Brave Search API key ([Get free key](https://brave.com/search/api/))
- Cloudflare account ([Sign up free](https://dash.cloudflare.com/sign-up))
- Node.js and npm installed

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Up Environment Variables

```bash
# Set OpenAI API key
wrangler secret put OPENAI_API_KEY

# Set Brave Search API key (for web search)
wrangler secret put BRAVE_API_KEY
```

When prompted, paste your respective API keys.

### 4. Deploy Cloudflare Worker

```bash
wrangler deploy
```

After deployment, you'll see your worker URL (e.g., `https://loreal-routine-builder.esjohn15.workers.dev/`)

### 5. Update Frontend Configuration

Open `script.js` and update the `WORKER_URL` constant with your actual worker URL:

```javascript
const WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev/";
```

### 6. Open the App

Simply open `index.html` in your web browser. No server needed!

## 🔍 Using Web Search

The chatbot automatically enables web search for questions about:
- Current trends ("What are the latest skincare trends?")
- Product reviews ("What are reviews saying about retinol?")
- Comparisons ("Which is better for dry skin?")
- Expert recommendations ("What do dermatologists recommend?")
- Current information ("What's popular in K-beauty?")

See **WEB-SEARCH-SETUP.md** for detailed setup instructions and customization options.

## 💡 How to Use

1. **Browse Products**: Filter by category or view all products
2. **Select Products**: Click on products to add them to your selection
3. **Generate Routine**: Click "Generate Routine" for AI-powered recommendations
4. **Ask Questions**: Use the chat to ask about products, ingredients, or skincare
5. **Get Current Info**: Ask trend-related questions to trigger web search
6. **View Citations**: Check source links for web-searched information

## 🎓 Learning Objectives

This project teaches:
- **API Integration**: Working with OpenAI GPT-4 and Brave Search APIs
- **Serverless Architecture**: Using Cloudflare Workers as middleware
- **Security**: Protecting API keys with environment variables
- **State Management**: localStorage, conversation history, product selection
- **DOM Manipulation**: Dynamic content, modals, filtering
- **Async/Await**: Handling asynchronous operations
- **Error Handling**: Try-catch blocks and user feedback
- **UX Design**: Visual feedback, loading states, responsive design

## 🔧 Technical Details

### APIs Used
- **OpenAI GPT-4o**: Conversational AI for beauty advice
- **Brave Search API**: Web search for current information

### Key Technologies
- Vanilla JavaScript (ES6+)
- Cloudflare Workers (serverless edge computing)
- localStorage API (data persistence)
- Fetch API (HTTP requests)
- CSS Custom Properties & Gradients

### Security Features
- ✅ API keys stored in Cloudflare environment variables
- ✅ No credentials exposed to browser
- ✅ CORS headers properly configured
- ✅ Encrypted secrets in production

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Brave Search API Docs](https://brave.com/search/api/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Web Search Setup Guide](./WEB-SEARCH-SETUP.md)

## 🎨 Customization

### Change Product Data
Edit `products.json` to add/remove/modify products

### Adjust Search Sensitivity
Edit `shouldEnableWebSearch()` in `script.js` to customize when web search triggers

### Modify Styling
Update CSS custom properties in `style.css`:
```css
--loreal-red: #ff003b;
--loreal-gold: #e3a535;
```

### Change Citation Count
Edit `worker.js` to show more/fewer search results:
```javascript
return data.web.results.slice(0, 5) // Change 5 to desired count
```

## 🐛 Troubleshooting

### Chat not responding?
- Check that worker is deployed: `wrangler deploy`
- Verify API keys are set: Check Cloudflare dashboard
- Check browser console for errors

### Web search not working?
- Verify Brave API key is set: `wrangler secret put BRAVE_API_KEY`
- Check Brave API quota in dashboard
- Try questions with keywords like "trend", "best", "review"

### Products not persisting?
- Check browser's localStorage is enabled
- Clear cache and reload if needed

## 📝 License

This is a student project for educational purposes.

---

**Built with ❤️ for L'Oréal beauty enthusiasts**
oject 9: L'Oréal Routine Builder
L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder. 

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.