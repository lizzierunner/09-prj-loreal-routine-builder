# Generate Routine Feature Guide

## 🎯 How "Generate Routine" Works

### Complete Flow:

```
User clicks "Generate Routine" button
           ↓
generateRoutine() function is called
           ↓
Validates: Are products selected?
           ↓
   NO → Show message: "Please select at least one product"
   YES → Continue...
           ↓
Creates detailed prompt asking for routine
           ↓
Adds user message to chat window
           ↓
Shows "Thinking..." loading indicator
           ↓
sendToOpenAI(prompt, includeProducts=true)
           ↓
Builds system message with ALL selected products
           ↓
Sends to OpenAI API with product data
           ↓
Receives AI-generated personalized routine
           ↓
Removes loading indicator
           ↓
Displays routine in chat window
```

## 📦 What Data Gets Sent to OpenAI

### System Message (Context):
```
You are a helpful L'Oréal beauty advisor...

The customer has selected the following products:
- [Brand] [Product Name]: [Full Description]
- [Brand] [Product Name]: [Full Description]
- ... (all selected products)
```

### User Message (Prompt):
```
Based on the X products I've selected, please create a personalized beauty routine for me.

For each product, explain:
1. When to use it (morning, night, or both)
2. How to apply it
3. What step it should be in the routine
4. Any special tips or benefits

Format the response as a clear, numbered step-by-step routine I can follow daily.
```

## 🔍 Example Request to OpenAI

### If user selected 3 products:

**System Message Includes:**
```
- CeraVe Foaming Facial Cleanser: Gentle gel cleanser with ceramides...
- CeraVe Moisturizing Cream: Rich, velvety cream for face and body...
- CeraVe AM Facial Moisturizing Lotion SPF 30: Oil-free daily lotion...
```

**API Request:**
```javascript
{
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are a helpful L'Oréal beauty advisor... [INCLUDES PRODUCT DATA]"
    },
    {
      role: "user",
      content: "Based on the 3 products I've selected, please create..."
    }
  ],
  temperature: 0.7,
  max_tokens: 1500
}
```

## ✨ What The AI Returns

The AI analyzes the selected products and generates:

### Example Output:
```
Morning Routine:

1. **CeraVe Foaming Facial Cleanser**
   - Wet your face and apply a dime-sized amount
   - Gently massage in circular motions for 30 seconds
   - Rinse thoroughly with lukewarm water
   
2. **CeraVe Moisturizing Cream**
   - Apply to slightly damp skin
   - Use gentle upward strokes
   - Focus on dry areas
   
3. **CeraVe AM Facial Moisturizing Lotion SPF 30**
   - Apply as the final step
   - Use at least a nickel-sized amount
   - Protects skin throughout the day

Evening Routine:
[Similar detailed steps for night use]
```

## 💻 Code Implementation

### Key Functions:

**1. generateRoutine()**
```javascript
- Validates product selection
- Creates detailed prompt
- Calls sendToOpenAI with includeProducts=true
- Handles display and errors
```

**2. sendToOpenAI(userMessage, includeProducts)**
```javascript
- Builds system message
- If includeProducts=true, adds ALL selected product details
- Sends POST request to OpenAI API
- Returns AI response text
```

**3. addMessage(text, isUser)**
```javascript
- Creates message div
- Adds to chat window
- Auto-scrolls to show new message
```

**4. showLoading() / removeLoading()**
```javascript
- Shows/hides "Thinking..." indicator
- Gives visual feedback during API call
```

## 🐛 Debugging Features

### Console Logs:
```javascript
console.log("Generating routine for selected products:", selectedProducts);
console.log(`Sending ${selectedProducts.length} product(s) to OpenAI:`, ...);
console.log("Routine generated successfully!");
console.error("OpenAI API Error Response:", data);
```

### Error Handling:
- Validates products are selected
- Catches network errors
- Catches API errors (invalid key, rate limits)
- Shows user-friendly error messages
- Logs detailed errors to console

## 🧪 Testing Checklist

### Test Case 1: No Products Selected
1. Click "Generate Routine" with 0 products
2. ✅ Should show: "Please select at least one product to generate a routine."

### Test Case 2: Single Product
1. Select 1 product (e.g., cleanser)
2. Click "Generate Routine"
3. ✅ Should show: "Generate a routine using my 1 selected product"
4. ✅ Should show: "Thinking..."
5. ✅ Should receive routine with that product's usage instructions

### Test Case 3: Multiple Products
1. Select 3+ products (cleanser, moisturizer, serum)
2. Click "Generate Routine"
3. ✅ Should show: "Generate a routine using my X selected products"
4. ✅ Should receive organized morning/evening routine
5. ✅ Products should be in logical order (cleanse → treat → moisturize)

### Test Case 4: API Error
1. Use invalid API key or disconnect internet
2. Click "Generate Routine"
3. ✅ Should show error message
4. ✅ Should log error to console

## 📊 What Makes This "Smart"

1. **Context-Aware** - AI knows exact products user selected
2. **Product Details** - Full descriptions sent to AI for better recommendations
3. **Personalized** - Routine created specifically for those products
4. **Logical Ordering** - AI organizes products in proper skincare order
5. **Time-Based** - Separates morning vs. evening steps
6. **Educational** - Explains WHY and HOW to use each product

## 🔐 Security Notes

- API key stored in `secrets.js`
- Never commit `secrets.js` to git
- All requests use HTTPS
- No user data stored permanently

## 🎓 Student Learning Points

1. **Async/Await** - Handles API calls without blocking
2. **Array Methods** - Uses `.map()` to format product data
3. **Template Literals** - Builds dynamic prompts
4. **Error Handling** - try/catch for robust code
5. **DOM Manipulation** - Updates UI based on API response
6. **Event Listeners** - Button click triggers entire flow
7. **Data Flow** - selectedProducts → API → UI display
