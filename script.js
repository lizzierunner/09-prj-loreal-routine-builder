/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const searchInfo = document.getElementById("searchInfo");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const userInput = document.getElementById("userInput");
const clearChatBtn = document.getElementById("clearChat");
const languageToggleBtn = document.getElementById("languageToggle");

/* Cloudflare Worker URL for secure OpenAI API requests */
const WORKER_URL = "https://loreal-routine-builder.esjohn15.workers.dev/";

/* Array to store selected products */
let selectedProducts = [];

/* Array to store all products loaded from JSON */
let allProducts = [];

/* Array to store conversation history for context in follow-up questions */
let conversationHistory = [];

/* Store current filter state */
let currentSearchTerm = "";
let currentCategory = "";

/* LocalStorage keys for persistence */
const STORAGE_KEY_PRODUCTS = "loreal_selected_products";
const STORAGE_KEY_CONVERSATION = "loreal_conversation_history";
const STORAGE_KEY_LANGUAGE = "loreal_language_direction";

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(selectedProducts));
    console.log(`Saved ${selectedProducts.length} product(s) to localStorage`);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/* Load selected products from localStorage */
function loadSelectedProductsFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      selectedProducts = JSON.parse(saved);
      console.log(`Loaded ${selectedProducts.length} product(s) from localStorage`);
      displaySelectedProducts();
      updateProductCardStates();
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    selectedProducts = [];
  }
}

/* Clear all selected products */
function clearAllProducts() {
  selectedProducts = [];
  localStorage.removeItem(STORAGE_KEY_PRODUCTS);
  displaySelectedProducts();
  updateProductCardStates();
  console.log("All products cleared");
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <span class="category-badge category-${product.category}">${product.category}</span>
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        ${product.rating ? `
        <div class="product-rating">
          <span class="stars">
            ${generateStars(product.rating)}
          </span>
          <span class="rating-number">${product.rating}</span>
          ${product.reviewCount ? `<span class="review-count">(${product.reviewCount.toLocaleString()})</span>` : ''}
          ${product.price ? `<span class="price">$${product.price}</span>` : ''}
        </div>
        ` : ''}
        <button class="info-btn" onclick="showProductDetails(${product.id})" aria-label="View details for ${product.name}">
          <i class="fa-solid fa-info-circle"></i> Details
        </button>
      </div>
    </div>
  `
    )
    .join("");

  /* Add click event listeners to product cards after they're created */
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      /* Don't toggle selection if clicking the info button */
      if (!e.target.closest('.info-btn')) {
        toggleProductSelection(card);
      }
    });
  });

  /* Re-apply selected state to cards that are already selected */
  updateProductCardStates();
}

/* Generate star rating display */
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star">★</span>';
  }
  
  // Half star
  if (hasHalfStar) {
    stars += '<span class="star">★</span>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star" style="opacity: 0.3;">★</span>';
  }
  
  return stars;
}

/* Toggle product selection when a card is clicked */
function toggleProductSelection(card) {
  const productId = parseInt(card.dataset.productId);
  const product = allProducts.find((p) => p.id === productId);

  /* Check if product is already selected */
  const existingIndex = selectedProducts.findIndex((p) => p.id === productId);

  if (existingIndex === -1) {
    /* Add product to selected array */
    selectedProducts.push(product);
    card.classList.add("selected");
  } else {
    /* Remove product from selected array */
    selectedProducts.splice(existingIndex, 1);
    card.classList.remove("selected");
  }

  /* Update the selected products display */
  displaySelectedProducts();
  
  /* Save to localStorage for persistence */
  saveSelectedProductsToStorage();
}

/* Display selected products as chips with remove buttons */
function displaySelectedProducts() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <p class="empty-message">No products selected yet. Click on products above to add them.</p>
    `;
    /* Update button text when no products selected */
    generateRoutineBtn.innerHTML = `
      <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine
    `;
    /* Hide cost summary */
    document.getElementById('costSummary').style.display = 'none';
    return;
  }

  /* Create chips for each selected product with drag & drop support */
  const chipsHTML = selectedProducts
    .map(
      (product, index) => `
    <div class="selected-product-chip" draggable="true" data-product-id="${product.id}" data-index="${index}">
      <span class="drag-handle" title="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span>
      <span class="product-name">${product.name}</span>
      <button onclick="removeProduct(${product.id})" aria-label="Remove ${product.name}">
        ×
      </button>
    </div>
  `
    )
    .join("");

  /* Add Clear All button */
  const clearAllBtn = `
    <button onclick="clearAllProducts()" class="clear-all-btn" title="Clear all selected products">
      <i class="fa-solid fa-trash-can"></i> Clear All
    </button>
  `;

  /* Combine chips and clear button */
  selectedProductsList.innerHTML = chipsHTML + clearAllBtn;

  /* Update button text to show number of selected products */
  generateRoutineBtn.innerHTML = `
    <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine (${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''})
  `;
  
  /* Calculate and display cost summary */
  calculateRoutineCost();
  
  /* Show/hide shopping list button */
  updateShoppingListButton();
}

/* Calculate and display routine cost */
function calculateRoutineCost() {
  const costSummary = document.getElementById('costSummary');
  const totalCostEl = document.getElementById('totalCost');
  const avgCostEl = document.getElementById('avgCost');
  const monthlyCostEl = document.getElementById('monthlyCost');
  const budgetTipEl = document.getElementById('budgetTip');
  
  /* Calculate total cost */
  let totalCost = 0;
  let productsWithPrice = 0;
  
  selectedProducts.forEach(product => {
    if (product.price) {
      totalCost += product.price;
      productsWithPrice++;
    }
  });
  
  /* If no products have prices, hide the summary */
  if (productsWithPrice === 0) {
    costSummary.style.display = 'none';
    return;
  }
  
  /* Show cost summary */
  costSummary.style.display = 'block';
  
  /* Calculate averages */
  const avgCost = totalCost / productsWithPrice;
  const monthlyCost = totalCost / 3; // Assume products last ~3 months
  
  /* Update display */
  totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
  avgCostEl.textContent = `$${avgCost.toFixed(2)}`;
  monthlyCostEl.textContent = `$${monthlyCost.toFixed(2)}`;
  
  /* Generate budget tip */
  let tipHTML = '';
  if (totalCost < 50) {
    tipHTML = '<i class="fa-solid fa-piggy-bank"></i> Great budget-friendly routine! You\'re investing wisely in your skin.';
    budgetTipEl.className = 'budget-tip';
  } else if (totalCost < 100) {
    tipHTML = '<i class="fa-solid fa-star"></i> Balanced routine with quality products at a reasonable price point.';
    budgetTipEl.className = 'budget-tip';
  } else if (totalCost < 150) {
    tipHTML = '<i class="fa-solid fa-sparkles"></i> Premium routine! These products offer advanced formulations and results.';
    budgetTipEl.className = 'budget-tip';
  } else {
    tipHTML = '<i class="fa-solid fa-crown"></i> Luxury routine! Consider checking for travel sizes to try products first.';
    budgetTipEl.className = 'budget-tip warning';
  }
  
  budgetTipEl.innerHTML = tipHTML;
}

/* Remove a product from the selected products list */
function removeProduct(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  displaySelectedProducts();
  updateProductCardStates();
  
  /* Save to localStorage after removal */
  saveSelectedProductsToStorage();
}

/* Update visual state of product cards based on selection */
function updateProductCardStates() {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    const productId = parseInt(card.dataset.productId);
    const isSelected = selectedProducts.some((p) => p.id === productId);

    if (isSelected) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

/* Filter products based on search and category */
function filterProducts() {
  const searchTerm = currentSearchTerm.toLowerCase();
  const category = currentCategory;
  
  /* Start with all products */
  let filteredProducts = allProducts;
  
  /* Apply category filter if selected */
  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === category
    );
  }
  
  /* Apply natural language search filter if there's a search term */
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      return naturalLanguageMatch(product, searchTerm);
    });
  }
  
  /* Update search info */
  updateSearchInfo(filteredProducts.length, searchTerm, category);
  
  /* Display the filtered products */
  displayProducts(filteredProducts);
}

/* Update search info message */
function updateSearchInfo(count, searchTerm, category) {
  if (!searchTerm && !category) {
    searchInfo.classList.remove('visible');
    return;
  }
  
  let message = `Found <strong>${count}</strong> product${count !== 1 ? 's' : ''}`;
  
  if (searchTerm && category) {
    message += ` matching "<strong>${searchTerm}</strong>" in category "<strong>${getCategoryName(category)}</strong>"`;
  } else if (searchTerm) {
    message += ` matching "<strong>${searchTerm}</strong>"`;
  } else if (category) {
    message += ` in category "<strong>${getCategoryName(category)}</strong>"`;
  }
  
  searchInfo.innerHTML = message;
  searchInfo.classList.add('visible');
}

/* Get friendly category name */
function getCategoryName(value) {
  const categoryMap = {
    'cleanser': 'Cleansers',
    'moisturizer': 'Moisturizers & Treatments',
    'haircare': 'Haircare',
    'makeup': 'Makeup',
    'hair color': 'Hair Color',
    'hair styling': 'Hair Styling',
    "men's grooming": "Men's Grooming",
    'suncare': 'Suncare',
    'fragrance': 'Fragrance'
  };
  return categoryMap[value] || value;
}

/* Real-time product search */
productSearch.addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.trim();
  
  /* Show/hide clear button */
  if (currentSearchTerm) {
    clearSearchBtn.classList.add('visible');
  } else {
    clearSearchBtn.classList.remove('visible');
  }
  
  /* Filter products in real-time */
  filterProducts();
});

/* Clear search */
clearSearchBtn.addEventListener("click", () => {
  productSearch.value = "";
  currentSearchTerm = "";
  clearSearchBtn.classList.remove('visible');
  filterProducts();
  productSearch.focus();
});

/* Category filter */
categoryFilter.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  filterProducts();
});

/* Add a message to the chat window */
function addMessage(text, isUser = false, searchResults = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "message user-message" : "message ai-message";
  messageDiv.innerHTML = text;
  chatWindow.appendChild(messageDiv);

  /* If there are search results (citations), display them */
  if (searchResults && searchResults.length > 0) {
    const citationsDiv = document.createElement("div");
    citationsDiv.className = "citations";
    citationsDiv.innerHTML = `
      <div class="citations-header">
        <i class="fas fa-link"></i> Sources:
      </div>
      <div class="citations-list">
        ${searchResults.map((result, index) => `
          <div class="citation-item">
            <span class="citation-number">[${index + 1}]</span>
            <a href="${result.url}" target="_blank" rel="noopener noreferrer">
              <strong>${result.title}</strong>
              <p>${result.description}</p>
            </a>
          </div>
        `).join('')}
      </div>
    `;
    chatWindow.appendChild(citationsDiv);
  }

  /* Scroll to bottom of chat window */
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Show loading indicator in chat */
function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading";
  loadingDiv.textContent = "Thinking...";
  loadingDiv.id = "loading-message";
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Remove loading indicator */
function removeLoading() {
  const loadingDiv = document.getElementById("loading-message");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/* Send a message to OpenAI via Cloudflare Worker (secure - no API key exposed) */
async function sendToOpenAI(userMessage, includeProducts = false, enableWebSearch = false) {
  /* Build the system message with personality and product context if needed */
  let systemMessage = getPersonalityPrompt() + ` You help customers understand L'Oréal products, answer questions about skincare and beauty, and provide personalized recommendations. You remember the conversation context and can answer follow-up questions naturally.`;

  if (includeProducts && selectedProducts.length > 0) {
    /* Add detailed product information to the system message
       This gives the AI context about which products the user selected */
    const productDetails = selectedProducts
      .map((p) => `- ${p.brand} ${p.name}: ${p.description}`)
      .join("\n");
    
    systemMessage += `\n\nThe customer has selected the following products:\n${productDetails}`;
    
    console.log(`Sending ${selectedProducts.length} product(s) to AI:`, selectedProducts.map(p => p.name));
  }

  /* Create the messages array for the API request
     Start with system message, then add conversation history, then new user message */
  const messages = [
    { role: "system", content: systemMessage },
    ...conversationHistory, // Include all previous messages for context
    { role: "user", content: userMessage },
  ];

  console.log(`Sending ${conversationHistory.length / 2} previous exchanges for context`);
  if (enableWebSearch) {
    console.log('Web search enabled for current information');
  }

  /* Make request to Cloudflare Worker (which routes to OpenAI or Mistral)
     OpenAI for standard chat, Mistral for web search
     NO API KEYS are exposed in the browser! */
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o", // Used when routing to OpenAI
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      enableWebSearch: enableWebSearch, // If true, uses Mistral; if false, uses OpenAI
    }),
  });

  const data = await response.json();

  /* Check if we got a valid response */
  if (data.choices && data.choices[0] && data.choices[0].message) {
    const aiResponse = data.choices[0].message.content;
    
    /* Add user message and AI response to conversation history
       This allows the AI to remember context in future messages */
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: aiResponse });
    
    console.log(`Conversation history now has ${conversationHistory.length / 2} exchanges`);
    
    /* Return both the response and any search results */
    return {
      response: aiResponse,
      searchResults: data.searchResults || null
    };
  } else {
    /* Log the full error response for debugging */
    console.error("API Error Response:", data);
    throw new Error(data.error?.message || "Invalid response from API");
  }
}

/* Generate a personalized routine based on selected products */
async function generateRoutine() {
  /* Validation: Check if any products are selected */
  if (selectedProducts.length === 0) {
    addMessage("Please select at least one product to generate a routine.");
    return;
  }

  /* Log selected products for debugging */
  console.log("Generating routine for selected products:", selectedProducts);

  /* Create a detailed prompt for routine generation */
  const routinePrompt = `Based on the ${selectedProducts.length} products I've selected, please create a personalized beauty routine for me. 

For each product, explain:
1. When to use it (morning, night, or both)
2. How to apply it
3. What step it should be in the routine
4. Any special tips or benefits

Format the response as a clear, numbered step-by-step routine I can follow daily. Use headings for "Morning Routine" and "Evening Routine" if applicable.`;

  /* Add user's request message to chat */
  addMessage(
    `Generate a routine using my ${selectedProducts.length} selected product${
      selectedProducts.length > 1 ? "s" : ""
    }`,
    true
  );
  
  /* Show loading indicator while waiting for API response */
  showLoading();

  try {
    /* Send request to OpenAI with selected products context
       includeProducts = true means the system message will include
       all selected product details (brand, name, description)
       enableWebSearch = false for routine generation (use OpenAI for quality) */
    console.log("Sending request to OpenAI API for routine generation...");
    const result = await sendToOpenAI(routinePrompt, true, false);
    
    /* Remove loading indicator and display the AI's routine */
    removeLoading();
    addMessage(result.response, false, result.searchResults);
    console.log("Routine generated successfully!");
    
    /* Track analytics */
    trackRoutineGeneration();
    
    /* Generate results timeline prediction */
    generateResultsTimeline();
    
    /* Check if this is the user's first routine and celebrate! */
    const isFirstRoutine = !localStorage.getItem('hasGeneratedRoutine');
    if (isFirstRoutine) {
      localStorage.setItem('hasGeneratedRoutine', 'true');
      setTimeout(() => {
        showConfetti();
        addMessage("🎉 Congratulations on creating your first personalized routine! You're on your way to amazing skin!");
      }, 500);
    }
  } catch (error) {
    /* Handle errors (e.g., invalid API key, network issues) */
    removeLoading();
    addMessage(
      "Sorry, I encountered an error generating your routine. Please check your API key and try again."
    );
    console.error("Error generating routine:", error);
  }
}

/* Chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  /* Add user message to chat window */
  addMessage(message, true);

  /* Clear input field */
  userInput.value = "";

  /* Show loading indicator */
  showLoading();

  try {
    /* Send message to OpenAI with product context if products are selected
       Enable web search for questions about trends, reviews, or current info */
    const includeProducts = selectedProducts.length > 0;
    const enableWebSearch = shouldEnableWebSearch(message);
    
    if (enableWebSearch) {
      console.log('Web search enabled for this query');
    }
    
    const result = await sendToOpenAI(message, includeProducts, enableWebSearch);

    /* Remove loading and show AI response with citations if available */
    removeLoading();
    addMessage(result.response, false, result.searchResults);
  } catch (error) {
    removeLoading();
    addMessage(
      "Sorry, I encountered an error. Please check your API key and try again."
    );
    console.error("Error:", error);
  }
});

/* Determine if web search should be enabled based on user's question */
function shouldEnableWebSearch(message) {
  /* Enable web search for questions about current trends, reviews, news, etc. */
  const searchKeywords = [
    'trend', 'trending', 'popular', 'best', 'review', 'reviews',
    'latest', 'new', 'current', 'recent', 'news', 'compare',
    'vs', 'versus', 'better', 'recommended', 'recommend',
    'what are', 'what is', 'how to', 'should i', 'which'
  ];
  
  const lowerMessage = message.toLowerCase();
  return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}

/* Generate routine button click handler */
generateRoutineBtn.addEventListener("click", generateRoutine);

/* Clear chat history function */
function clearChat() {
  /* Reset conversation history array */
  conversationHistory = [];
  
  /* Clear chat window */
  chatWindow.innerHTML = "";
  
  /* Add confirmation message */
  const confirmDiv = document.createElement("div");
  confirmDiv.className = "message ai-message";
  confirmDiv.style.fontStyle = "italic";
  confirmDiv.style.opacity = "0.7";
  confirmDiv.textContent = "Chat cleared. Start a new conversation!";
  chatWindow.appendChild(confirmDiv);
  
  console.log("Conversation history cleared");
}

/* Clear chat button click handler */
clearChatBtn.addEventListener("click", clearChat);

/* Show product details in modal */
function showProductDetails(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  /* Create modal HTML */
  const modalHTML = `
    <div class="modal-overlay" id="productModal" onclick="closeProductModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeProductModal()" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
        <div class="modal-header">
          <img src="${product.image}" alt="${product.name}" class="modal-image">
          <div class="modal-title-section">
            <h2>${product.name}</h2>
            <p class="modal-brand">${product.brand}</p>
            <span class="modal-category">${product.category}</span>
            ${product.rating ? `
            <div class="product-rating">
              <span class="stars">${generateStars(product.rating)}</span>
              <span class="rating-number">${product.rating}</span>
              ${product.reviewCount ? `<span class="review-count">(${product.reviewCount.toLocaleString()} reviews)</span>` : ''}
              ${product.price ? `<span class="price">$${product.price}</span>` : ''}
            </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-body">
          <h3>Product Description</h3>
          <p>${product.description}</p>
          ${product.ingredients ? `
          <h3><i class="fa-solid fa-flask"></i> Key Ingredients</h3>
          ${analyzeIngredients(product.ingredients)}
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="modal-select-btn" onclick="selectProductFromModal(${product.id})">
            <i class="fa-solid fa-plus-circle"></i> Add to Routine
          </button>
          <button class="modal-cancel-btn" onclick="closeProductModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  /* Add modal to body */
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  /* Prevent body scroll when modal is open */
  document.body.style.overflow = 'hidden';
  
  console.log(`Showing details for: ${product.name}`);
}

/* Close product details modal */
function closeProductModal(event) {
  /* Only close if clicking overlay, not if clicking inside modal */
  if (event && event.target.closest('.modal-content')) {
    return;
  }
  
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.remove();
  }
  
  /* Restore body scroll */
  document.body.style.overflow = 'auto';
}

/* Select product from modal */
function selectProductFromModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  /* Check if product is already selected */
  const existingIndex = selectedProducts.findIndex((p) => p.id === productId);

  if (existingIndex === -1) {
    /* Add product to selected array */
    selectedProducts.push(product);
    displaySelectedProducts();
    updateProductCardStates();
    saveSelectedProductsToStorage();
    
    /* Close modal */
    closeProductModal();
    
    /* Show confirmation in chat or as toast */
    console.log(`Added ${product.name} to routine`);
  } else {
    /* Product already selected - show message */
    alert('This product is already in your routine!');
  }
}

/* Close modal with Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});

/* Initialize application - Load saved data and display */
async function initializeApp() {
  /* Load all products from JSON first */
  allProducts = await loadProducts();
  console.log(`Loaded ${allProducts.length} products from JSON`);
  
  /* Display all products initially */
  displayProducts(allProducts);
  
  /* Load selected products from localStorage */
  loadSelectedProductsFromStorage();
  
  /* Display selected products (will show empty state or loaded products) */
  displaySelectedProducts();
  
  /* Load language direction preference */
  loadLanguagePreference();
}

/* Language Toggle Functionality */
function toggleLanguage() {
  const html = document.documentElement;
  const currentDir = html.getAttribute('dir') || 'ltr';
  const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
  
  /* Update HTML direction attribute */
  html.setAttribute('dir', newDir);
  
  /* Update language toggle button text */
  const languageText = document.getElementById('languageText');
  if (languageText) {
    languageText.textContent = newDir === 'rtl' ? 'English' : 'العربية';
  }
  
  /* Save preference to localStorage */
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, newDir);
    console.log(`Language direction changed to ${newDir.toUpperCase()}`);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
}

/* Load language direction preference from localStorage */
function loadLanguagePreference() {
  try {
    const savedDir = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (savedDir && (savedDir === 'rtl' || savedDir === 'ltr')) {
      const html = document.documentElement;
      html.setAttribute('dir', savedDir);
      
      /* Update button text */
      const languageText = document.getElementById('languageText');
      if (languageText) {
        languageText.textContent = savedDir === 'rtl' ? 'English' : 'العربية';
      }
      
      console.log(`Loaded language direction: ${savedDir.toUpperCase()}`);
    }
  } catch (error) {
    console.error("Error loading language preference:", error);
  }
}

/* Add event listener to language toggle button */
if (languageToggleBtn) {
  languageToggleBtn.addEventListener('click', toggleLanguage);
}

/* ========================================
   🌙 DARK MODE FUNCTIONALITY
   ======================================== */

const darkModeToggleBtn = document.getElementById('darkModeToggle');
const STORAGE_KEY_DARK_MODE = 'loreal_dark_mode';

/* Toggle dark mode */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  
  /* Update icon */
  const icon = darkModeToggleBtn.querySelector('i');
  if (icon) {
    icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  
  /* Save preference */
  try {
    localStorage.setItem(STORAGE_KEY_DARK_MODE, isDark ? 'enabled' : 'disabled');
    console.log(`Dark mode ${isDark ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error("Error saving dark mode preference:", error);
  }
}

/* Load dark mode preference */
function loadDarkModePreference() {
  try {
    const savedMode = localStorage.getItem(STORAGE_KEY_DARK_MODE);
    if (savedMode === 'enabled') {
      document.body.classList.add('dark-mode');
      const icon = darkModeToggleBtn.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-sun';
      }
      console.log('Dark mode loaded from preferences');
    }
  } catch (error) {
    console.error("Error loading dark mode preference:", error);
  }
}

/* Add event listener */
if (darkModeToggleBtn) {
  darkModeToggleBtn.addEventListener('click', toggleDarkMode);
}

/* ========================================
   💝 FAVORITES FUNCTIONALITY
   ======================================== */

const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesContainer = document.getElementById('favoritesContainer');
const favoritesCountBadge = document.getElementById('favoritesCount');
const STORAGE_KEY_FAVORITES = 'loreal_favorites';

let favoriteProducts = [];

/* Load favorites from localStorage */
function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (saved) {
      favoriteProducts = JSON.parse(saved);
      updateFavoritesCount();
    }
  } catch (error) {
    console.error("Error loading favorites:", error);
    favoriteProducts = [];
  }
}

/* Save favorites to localStorage */
function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteProducts));
    updateFavoritesCount();
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
}

/* Toggle favorite status */
function toggleFavorite(productId) {
  const index = favoriteProducts.indexOf(productId);
  if (index > -1) {
    favoriteProducts.splice(index, 1);
  } else {
    favoriteProducts.push(productId);
  }
  saveFavorites();
  updateFavoriteButtons();
}

/* Update favorite button states */
function updateFavoriteButtons() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const productId = parseInt(card.dataset.productId);
    let favoriteBtn = card.querySelector('.favorite-btn');
    
    /* Create favorite button if it doesn't exist */
    if (!favoriteBtn) {
      favoriteBtn = document.createElement('button');
      favoriteBtn.className = 'favorite-btn';
      favoriteBtn.setAttribute('aria-label', 'Add to favorites');
      favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      favoriteBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(productId);
      };
      card.appendChild(favoriteBtn);
    }
    
    /* Update button state */
    const isFavorite = favoriteProducts.includes(productId);
    favoriteBtn.classList.toggle('active', isFavorite);
    const icon = favoriteBtn.querySelector('i');
    if (icon) {
      icon.className = isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
  });
}

/* Update favorites count badge */
function updateFavoritesCount() {
  if (favoritesCountBadge) {
    favoritesCountBadge.textContent = favoriteProducts.length;
    favoritesCountBadge.style.display = favoriteProducts.length > 0 ? 'flex' : 'none';
  }
}

/* Show favorites modal */
function showFavorites() {
  if (!favoritesModal) return;
  
  const favoriteProductsList = allProducts.filter(p => favoriteProducts.includes(p.id));
  
  if (favoriteProductsList.length === 0) {
    favoritesContainer.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px;">
        <i class="fa-solid fa-heart-crack" style="font-size: 60px; color: #ccc; margin-bottom: 20px; display: block;"></i>
        <p>No favorites yet! Click the heart icon on products to save them here.</p>
      </div>
    `;
  } else {
    favoritesContainer.innerHTML = `
      <div class="products-grid">
        ${favoriteProductsList.map(product => `
          <div class="product-card" data-product-id="${product.id}">
            <button class="favorite-btn active" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
              <i class="fa-solid fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.brand}</p>
              <button class="info-btn" onclick="showProductDetails(${product.id})">
                <i class="fa-solid fa-info-circle"></i> Details
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  favoritesModal.style.display = 'flex';
}

/* Close favorites modal */
function closeFavorites() {
  if (favoritesModal) {
    favoritesModal.style.display = 'none';
  }
}

/* Event listener for favorites button */
if (favoritesBtn) {
  favoritesBtn.addEventListener('click', showFavorites);
}

/* ========================================
   🎯 SKIN QUIZ FUNCTIONALITY
   ======================================== */

const skinQuizBtn = document.getElementById('skinQuizBtn');
const skinQuizModal = document.getElementById('skinQuizModal');
const quizContainer = document.getElementById('quizContainer');

const quizQuestions = [
  {
    id: 1,
    question: "What's your skin type?",
    icon: "fa-droplet",
    options: [
      { value: "oily", label: "Oily", icon: "fa-oil-can" },
      { value: "dry", label: "Dry", icon: "fa-sun" },
      { value: "combination", label: "Combination", icon: "fa-yin-yang" },
      { value: "normal", label: "Normal", icon: "fa-check-circle" }
    ]
  },
  {
    id: 2,
    question: "What's your main skin concern?",
    icon: "fa-magnifying-glass",
    options: [
      { value: "acne", label: "Acne", icon: "fa-circle-dot" },
      { value: "aging", label: "Anti-Aging", icon: "fa-clock" },
      { value: "dark-spots", label: "Dark Spots", icon: "fa-circle-half-stroke" },
      { value: "sensitivity", label: "Sensitivity", icon: "fa-heart-pulse" }
    ]
  },
  {
    id: 3,
    question: "How much time do you have for your routine?",
    icon: "fa-hourglass-half",
    options: [
      { value: "5-min", label: "5 Minutes", icon: "fa-forward" },
      { value: "10-min", label: "10 Minutes", icon: "fa-forward-step" },
      { value: "15-min", label: "15+ Minutes", icon: "fa-clock" }
    ]
  },
  {
    id: 4,
    question: "What's your budget preference?",
    icon: "fa-wallet",
    options: [
      { value: "budget", label: "Budget-Friendly", icon: "fa-coins" },
      { value: "mid-range", label: "Mid-Range", icon: "fa-money-bill" },
      { value: "premium", label: "Premium", icon: "fa-gem" }
    ]
  }
];

let currentQuizQuestion = 0;
let quizAnswers = {};

/* Start skin quiz */
function startSkinQuiz() {
  currentQuizQuestion = 0;
  quizAnswers = {};
  showQuizQuestion();
  if (skinQuizModal) {
    skinQuizModal.style.display = 'flex';
  }
}

/* Show current quiz question */
function showQuizQuestion() {
  if (currentQuizQuestion >= quizQuestions.length) {
    showQuizResults();
    return;
  }
  
  const question = quizQuestions[currentQuizQuestion];
  const progress = ((currentQuizQuestion / quizQuestions.length) * 100).toFixed(0);
  
  quizContainer.innerHTML = `
    <div class="quiz-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <p>Question ${currentQuizQuestion + 1} of ${quizQuestions.length}</p>
    </div>
    
    <div class="quiz-question">
      <h3><i class="fa-solid ${question.icon}"></i> ${question.question}</h3>
      <div class="quiz-options">
        ${question.options.map(option => `
          <div class="quiz-option" onclick="selectQuizOption('${question.id}', '${option.value}')">
            <i class="fa-solid ${option.icon}"></i>
            <p>${option.label}</p>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="quiz-nav">
      <button class="quiz-btn" onclick="previousQuizQuestion()" ${currentQuizQuestion === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-arrow-left"></i> Previous
      </button>
      <button class="quiz-btn" onclick="nextQuizQuestion()" ${!quizAnswers[question.id] ? 'disabled' : ''} id="nextBtn">
        Next <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  `;
}

/* Select quiz option */
function selectQuizOption(questionId, value) {
  quizAnswers[questionId] = value;
  
  /* Update UI */
  document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  event.target.closest('.quiz-option').classList.add('selected');
  
  /* Enable next button */
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled = false;
  }
}

/* Next quiz question */
function nextQuizQuestion() {
  currentQuizQuestion++;
  showQuizQuestion();
}

/* Previous quiz question */
function previousQuizQuestion() {
  if (currentQuizQuestion > 0) {
    currentQuizQuestion--;
    showQuizQuestion();
  }
}

/* Show quiz results */
function showQuizResults() {
  /* Generate personalized recommendations based on answers */
  const recommendations = generateRecommendations(quizAnswers);
  
  quizContainer.innerHTML = `
    <div class="quiz-results">
      <div class="result-icon">✨</div>
      <h3>Your Personalized Recommendations</h3>
      <p style="margin-bottom: 20px; color: var(--loreal-light-text);">
        Based on your answers, we've curated the perfect routine for you!
      </p>
      
      <div class="quiz-recommendations">
        ${recommendations.map(rec => `
          <div class="quiz-recommendation-card">
            <i class="fa-solid ${rec.icon}" style="font-size: 32px; color: var(--loreal-red); margin-bottom: 10px;"></i>
            <h4>${rec.title}</h4>
            <p style="font-size: 12px; color: var(--loreal-light-text); margin-top: 5px;">${rec.description}</p>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px;">
        <button class="quiz-btn" onclick="applyQuizRecommendations()">
          <i class="fa-solid fa-check"></i> Apply Recommendations
        </button>
        <button class="quiz-btn" onclick="closeSkinQuiz()" style="background: #666; margin-left: 10px;">
          Close
        </button>
      </div>
    </div>
  `;
}

/* Generate recommendations based on quiz answers */
function generateRecommendations(answers) {
  const recommendations = [];
  
  /* Skin type recommendation */
  if (answers[1] === 'oily') {
    recommendations.push({ icon: 'fa-droplet', title: 'Oil Control', description: 'Look for mattifying cleansers' });
  } else if (answers[1] === 'dry') {
    recommendations.push({ icon: 'fa-water', title: 'Hydration Boost', description: 'Focus on moisturizing products' });
  } else if (answers[1] === 'combination') {
    recommendations.push({ icon: 'fa-yin-yang', title: 'Balanced Care', description: 'Use targeted treatments' });
  }
  
  /* Concern recommendation */
  if (answers[2] === 'acne') {
    recommendations.push({ icon: 'fa-shield', title: 'Acne Treatment', description: 'Gentle yet effective formulas' });
  } else if (answers[2] === 'aging') {
    recommendations.push({ icon: 'fa-star', title: 'Anti-Aging', description: 'Retinol & peptides' });
  } else if (answers[2] === 'dark-spots') {
    recommendations.push({ icon: 'fa-sun', title: 'Brightening', description: 'Vitamin C serums' });
  }
  
  /* Time recommendation */
  if (answers[3] === '5-min') {
    recommendations.push({ icon: 'fa-bolt', title: 'Quick Routine', description: '3-step essentials' });
  } else if (answers[3] === '15-min') {
    recommendations.push({ icon: 'fa-spa', title: 'Full Routine', description: 'Complete 7-step care' });
  }
  
  /* Budget recommendation */
  if (answers[4] === 'premium') {
    recommendations.push({ icon: 'fa-gem', title: 'Premium Products', description: 'Luxury formulations' });
  } else if (answers[4] === 'budget') {
    recommendations.push({ icon: 'fa-piggy-bank', title: 'Best Value', description: 'Effective & affordable' });
  }
  
  return recommendations;
}

/* Apply quiz recommendations */
function applyQuizRecommendations() {
  /* Filter products based on quiz answers */
  const skinType = quizAnswers[1] || '';
  const concern = quizAnswers[2] || '';
  
  /* This is a simplified version - you could make this much more sophisticated */
  chatWindow.innerHTML += `
    <div class="message ai-message">
      <p><strong>✨ Quiz Results Applied!</strong></p>
      <p>I've noted your preferences:</p>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Skin Type: ${skinType}</li>
        <li>Main Concern: ${concern}</li>
      </ul>
      <p style="margin-top: 10px;">Select products from the grid above and click "Generate Routine" for personalized recommendations based on your quiz results!</p>
    </div>
  `;
  
  chatWindow.scrollTop = chatWindow.scrollHeight;
  closeSkinQuiz();
  
  /* Update recommendations based on quiz results */
  updateRecommendations();
}

/* ========================================
   ✨ SMART PRODUCT RECOMMENDATIONS
   ======================================== */

function updateRecommendations() {
  const skinProfile = localStorage.getItem('skinProfile');
  if (!skinProfile) {
    document.getElementById('recommendedBanner').style.display = 'none';
    return;
  }
  
  const profile = JSON.parse(skinProfile);
  const recommendedIds = getRecommendedProducts(profile);
  
  if (recommendedIds.length === 0) {
    document.getElementById('recommendedBanner').style.display = 'none';
    return;
  }
  
  const recommended = allProducts.filter(p => recommendedIds.includes(p.id));
  displayRecommendations(recommended, profile);
}

function getRecommendedProducts(profile) {
  let recommendations = [];
  
  /* Skin type based recommendations */
  if (profile.skinType === 'oily' || profile.skinType === 'combination') {
    recommendations.push(1, 4, 6, 7); // Foaming cleanser, AM SPF, salicylic acid, niacinamide serum
  } else if (profile.skinType === 'dry') {
    recommendations.push(2, 3, 5, 8); // Hydrating cleanser, moisturizing cream, PM lotion, eye cream
  } else if (profile.skinType === 'sensitive') {
    recommendations.push(2, 3, 9); // Hydrating cleanser, moisturizing cream, healing ointment
  }
  
  /* Concern based recommendations */
  if (profile.concerns && profile.concerns.includes('acne')) {
    recommendations.push(1, 6, 7); // Foaming cleanser, SA cleanser, niacinamide
  }
  
  if (profile.concerns && profile.concerns.includes('aging')) {
    recommendations.push(2, 3, 5, 8); // Anti-aging products
  }
  
  if (profile.concerns && profile.concerns.includes('hydration')) {
    recommendations.push(2, 3, 5, 8); // Hydrating products
  }
  
  /* Remove duplicates and limit to 6 products */
  return [...new Set(recommendations)].slice(0, 6);
}

function displayRecommendations(products, profile) {
  const banner = document.getElementById('recommendedBanner');
  const container = document.getElementById('recommendedProducts');
  
  if (products.length === 0) {
    banner.style.display = 'none';
    return;
  }
  
  const profileText = `${profile.skinType || 'your'} skin${profile.concerns ? ' with ' + profile.concerns.join(', ') + ' concerns' : ''}`;
  document.querySelector('.recommended-subtitle').textContent = `Perfect for ${profileText}`;
  
  container.innerHTML = products.map(product => `
    <div class="recommended-product" onclick="quickAddProduct(${product.id})">
      <img src="${product.image}" alt="${product.name}">
      <div class="recommended-info">
        <h4>${product.name}</h4>
        <p>${product.brand}</p>
        ${product.rating ? `
          <div class="mini-rating">
            <span class="stars-mini">${'★'.repeat(Math.floor(product.rating))}</span>
            <span class="rating-num">${product.rating}</span>
          </div>
        ` : ''}
      </div>
      <button class="quick-add-btn" title="Add to routine">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `).join('');
  
  banner.style.display = 'block';
}

function quickAddProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  /* Check if already selected */
  const existingIndex = selectedProducts.findIndex(p => p.id === productId);
  if (existingIndex === -1) {
    selectedProducts.push(product);
    displaySelectedProducts();
    updateProductCardStates();
    saveSelectedProductsToStorage();
    
    /* Show visual feedback */
    addBotMessage(`✨ Added ${product.name} to your routine!`);
  } else {
    addBotMessage(`${product.name} is already in your routine.`);
  }
}

/* Close skin quiz */
function closeSkinQuiz() {
  if (skinQuizModal) {
    skinQuizModal.style.display = 'none';
  }
}

/* Event listener for skin quiz button */
if (skinQuizBtn) {
  skinQuizBtn.addEventListener('click', startSkinQuiz);
}

/* ========================================
   📊 PRODUCT COMPARISON
   ======================================== */

const compareBtn = document.getElementById('compareBtn');
const compareModal = document.getElementById('compareModal');
const compareContainer = document.getElementById('compareContainer');

let compareProducts = [];

/* Show compare modal */
function showCompareModal() {
  if (compareProducts.length === 0) {
    compareContainer.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px;">
        <i class="fa-solid fa-scale-unbalanced" style="font-size: 60px; color: #ccc; margin-bottom: 20px; display: block;"></i>
        <p>No products selected for comparison. Check the boxes on products to compare them!</p>
      </div>
    `;
  } else {
    const productsToCompare = allProducts.filter(p => compareProducts.includes(p.id));
    
    compareContainer.innerHTML = `
      <div class="compare-grid">
        ${productsToCompare.map(product => `
          <div class="compare-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <ul class="compare-features">
              <li><strong>Brand:</strong> ${product.brand}</li>
              <li><strong>Category:</strong> ${product.category}</li>
              <li><strong>For:</strong> ${product.skinType || 'All skin types'}</li>
              <li class="compare-description">${product.description}</li>
            </ul>
            <button class="quiz-btn" onclick="toggleProductSelection(${product.id})" style="width: 100%; margin-top: 15px;">
              <i class="fa-solid fa-plus"></i> Add to Routine
            </button>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <button class="quiz-btn" onclick="clearCompare()">
          <i class="fa-solid fa-trash"></i> Clear Comparison
        </button>
      </div>
    `;
  }
  
  if (compareModal) {
    compareModal.style.display = 'flex';
  }
}

/* Toggle compare product */
function toggleCompare(productId) {
  const index = compareProducts.indexOf(productId);
  if (index > -1) {
    compareProducts.splice(index, 1);
  } else {
    if (compareProducts.length >= 4) {
      alert('You can compare up to 4 products at a time.');
      return;
    }
    compareProducts.push(productId);
  }
  updateCompareCheckboxes();
}

/* Update compare checkboxes */
function updateCompareCheckboxes() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const productId = parseInt(card.dataset.productId);
    let compareCheckbox = card.querySelector('.compare-checkbox');
    
    /* Create compare checkbox if it doesn't exist */
    if (!compareCheckbox) {
      compareCheckbox = document.createElement('div');
      compareCheckbox.className = 'compare-checkbox';
      compareCheckbox.innerHTML = `
        <input type="checkbox" id="compare-${productId}" />
        <label for="compare-${productId}">
          <i class="fa-solid fa-check"></i>
        </label>
      `;
      const checkbox = compareCheckbox.querySelector('input');
      checkbox.onchange = () => toggleCompare(productId);
      card.appendChild(compareCheckbox);
    }
    
    /* Update checkbox state */
    const checkbox = compareCheckbox.querySelector('input');
    if (checkbox) {
      checkbox.checked = compareProducts.includes(productId);
    }
  });
}

/* Clear compare */
function clearCompare() {
  compareProducts = [];
  updateCompareCheckboxes();
  showCompareModal();
}

/* Close compare modal */
function closeCompare() {
  if (compareModal) {
    compareModal.style.display = 'none';
  }
}

/* Event listener for compare button */
if (compareBtn) {
  compareBtn.addEventListener('click', showCompareModal);
}

/* ========================================
   🎤 VOICE INPUT
   ======================================== */

const voiceInputBtn = document.getElementById('voiceInputBtn');

let recognition = null;
let isRecording = false;

/* Initialize speech recognition if available */
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    isRecording = false;
    voiceInputBtn.classList.remove('recording');
    console.log('Voice input:', transcript);
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isRecording = false;
    voiceInputBtn.classList.remove('recording');
  };
  
  recognition.onend = () => {
    isRecording = false;
    voiceInputBtn.classList.remove('recording');
  };
}

/* Toggle voice recording */
function toggleVoiceInput() {
  if (!recognition) {
    alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
    return;
  }
  
  if (isRecording) {
    recognition.stop();
    isRecording = false;
    voiceInputBtn.classList.remove('recording');
  } else {
    recognition.start();
    isRecording = true;
    voiceInputBtn.classList.add('recording');
  }
}

/* Event listener for voice input button */
if (voiceInputBtn) {
  voiceInputBtn.addEventListener('click', toggleVoiceInput);
}

/* ========================================
   📄 EXPORT TO TEXT FILE
   ======================================== */

const exportPDFBtn = document.getElementById('exportPDFBtn');

/* Export routine to text file */
async function exportRoutineToPDF() {
  /* Get conversation content */
  const messages = chatWindow.querySelectorAll('.message');
  
  if (messages.length === 0) {
    alert('No routine to export! Generate a routine first.');
    return;
  }
  
  /* Create a formatted text version */
  let content = 'L\'ORÉAL PERSONALIZED ROUTINE\n';
  content += '=' .repeat(50) + '\n\n';
  
  messages.forEach(msg => {
    const isUser = msg.classList.contains('user-message');
    const text = msg.textContent.trim();
    content += `${isUser ? 'You' : 'AI Advisor'}: ${text}\n\n`;
  });
  
  /* Create a blob and download */
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'loreal-routine.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Routine exported as text file');
}

/* Event listener for export button */
if (exportPDFBtn) {
  exportPDFBtn.addEventListener('click', exportRoutineToPDF);
}

/* ========================================
   🔗 SHARE ROUTINE
   ======================================== */

const shareRoutineBtn = document.getElementById('shareRoutineBtn');
const shareModal = document.getElementById('shareModal');
const shareLinkInput = document.getElementById('shareLink');

/* Generate shareable link */
function shareRoutine() {
  /* Create a simple share link with selected products */
  const productIds = selectedProducts.join(',');
  const shareUrl = `${window.location.origin}${window.location.pathname}?products=${productIds}`;
  
  if (shareLinkInput) {
    shareLinkInput.value = shareUrl;
  }
  
  if (shareModal) {
    shareModal.style.display = 'flex';
  }
}

/* Copy share link */
function copyShareLink() {
  if (shareLinkInput) {
    shareLinkInput.select();
    document.execCommand('copy');
    
    /* Show feedback */
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  }
}

/* Close share modal */
function closeShareModal() {
  if (shareModal) {
    shareModal.style.display = 'none';
  }
}

/* Event listener for share button */
if (shareRoutineBtn) {
  shareRoutineBtn.addEventListener('click', shareRoutine);
}

/* Load shared products from URL on page load */
function loadSharedProducts() {
  const params = new URLSearchParams(window.location.search);
  const sharedProducts = params.get('products');
  
  if (sharedProducts) {
    const productIds = sharedProducts.split(',').map(id => parseInt(id));
    selectedProducts = productIds.filter(id => allProducts.some(p => p.id === id));
    saveSelectedProductsToStorage();
    displaySelectedProducts();
    updateProductCardStates();
    
    /* Show a message */
    setTimeout(() => {
      chatWindow.innerHTML += `
        <div class="message ai-message">
          <p>✨ Welcome! I've loaded a shared routine for you. These products have been recommended by someone who knows great skincare!</p>
        </div>
      `;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 500);
  }
}

/* ========================================
   ⭐ INGREDIENT ANALYZER DATABASE
   ======================================== */

const ingredientDatabase = {
  'Hyaluronic Acid': {
    benefit: 'Deeply hydrates and plumps skin by holding 1000x its weight in water',
    category: 'Hydrator',
    color: '#4A90E2'
  },
  'Ceramides': {
    benefit: 'Restores and strengthens skin barrier, locks in moisture',
    category: 'Barrier Support',
    color: '#7B68EE'
  },
  'Niacinamide': {
    benefit: 'Reduces inflammation, minimizes pores, brightens skin tone',
    category: 'Multi-Purpose',
    color: '#50C878'
  },
  'Retinol': {
    benefit: 'Boosts collagen, reduces fine lines, improves texture',
    category: 'Anti-Aging',
    color: '#FF6B6B',
    warning: '⚠️ Use sunscreen! Avoid with AHA/BHA'
  },
  'Vitamin C': {
    benefit: 'Brightens, fights free radicals, boosts collagen',
    category: 'Antioxidant',
    color: '#FFA500'
  },
  'Salicylic Acid': {
    benefit: 'Exfoliates inside pores, fights acne, reduces blackheads',
    category: 'BHA Exfoliant',
    color: '#E74C3C',
    warning: '⚠️ May increase sun sensitivity'
  },
  'Glycolic Acid': {
    benefit: 'Exfoliates surface, brightens, smooths texture',
    category: 'AHA Exfoliant',
    color: '#E67E22',
    warning: '⚠️ Avoid with retinol'
  },
  'Peptides': {
    benefit: 'Stimulates collagen production, firms skin',
    category: 'Anti-Aging',
    color: '#9B59B6'
  },
  'SPF 30': {
    benefit: 'Blocks 97% of UVB rays, prevents sun damage',
    category: 'Sun Protection',
    color: '#F39C12'
  },
  'Zinc Oxide': {
    benefit: 'Physical UV blocker, soothes inflammation',
    category: 'Sun Protection',
    color: '#95A5A6'
  },
  'Glycerin': {
    benefit: 'Humectant that attracts moisture to skin',
    category: 'Hydrator',
    color: '#3498DB'
  },
  'Petrolatum': {
    benefit: 'Seals in moisture, protects skin barrier',
    category: 'Occlusive',
    color: '#34495E'
  }
};

/* Analyze ingredients and generate HTML display */
function analyzeIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return '<p class="no-ingredients">Ingredient information not available</p>';
  }

  let html = '<div class="ingredients-analysis">';
  
  ingredients.forEach(ingredient => {
    const info = ingredientDatabase[ingredient];
    if (info) {
      html += `
        <div class="ingredient-badge" style="border-left: 3px solid ${info.color}">
          <div class="ingredient-name">${ingredient}</div>
          <div class="ingredient-category">${info.category}</div>
          <div class="ingredient-benefit">${info.benefit}</div>
          ${info.warning ? `<div class="ingredient-warning">${info.warning}</div>` : ''}
        </div>
      `;
    } else {
      html += `
        <div class="ingredient-badge">
          <div class="ingredient-name">${ingredient}</div>
        </div>
      `;
    }
  });
  
  html += '</div>';
  return html;
}

/* ========================================
   ⚡ ROUTINE TEMPLATES
   ======================================== */

/* Predefined routine templates with product IDs */
const routineTemplates = {
  'acne-fighting': {
    name: 'Acne-Fighting Routine',
    products: [1, 6, 7, 4], // Foaming Cleanser, Retinol Serum, SA Cleanser, AM SPF
    description: 'Combat acne with gentle yet effective products'
  },
  'anti-aging': {
    name: 'Anti-Aging Routine',
    products: [2, 6, 3, 5], // Hydrating Cleanser, Retinol Serum, Moisturizing Cream, PM Lotion
    description: 'Fight signs of aging and promote youthful skin'
  },
  'hydration-boost': {
    name: 'Hydration Boost Routine',
    products: [2, 9, 3, 5], // Hydrating Cleanser, Hyaluronic Acid Serum, Moisturizing Cream, PM Lotion
    description: 'Deep hydration for dry, thirsty skin'
  },
  'minimalist': {
    name: 'Minimalist 3-Step Routine',
    products: [1, 3, 4], // Cleanser, Moisturizer, SPF
    description: 'Simple but effective everyday essentials'
  },
  'sensitive-skin': {
    name: 'Sensitive Skin Routine',
    products: [2, 11, 3], // Hydrating Cleanser, Micellar Water, Moisturizing Cream
    description: 'Gentle, soothing products for sensitive skin'
  }
};

/* Apply a routine template */
function applyTemplate(templateKey) {
  const template = routineTemplates[templateKey];
  
  if (!template) {
    console.error('Template not found:', templateKey);
    return;
  }
  
  console.log(`Applying template: ${template.name}`);
  
  /* Clear current selection */
  selectedProducts = [];
  
  /* Add template products to selection */
  template.products.forEach(productId => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      selectedProducts.push(product);
    }
  });
  
  /* Update UI */
  displaySelectedProducts();
  updateProductCardStates();
  saveSelectedProductsToStorage();
  
  /* Visual feedback - highlight applied template */
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.remove('applied');
  });
  const appliedBtn = document.querySelector(`[data-template="${templateKey}"]`);
  if (appliedBtn) {
    appliedBtn.classList.add('applied');
  }
  
  /* Scroll to selected products section */
  document.querySelector('.selected-products').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  /* Show success message in chat */
  addMessage(`✨ Applied "${template.name}"! I've selected ${selectedProducts.length} products for you. Click "Generate Routine" to get started, or feel free to adjust the selection.`);
  
  /* Optional: Show confetti animation */
  setTimeout(() => {
    showConfetti();
  }, 300);
  
  console.log(`Template applied: ${selectedProducts.length} products selected`);
}

/* ========================================
   🎉 CONFETTI ANIMATION
   ======================================== */

/* Create confetti animation for celebrations */
function showConfetti() {
  const colors = ['#E30613', '#D4AF37', '#B76E79', '#FF6B6B', '#4ECDC4'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createConfettiPiece(color) {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * 100 + '%';
  confetti.style.top = '-10px';
  confetti.style.opacity = '1';
  confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
  confetti.style.zIndex = '10000';
  confetti.style.pointerEvents = 'none';
  confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
  
  document.body.appendChild(confetti);
  
  const duration = 2000 + Math.random() * 1000;
  const endLeft = parseFloat(confetti.style.left) + (Math.random() * 40 - 20);
  
  confetti.animate([
    { 
      transform: `translateY(0) rotate(0deg)`,
      opacity: 1
    },
    { 
      transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg)`,
      opacity: 0,
      left: endLeft + '%'
    }
  ], {
    duration: duration,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });
  
  setTimeout(() => {
    confetti.remove();
  }, duration);
}

/* ========================================
   � ANALYTICS DASHBOARD
   ======================================== */

/* Track routine generation */
function trackRoutineGeneration() {
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{"routines": [], "products": [], "streaks": {}}');
  
  const today = new Date().toDateString();
  
  /* Add today's routine */
  if (!analytics.routines.includes(today)) {
    analytics.routines.push(today);
  }
  
  /* Track unique products */
  selectedProducts.forEach(product => {
    if (!analytics.products.includes(product.id)) {
      analytics.products.push(product.id);
    }
  });
  
  /* Calculate streak */
  analytics.streaks = calculateStreak(analytics.routines);
  
  localStorage.setItem('analytics', JSON.stringify(analytics));
  
  /* Check for milestones */
  checkMilestones(analytics);
}

/* Calculate current streak */
function calculateStreak(routines) {
  if (routines.length === 0) return { current: 0, longest: 0 };
  
  const dates = routines.map(d => new Date(d)).sort((a, b) => b - a);
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 0; i < dates.length - 1; i++) {
    const diffDays = Math.floor((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (i === 0) currentStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  
  return { current: currentStreak, longest: longestStreak };
}

/* Check and award milestones */
function checkMilestones(analytics) {
  const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
  
  /* First routine */
  if (analytics.routines.length === 1 && !milestones.includes('first-routine')) {
    milestones.push('first-routine');
    showMilestoneNotification('🎉 First Routine!', 'You created your first skincare routine!');
  }
  
  /* 7-day streak */
  if (analytics.streaks.current >= 7 && !milestones.includes('7-day-streak')) {
    milestones.push('7-day-streak');
    showMilestoneNotification('🔥 7-Day Streak!', 'You\'re on fire! Keep up the consistency!');
  }
  
  /* 30-day streak */
  if (analytics.streaks.current >= 30 && !milestones.includes('30-day-streak')) {
    milestones.push('30-day-streak');
    showMilestoneNotification('🏆 30-Day Streak!', 'Amazing dedication to your skincare!');
  }
  
  /* Product explorer */
  if (analytics.products.length >= 10 && !milestones.includes('product-explorer')) {
    milestones.push('product-explorer');
    showMilestoneNotification('⭐ Product Explorer!', 'You\'ve tried 10+ different products!');
  }
  
  localStorage.setItem('milestones', JSON.stringify(milestones));
}

/* Show milestone notification */
function showMilestoneNotification(title, message) {
  addBotMessage(`${title}\n${message}`);
  showConfetti();
}

/* Show analytics dashboard */
function showAnalytics() {
  const modal = document.getElementById('analyticsModal');
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{"routines": [], "products": [], "streaks": {}}');
  const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
  
  /* Update stats */
  document.getElementById('totalRoutines').textContent = analytics.routines.length;
  document.getElementById('currentStreak').textContent = analytics.streaks.current || 0;
  document.getElementById('totalProducts').textContent = analytics.products.length;
  document.getElementById('achievementCount').textContent = milestones.length;
  
  /* Generate weekly chart */
  generateWeeklyChart(analytics.routines);
  
  /* Display milestones */
  displayMilestones(milestones);
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* Generate weekly activity chart */
function generateWeeklyChart(routines) {
  const chart = document.getElementById('weeklyChart');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weekActivity = new Array(7).fill(0);
  
  /* Count routines for each day of the week */
  routines.forEach(dateStr => {
    const date = new Date(dateStr);
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      const dayIndex = date.getDay();
      weekActivity[dayIndex]++;
    }
  });
  
  const maxActivity = Math.max(...weekActivity, 1);
  
  chart.innerHTML = days.map((day, i) => `
    <div class="chart-day">
      <div class="chart-bar-container">
        <div class="chart-bar" style="height: ${(weekActivity[i] / maxActivity) * 100}%">
          <span class="chart-value">${weekActivity[i]}</span>
        </div>
      </div>
      <div class="chart-label">${day}</div>
    </div>
  `).join('');
}

/* Display earned milestones */
function displayMilestones(milestones) {
  const container = document.getElementById('milestonesList');
  
  const allMilestones = [
    { id: 'first-routine', icon: '🎉', title: 'First Routine', desc: 'Created your first routine' },
    { id: '7-day-streak', icon: '🔥', title: '7-Day Streak', desc: 'Consistency champion' },
    { id: '30-day-streak', icon: '🏆', title: '30-Day Streak', desc: 'Skincare master' },
    { id: 'product-explorer', icon: '⭐', title: 'Product Explorer', desc: 'Tried 10+ products' },
    { id: 'quiz-taker', icon: '📋', title: 'Know Thyself', desc: 'Completed skin quiz' },
  ];
  
  container.innerHTML = allMilestones.map(m => `
    <div class="milestone-item ${milestones.includes(m.id) ? 'earned' : 'locked'}">
      <div class="milestone-icon">${m.icon}</div>
      <div class="milestone-info">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>
      ${milestones.includes(m.id) ? '<i class="fa-solid fa-check milestone-check"></i>' : '<i class="fa-solid fa-lock milestone-lock"></i>'}
    </div>
  `).join('');
}

/* Close analytics modal */
function closeAnalytics() {
  const modal = document.getElementById('analyticsModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/* ========================================
   �🛒 SHOPPING LIST GENERATOR
   ======================================== */

/* Show shopping list button when products are selected */
function updateShoppingListButton() {
  const shoppingListBtn = document.getElementById('shoppingListBtn');
  if (selectedProducts.length > 0) {
    shoppingListBtn.style.display = 'block';
  } else {
    shoppingListBtn.style.display = 'none';
  }
}

/* Generate and display shopping list */
function generateShoppingList() {
  const modal = document.getElementById('shoppingListModal');
  const content = document.getElementById('shoppingListContent');
  
  if (selectedProducts.length === 0) {
    content.innerHTML = '<p class="empty-message">No products selected yet!</p>';
    modal.style.display = 'flex';
    return;
  }
  
  let totalCost = 0;
  let listHTML = '<div class="shopping-list-items">';
  
  selectedProducts.forEach((product, index) => {
    const price = product.price || 0;
    totalCost += price;
    
    listHTML += `
      <div class="shopping-item">
        <input type="checkbox" id="item-${index}" class="shopping-checkbox">
        <label for="item-${index}">
          <div class="item-details">
            <span class="item-number">${index + 1}.</span>
            <div class="item-info">
              <strong>${product.name}</strong>
              <span class="item-brand">${product.brand}</span>
              <span class="item-category">${product.category}</span>
            </div>
            ${price > 0 ? `<span class="item-price">$${price.toFixed(2)}</span>` : ''}
          </div>
        </label>
      </div>
    `;
  });
  
  listHTML += '</div>';
  
  if (totalCost > 0) {
    listHTML += `
      <div class="shopping-total">
        <strong>Total Estimated Cost:</strong>
        <span class="total-price">$${totalCost.toFixed(2)}</span>
      </div>
    `;
  }
  
  listHTML += `
    <div class="shopping-tip">
      <i class="fa-solid fa-lightbulb"></i>
      <strong>Shopping Tips:</strong>
      <ul>
        <li>Check for sales at Ulta, Sephora, or Target</li>
        <li>Consider travel sizes to test products first</li>
        <li>Look for bundle deals to save money</li>
        <li>Sign up for rewards programs for extra savings</li>
      </ul>
    </div>
  `;
  
  content.innerHTML = listHTML;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* Close shopping list modal */
function closeShoppingList() {
  const modal = document.getElementById('shoppingListModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/* Print shopping list */
function printShoppingList() {
  window.print();
}

/* Copy shopping list to clipboard */
async function copyShoppingList() {
  let text = '🛍️ MY SKINCARE SHOPPING LIST\n\n';
  
  selectedProducts.forEach((product, index) => {
    text += `${index + 1}. ${product.name}\n`;
    text += `   Brand: ${product.brand}\n`;
    text += `   Category: ${product.category}\n`;
    if (product.price) {
      text += `   Price: $${product.price.toFixed(2)}\n`;
    }
    text += '\n';
  });
  
  const totalCost = selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  if (totalCost > 0) {
    text += `\n💰 Total: $${totalCost.toFixed(2)}`;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    alert('Shopping list copied to clipboard! ✅');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

/* Initialize the app when page loads */
async function initializeApp() {
  allProducts = await loadProducts();
  loadSelectedProductsFromStorage();
  loadLanguagePreference();
  loadDarkModePreference();
  loadFavorites();
  displayProducts(allProducts);
  
  /* Update favorite and compare buttons after products are displayed */
  setTimeout(() => {
    updateFavoriteButtons();
    updateCompareCheckboxes();
    updateRecommendations(); // Show personalized recommendations
  }, 100);
  
  /* Load shared products if URL parameter exists */
  setTimeout(loadSharedProducts, 500);
  
  /* Add shopping list button event listener */
  const shoppingListBtn = document.getElementById('shoppingListBtn');
  if (shoppingListBtn) {
    shoppingListBtn.addEventListener('click', generateShoppingList);
  }
  
  /* Add analytics button event listener */
  const analyticsBtn = document.getElementById('analyticsBtn');
  if (analyticsBtn) {
    analyticsBtn.addEventListener('click', showAnalytics);
  }
}

initializeApp();


/* ========================================
   🎭 AI PERSONALITY SELECTOR
   ======================================== */

const aiPersonalities = {
  dermatologist: {
    name: 'Dr. Expert',
    systemPrompt: `You are a professional dermatologist with years of clinical experience. Provide evidence-based skincare advice using medical terminology when appropriate. Be thorough, detailed, and reference scientific principles.`,
    greeting: 'Hello! I\'m Dr. Expert, your professional dermatology consultant.'
  },
  friendly: {
    name: 'Friendly Guide',
    systemPrompt: `You are an enthusiastic and warm beauty advisor who loves helping people discover their perfect skincare routine. Use friendly, conversational language with plenty of encouragement. Make skincare feel fun and accessible.`,
    greeting: 'Hey there, skincare friend! ✨ I\'m so excited to help you build your perfect routine!'
  },
  minimalist: {
    name: 'Minimalist Pro',
    systemPrompt: `You are a no-nonsense skincare expert who values efficiency and simplicity. Provide concise, direct answers without unnecessary details. Focus on essential information only.`,
    greeting: 'Hi. Ready to build your routine? Let\'s get straight to it.'
  }
};

let currentPersonality = 'friendly';

function loadPersonality() {
  const saved = localStorage.getItem('aiPersonality');
  if (saved && aiPersonalities[saved]) {
    currentPersonality = saved;
  }
  updatePersonalityButton();
}

function updatePersonalityButton() {
  const btn = document.getElementById('personalityBtn');
  if (btn) {
    const icons = { dermatologist: 'fa-user-doctor', friendly: 'fa-face-smile', minimalist: 'fa-bolt' };
    btn.innerHTML = `<i class="fa-solid ${icons[currentPersonality] || 'fa-user-doctor'}"></i>`;
    btn.title = `Current: ${aiPersonalities[currentPersonality].name}`;
  }
}

function showPersonalitySelector() {
  const modal = document.getElementById('personalityModal');
  document.querySelectorAll('.personality-card').forEach(card => {
    card.classList.toggle('active', card.dataset.personality === currentPersonality);
  });
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function selectPersonality(personality) {
  if (!aiPersonalities[personality]) return;
  currentPersonality = personality;
  localStorage.setItem('aiPersonality', personality);
  document.querySelectorAll('.personality-card').forEach(card => {
    card.classList.toggle('active', card.dataset.personality === personality);
  });
  updatePersonalityButton();
  addBotMessage(`✨ Personality changed to ${aiPersonalities[personality].name}! ${aiPersonalities[personality].greeting}`);
  setTimeout(() => closePersonality(), 500);
}

function closePersonality() {
  document.getElementById('personalityModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function getPersonalityPrompt() {
  return aiPersonalities[currentPersonality].systemPrompt;
}

/* Add personality button listener on init */
const personalityBtn = document.getElementById('personalityBtn');
if (personalityBtn) {
  personalityBtn.addEventListener('click', showPersonalitySelector);
  loadPersonality();
}

/* ========================================
   🔄 DRAG & DROP REORDER
   ======================================== */

let draggedElement = null;
let draggedIndex = null;

/* Initialize drag & drop listeners after products are displayed */
function initializeDragAndDrop() {
  const chips = document.querySelectorAll('.selected-product-chip');
  
  chips.forEach((chip, index) => {
    /* Drag start - store the element being dragged */
    chip.addEventListener('dragstart', (e) => {
      draggedElement = chip;
      draggedIndex = index;
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', chip.innerHTML);
    });

    /* Drag end - clean up */
    chip.addEventListener('dragend', (e) => {
      chip.classList.remove('dragging');
      document.querySelectorAll('.selected-product-chip').forEach(c => {
        c.classList.remove('drag-over');
      });
    });

    /* Drag over - allow dropping */
    chip.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedElement !== chip) {
        chip.classList.add('drag-over');
      }
    });

    /* Drag leave - remove hover effect */
    chip.addEventListener('dragleave', (e) => {
      chip.classList.remove('drag-over');
    });

    /* Drop - reorder the products array */
    chip.addEventListener('drop', (e) => {
      e.preventDefault();
      chip.classList.remove('drag-over');
      
      if (draggedElement !== chip) {
        const dropIndex = parseInt(chip.dataset.index);
        
        /* Reorder the selectedProducts array */
        const [movedProduct] = selectedProducts.splice(draggedIndex, 1);
        selectedProducts.splice(dropIndex, 0, movedProduct);
        
        /* Save to localStorage */
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        
        /* Re-render the products */
        displaySelectedProducts();
        
        /* Show success feedback */
        showReorderFeedback();
      }
    });
  });
}

/* Show visual feedback after reordering */
function showReorderFeedback() {
  const feedback = document.createElement('div');
  feedback.className = 'reorder-feedback';
  feedback.innerHTML = '<i class="fa-solid fa-check"></i> Order updated!';
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    feedback.classList.remove('show');
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

/* Override displaySelectedProducts to initialize drag & drop */
const originalDisplaySelectedProducts = displaySelectedProducts;
displaySelectedProducts = function() {
  originalDisplaySelectedProducts();
  /* Initialize drag & drop after rendering */
  setTimeout(() => initializeDragAndDrop(), 0);
};

/* ========================================
   🔍 NATURAL LANGUAGE SEARCH
   ======================================== */

/* Natural language search with keyword detection */
function naturalLanguageMatch(product, searchTerm) {
  const term = searchTerm.toLowerCase();
  
  /* Build searchable text from product data */
  const searchableText = `${product.name} ${product.brand} ${product.description} ${product.category}`.toLowerCase();
  
  /* Add ingredients if available */
  if (product.ingredients) {
    const ingredientsText = product.ingredients.join(' ').toLowerCase();
    searchableText = searchableText + ' ' + ingredientsText;
  }
  
  /* Basic keyword matching */
  if (searchableText.includes(term)) {
    return true;
  }
  
  /* Price-based queries */
  if (product.price) {
    if ((term.includes('cheap') || term.includes('affordable') || term.includes('budget') || term.includes('under')) && product.price < 20) {
      return true;
    }
    if ((term.includes('expensive') || term.includes('premium') || term.includes('luxury')) && product.price > 30) {
      return true;
    }
    if (term.includes('under 15') && product.price < 15) {
      return true;
    }
    if (term.includes('under 20') && product.price < 20) {
      return true;
    }
    if (term.includes('under 25') && product.price < 25) {
      return true;
    }
  }
  
  /* Rating-based queries */
  if (product.rating) {
    if ((term.includes('top rated') || term.includes('best') || term.includes('highly rated') || term.includes('5 star')) && product.rating >= 4.5) {
      return true;
    }
    if (term.includes('popular') && product.reviewCount > 5000) {
      return true;
    }
  }
  
  /* Skin concern keywords */
  const concernMap = {
    'acne': ['acne', 'blemish', 'breakout', 'pimple', 'clear skin'],
    'aging': ['anti-aging', 'wrinkle', 'fine line', 'aging', 'youth', 'firm'],
    'dry': ['dry', 'hydrat', 'moisture', 'nourish'],
    'oily': ['oily', 'mattify', 'control oil', 'sebum'],
    'sensitive': ['sensitive', 'gentle', 'sooth', 'calm'],
    'dark spots': ['dark spot', 'hyperpigmentation', 'bright', 'even tone', 'discoloration'],
    'dull': ['dull', 'radiant', 'glow', 'luminous', 'bright']
  };
  
  for (const [concern, keywords] of Object.entries(concernMap)) {
    if (keywords.some(keyword => term.includes(keyword))) {
      if (searchableText.includes(concern) || keywords.some(k => searchableText.includes(k))) {
        return true;
      }
    }
  }
  
  /* Ingredient-based queries */
  const ingredientKeywords = {
    'vitamin c': ['vitamin c', 'ascorbic', 'brightening'],
    'retinol': ['retinol', 'retinoid', 'vitamin a'],
    'hyaluronic acid': ['hyaluronic', 'hydrating', 'plump'],
    'niacinamide': ['niacinamide', 'vitamin b3', 'pore'],
    'salicylic acid': ['salicylic', 'bha', 'exfoliat', 'acne'],
    'ceramides': ['ceramide', 'barrier', 'repair'],
    'peptides': ['peptide', 'anti-aging', 'collagen'],
    'glycolic acid': ['glycolic', 'aha', 'exfoliat']
  };
  
  for (const [ingredient, keywords] of Object.entries(ingredientKeywords)) {
    if (keywords.some(keyword => term.includes(keyword))) {
      if (searchableText.includes(ingredient) || 
          (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(ingredient)))) {
        return true;
      }
    }
  }
  
  /* Product type queries */
  const typeMap = {
    'cleanser': ['cleanser', 'wash', 'foam', 'gel', 'cleansing'],
    'moisturizer': ['moisturizer', 'cream', 'lotion', 'hydrator'],
    'serum': ['serum', 'essence', 'concentrate'],
    'mask': ['mask', 'treatment'],
    'sunscreen': ['sunscreen', 'spf', 'sun protection'],
    'toner': ['toner', 'essence'],
    'eye cream': ['eye cream', 'eye', 'under eye']
  };
  
  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some(keyword => term.includes(keyword)) && searchableText.includes(type)) {
      return true;
    }
  }
  
  /* Time-of-day queries */
  if ((term.includes('morning') || term.includes('day') || term.includes('am')) && 
      (searchableText.includes('morning') || searchableText.includes('day'))) {
    return true;
  }
  if ((term.includes('night') || term.includes('evening') || term.includes('pm')) && 
      (searchableText.includes('night') || searchableText.includes('evening'))) {
    return true;
  }
  
  return false;
}

/* Update search placeholder with smart suggestions */
const searchSuggestions = [
  'Search products by name or keyword...',
  'Try: "affordable moisturizers"',
  'Try: "products with retinol"',
  'Try: "best rated cleansers"',
  'Try: "anti-aging serums"',
  'Try: "products for acne"',
  'Try: "under $20"',
  'Try: "hydrating products"'
];

let suggestionIndex = 0;

function rotatePlaceholder() {
  const searchInput = document.getElementById('productSearch');
  if (searchInput && !searchInput.value) {
    suggestionIndex = (suggestionIndex + 1) % searchSuggestions.length;
    searchInput.placeholder = searchSuggestions[suggestionIndex];
  }
}

/* Rotate placeholder every 3 seconds */
setInterval(rotatePlaceholder, 3000);

/* ========================================
   ⏱️ RESULTS TIMELINE PREDICTOR
   ======================================== */

/* Generate results timeline based on selected products */
function generateResultsTimeline() {
  if (selectedProducts.length === 0) return;
  
  const resultsSection = document.getElementById('resultsPredictor');
  const timelineContainer = document.getElementById('resultsTimeline');
  
  /* Analyze products to determine expected results */
  const results = analyzeExpectedResults(selectedProducts);
  
  /* Sort results by timeframe (earliest first) */
  results.sort((a, b) => a.days - b.days);
  
  /* Generate timeline HTML */
  const timelineHTML = results.map((result, index) => `
    <div class="result-milestone" data-days="${result.days}" style="animation-delay: ${index * 0.1}s">
      <div class="milestone-marker">
        <div class="milestone-dot"></div>
        <div class="milestone-line"></div>
      </div>
      <div class="milestone-content">
        <div class="milestone-time">${result.timeframe}</div>
        <div class="milestone-title">${result.icon} ${result.title}</div>
        <div class="milestone-description">${result.description}</div>
        <div class="milestone-products">
          ${result.products.map(p => `<span class="product-tag">${p}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  
  timelineContainer.innerHTML = timelineHTML;
  resultsSection.style.display = 'block';
  
  /* Scroll to results after a brief delay */
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 500);
}

/* Analyze products and determine expected results timeline */
function analyzeExpectedResults(products) {
  const results = [];
  const processedConcerns = new Set();
  
  /* Results timeline database based on ingredients and product types */
  const resultTimelines = {
    'immediate': {
      days: 1,
      timeframe: 'Immediate - 24 Hours',
      concerns: ['hydration', 'makeup', 'sunscreen', 'cleanse'],
      icon: '⚡',
      title: 'Instant Results',
      description: 'Immediate hydration, protection, and cleansing benefits'
    },
    'quick': {
      days: 3,
      timeframe: '3-7 Days',
      concerns: ['brightness', 'glow', 'radiance', 'texture'],
      icon: '✨',
      title: 'Quick Improvements',
      description: 'Noticeable glow, improved texture, and enhanced radiance'
    },
    'shortTerm': {
      days: 14,
      timeframe: '2-3 Weeks',
      concerns: ['acne', 'blemish', 'pore', 'oil control', 'exfoliation'],
      icon: '��',
      title: 'Visible Changes',
      description: 'Reduced breakouts, refined pores, and clearer complexion'
    },
    'mediumTerm': {
      days: 28,
      timeframe: '4-6 Weeks',
      concerns: ['fine lines', 'firmness', 'dark spots', 'hyperpigmentation', 'tone'],
      icon: '🌟',
      title: 'Significant Progress',
      description: 'Reduced fine lines, more even tone, and improved firmness'
    },
    'longTerm': {
      days: 84,
      timeframe: '8-12 Weeks',
      concerns: ['wrinkles', 'anti-aging', 'collagen', 'elasticity', 'deep repair'],
      icon: '🏆',
      title: 'Transformative Results',
      description: 'Deep wrinkle reduction, enhanced elasticity, and visible rejuvenation'
    }
  };
  
  /* Check each product for relevant concerns */
  products.forEach(product => {
    const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    const ingredients = product.ingredients ? product.ingredients.join(' ').toLowerCase() : '';
    const searchText = productText + ' ' + ingredients;
    
    /* Match product to result timelines */
    for (const [key, timeline] of Object.entries(resultTimelines)) {
      if (processedConcerns.has(key)) continue;
      
      const hasMatch = timeline.concerns.some(concern => searchText.includes(concern));
      
      if (hasMatch) {
        results.push({
          days: timeline.days,
          timeframe: timeline.timeframe,
          icon: timeline.icon,
          title: timeline.title,
          description: timeline.description,
          products: [product.name]
        });
        processedConcerns.add(key);
      }
    }
  });
  
  /* If no specific matches, add generic timeline */
  if (results.length === 0) {
    results.push({
      days: 1,
      timeframe: 'Immediate',
      icon: '✨',
      title: 'Instant Benefits',
      description: 'Immediate hydration and protection from your skincare routine',
      products: products.map(p => p.name)
    });
    results.push({
      days: 28,
      timeframe: '4-6 Weeks',
      icon: '🌟',
      title: 'Visible Results',
      description: 'Consistent use will show noticeable improvements in skin health and appearance',
      products: products.map(p => p.name)
    });
  }
  
  return results;
}
