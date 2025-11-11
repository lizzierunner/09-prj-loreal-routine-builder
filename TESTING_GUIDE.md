# Testing the "Generate Routine" Feature

## ✅ Complete Testing Guide

### Prerequisites:
1. Add your OpenAI API key to `secrets.js`
2. Open `index.html` in a browser
3. Open browser console (F12) to see debug logs

---

## 📋 Step-by-Step Test

### Step 1: Verify Initial State
- [ ] Button shows: "Generate Routine"
- [ ] Selected products list shows: "No products selected yet..."
- [ ] Chat window is empty or has welcome message

### Step 2: Select Products
1. Choose a category from dropdown (e.g., "Cleansers")
2. Click on a product card (e.g., "CeraVe Foaming Facial Cleanser")

**Expected Results:**
- [ ] Product card gets thick black border
- [ ] Product card gets light gray background
- [ ] Checkmark (✓) appears in top-right corner
- [ ] Product chip appears in "Selected Products" section
- [ ] Button text updates to: "Generate Routine (1 product)"

### Step 3: Select More Products
1. Switch to another category (e.g., "Moisturizers & Treatments")
2. Click on 2 more products

**Expected Results:**
- [ ] Previously selected product stays selected
- [ ] New products show selected state
- [ ] All products appear as chips
- [ ] Button shows: "Generate Routine (3 products)"

### Step 4: Generate Routine
1. Click the "Generate Routine" button

**Expected Results:**
- [ ] User message appears in chat: "Generate a routine using my 3 selected products"
- [ ] Loading indicator appears: "Thinking..."
- [ ] Console shows: "Generating routine for selected products: [array]"
- [ ] Console shows: "Sending 3 product(s) to OpenAI: [names]"

### Step 5: Receive AI Response
Wait for OpenAI API response (2-10 seconds)

**Expected Results:**
- [ ] Loading indicator disappears
- [ ] AI message appears in chat window
- [ ] Response is formatted with clear steps
- [ ] Response mentions the selected products by name
- [ ] Response includes morning/evening routine sections
- [ ] Response explains how to use each product
- [ ] Console shows: "Routine generated successfully!"
- [ ] Chat auto-scrolls to show new message

### Step 6: Verify Routine Quality
Read the AI-generated routine

**Check for:**
- [ ] Products are in logical order (cleanser → treatment → moisturizer → SPF)
- [ ] Each product has usage instructions
- [ ] Morning vs. evening recommendations are appropriate
- [ ] Application tips are specific to each product
- [ ] Benefits are explained for each product

---

## 🧪 Advanced Tests

### Test: Remove a Product After Generation
1. Click × on one of the product chips
2. Click "Generate Routine" again

**Expected:**
- [ ] Routine only includes remaining products
- [ ] Button text updates to show correct count

### Test: Generate with Different Product Combinations

**Cleanser Only:**
- [ ] AI provides simple cleansing routine

**Full Routine (Cleanser + Serum + Moisturizer + SPF):**
- [ ] AI provides complete morning/evening routine
- [ ] Products in correct order
- [ ] Timing recommendations (AM/PM)

**Hair Products:**
- [ ] AI provides hair care routine
- [ ] Different instructions than skincare

---

## 🐛 Error Scenarios to Test

### Test: No Products Selected
1. Click "Generate Routine" with 0 products

**Expected:**
- [ ] Message appears: "Please select at least one product to generate a routine."
- [ ] No API call is made
- [ ] No loading indicator appears

### Test: Invalid API Key
1. Set `apiKey = "invalid"` in secrets.js
2. Select products and click "Generate Routine"

**Expected:**
- [ ] Loading indicator appears
- [ ] Error message appears after API response
- [ ] Console shows error details
- [ ] Error message: "Sorry, I encountered an error..."

### Test: Network Error
1. Disconnect internet
2. Click "Generate Routine"

**Expected:**
- [ ] Error is caught gracefully
- [ ] User-friendly error message appears
- [ ] Console shows network error

---

## 📊 Verify Data Flow

### Check Browser Console For:

**When clicking "Generate Routine":**
```
Generating routine for selected products: (3) [{...}, {...}, {...}]
Sending 3 product(s) to OpenAI: (3) ["Foaming Facial Cleanser", ...]
Sending request to OpenAI API...
Routine generated successfully!
```

**If error occurs:**
```
Error generating routine: Error: [error details]
OpenAI API Error Response: {error: {...}}
```

### Check Network Tab (F12 → Network):

**Request to:**
```
https://api.openai.com/v1/chat/completions
```

**Request Payload Should Include:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful L'Oréal beauty advisor...\n\nThe customer has selected the following products:\n- CeraVe Foaming Facial Cleanser: Gentle gel cleanser..."
    },
    {
      "role": "user",
      "content": "Based on the 3 products I've selected, please create a personalized beauty routine..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1500
}
```

**Response Should Be:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Morning Routine:\n\n1. **CeraVe Foaming Facial Cleanser**..."
      }
    }
  ]
}
```

---

## ✨ Success Criteria

The feature is working correctly when:

1. ✅ Selected products are sent to OpenAI API
2. ✅ Product details (brand, name, description) are included
3. ✅ AI response is personalized to those specific products
4. ✅ Response is displayed in chat window
5. ✅ Multiple products are organized logically
6. ✅ Error handling works for all failure cases
7. ✅ UI updates appropriately at each step
8. ✅ Console logs help with debugging

---

## 🎯 Example Output

### With 3 Selected Products:

**User Message:**
> Generate a routine using my 3 selected products

**AI Response:**
> **Your Personalized CeraVe Routine**
>
> **Morning Routine:**
> 
> 1. **CeraVe Foaming Facial Cleanser**
>    - Wet your face with lukewarm water
>    - Apply a dime-sized amount and massage gently for 30 seconds
>    - Rinse thoroughly and pat dry
>    - *Benefits:* Removes oil and impurities without stripping your skin barrier
> 
> 2. **CeraVe Moisturizing Cream**
>    - Apply to slightly damp skin using upward strokes
>    - Focus on dry areas
>    - *Benefits:* Provides 24-hour hydration with ceramides and hyaluronic acid
> 
> 3. **CeraVe AM Facial Moisturizing Lotion SPF 30**
>    - Apply as your final step, at least 15 minutes before sun exposure
>    - Use a nickel-sized amount for full face coverage
>    - *Benefits:* Protects against UVA/UVB damage while hydrating
>
> **Evening Routine:**
> 
> 1. **CeraVe Foaming Facial Cleanser** (same as morning)
> 2. **CeraVe Moisturizing Cream** (same as morning, but use a slightly thicker layer)
>
> **Pro Tips:**
> - Always cleanse before applying other products
> - Apply products from thinnest to thickest consistency
> - Don't skip SPF even on cloudy days!

This complete, personalized routine is generated based on the actual products selected! 🌟
