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
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
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
    return;
  }

  /* Create chips for each selected product */
  const chipsHTML = selectedProducts
    .map(
      (product) => `
    <div class="selected-product-chip">
      <span>${product.name}</span>
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
  
  /* Apply search filter if there's a search term */
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      const searchableText = `${product.name} ${product.brand} ${product.description} ${product.category}`.toLowerCase();
      return searchableText.includes(searchTerm);
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
  /* Build the system message with product context if needed */
  let systemMessage = `You are a helpful L'Oréal beauty advisor. You help customers understand products, answer questions about skincare and beauty, and provide personalized recommendations. You remember the conversation context and can answer follow-up questions naturally.`;

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
          </div>
        </div>
        <div class="modal-body">
          <h3>Product Description</h3>
          <p>${product.description}</p>
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

/* Initialize the app when page loads */
initializeApp();
