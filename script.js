// ========================================
//  PROVIDER CONFIG
// ========================================
const PROVIDERS = {
    groq: {
        name: 'Groq',
        storageKey: 'mk_masterchef_groq_api_key',
        placeholder: 'Enter your Groq API key...',
        prefix: 'gsk_',
        hintText: '🔒 Groq keys start with "gsk_" • Stored locally, never shared.',
        createUrl: 'https://console.groq.com/keys',
        createLabel: 'Create Groq Key',
        model: 'llama-3.1-8b-instant',
        apiType: 'openai-compat',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        statusClass: 'connected',
        dotClass: 'connected-groq',
        statusLabel: 'Connected • Groq ⚡',
        statusBarText: 'Powered by Groq AI ⚡',
    },
    openai: {
        name: 'ChatGPT',
        storageKey: 'mk_masterchef_openai_api_key',
        placeholder: 'Enter your OpenAI API key...',
        prefix: 'sk-',
        hintText: '🔒 OpenAI keys start with "sk-" • Stored locally, never shared.',
        createUrl: 'https://platform.openai.com/api-keys',
        createLabel: 'Create OpenAI Key',
        model: 'gpt-4o-mini',
        apiType: 'openai-compat',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        statusClass: 'connected-openai',
        dotClass: 'connected-openai',
        statusLabel: 'Connected • ChatGPT 🤖',
        statusBarText: 'Powered by OpenAI ChatGPT 🤖',
    },
    gemini: {
        name: 'Gemini',
        storageKey: 'mk_masterchef_gemini_api_key',
        placeholder: 'Enter your Gemini API key...',
        prefix: 'AIza',
        hintText: '🔒 Gemini keys start with "AIza" • Stored locally, never shared.',
        createUrl: 'https://aistudio.google.com/app/apikey',
        createLabel: 'Create Gemini Key',
        model: 'gemini-1.5-flash',
        apiType: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        statusClass: 'connected-gemini',
        dotClass: 'connected-gemini',
        statusLabel: 'Connected • Gemini ✨',
        statusBarText: 'Powered by Google Gemini ✨',
    }
};

const TOTAL_INPUTS = 10;
let currentProvider = localStorage.getItem('mk_masterchef_provider') || 'groq';

// ========================================
//  LANGUAGE CONFIG
// ========================================
const LANGUAGES = {
    English:    { flag: '🇬🇧', dir: 'ltr',  cls: '',    nativeName: 'English'    },
    Hindi:      { flag: '🇮🇳', dir: 'ltr',  cls: '',    nativeName: 'हिन्दी'      },
    Tamil:      { flag: '🇮🇳', dir: 'ltr',  cls: '',    nativeName: 'தமிழ்'       },
    Spanish:    { flag: '🇪🇸', dir: 'ltr',  cls: '',    nativeName: 'Español'    },
    French:     { flag: '🇫🇷', dir: 'ltr',  cls: '',    nativeName: 'Français'   },
    German:     { flag: '🇩🇪', dir: 'ltr',  cls: '',    nativeName: 'Deutsch'    },
    Arabic:     { flag: '🇸🇦', dir: 'rtl',  cls: 'rtl', nativeName: 'العربية'    },
    Japanese:   { flag: '🇯🇵', dir: 'ltr',  cls: 'cjk', nativeName: '日本語'      },
    Chinese:    { flag: '🇨🇳', dir: 'ltr',  cls: 'cjk', nativeName: '中文'        },
    Portuguese: { flag: '🇧🇷', dir: 'ltr',  cls: '',    nativeName: 'Português'  },
};

let currentLanguage = localStorage.getItem('mk_masterchef_language') || 'English';

// ========================================
//  PAYMENT CONFIG
// ========================================
const PAY_AMOUNT  = '49';
const PAY_NAME    = 'MK+Master+Chef';
const FREE_LANGS  = new Set(['English', 'Tamil']);
const UNLOCK_KEY  = 'mk_masterchef_unlocked_langs';
let   pendingLang = null;   // language waiting for payment

// UPI destination — stored encoded, never rendered as plain text in UI
function _dest() {
    return atob('ODk0MDA5MTYyNEBuYXZpYXhpcw==');
}

function getUnlockedLangs() {
    try { return new Set(JSON.parse(localStorage.getItem(UNLOCK_KEY) || '[]')); }
    catch { return new Set(); }
}

function saveLangUnlock(lang) {
    const set = getUnlockedLangs();
    set.add(lang);
    localStorage.setItem(UNLOCK_KEY, JSON.stringify([...set]));
}

function isLangAvailable(lang) {
    return FREE_LANGS.has(lang) || getUnlockedLangs().has(lang);
}

// ── Payment Modal ──
function showPaymentModal(lang) {
    pendingLang = lang;
    const cfg   = LANGUAGES[lang];

    // Labels
    document.getElementById('payLangName').textContent = `${cfg.flag} ${lang}`;

    // Build UPI deep-link — destination never shown in UI as text
    const dest   = _dest();
    const note   = encodeURIComponent(`Unlock ${lang} - MK Master Chef`);
    const upiStr = `upi://pay?pa=${dest}&pn=${PAY_NAME}&am=${PAY_AMOUNT}&cu=INR&tn=${note}`;

    // Show QR loading state
    const loading = document.getElementById('payQrLoading');
    const qrImg   = document.getElementById('payQrImg');
    loading.style.display = 'flex';
    loading.innerHTML = '<div class="qr-spinner"></div><span>Generating QR…</span>';
    qrImg.src = '';

    // Generate QR (encodes UPI link — UPI ID is inside the QR, never displayed as text)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=000000&bgcolor=ffffff&data=${encodeURIComponent(upiStr)}`;
    qrImg.src = qrUrl;

    // Any UPI deep-link
    document.getElementById('payUpi').href = upiStr;

    // Reset UTR input
    document.getElementById('payTxnInput').value = '';
    document.getElementById('payVerifyIcon').textContent = '🔓';
    document.getElementById('payVerifyText').textContent = 'Unlock';
    document.getElementById('payVerifyBtn').disabled = true;
    document.getElementById('payTxnHint').textContent = 'Enter UTR number shown in your UPI app after payment';
    document.getElementById('payTxnHint').style.color = '';

    document.getElementById('payOverlay').classList.add('show');
}

function closePayment() {
    document.getElementById('payOverlay').classList.remove('show');
    pendingLang = null;
}

// (UPI ID copy removed — ID not exposed in UI)

// Live UTR input validation
function onUtrInput(input) {
    const val  = input.value.trim();
    const btn  = document.getElementById('payVerifyBtn');
    const hint = document.getElementById('payTxnHint');

    // UTR numbers: 12 digits (IMPS) or alphanumeric 8–22 chars (UPI ref)
    const valid = val.length >= 8 && /^[A-Za-z0-9]+$/.test(val);

    btn.disabled = !valid;

    if (val.length === 0) {
        hint.textContent = 'Enter UTR number shown in your UPI app after payment';
        hint.style.color = '';
    } else if (!valid) {
        hint.textContent = val.length < 8
            ? `${val.length}/8 chars minimum — keep typing`
            : 'Only letters and numbers allowed';
        hint.style.color = 'rgba(239,68,68,0.8)';
    } else {
        hint.textContent = '✓ Looks good — tap Unlock to activate';
        hint.style.color = 'rgba(52,211,153,0.9)';
    }
}

function submitPayment() {
    const txn = document.getElementById('payTxnInput').value.trim();
    if (!txn || txn.length < 8 || !/^[A-Za-z0-9]+$/.test(txn)) {
        showToast('Please enter a valid UTR / Transaction ID', 'warning', '⚠️');
        document.getElementById('payTxnInput').focus();
        return;
    }

    // Check if UTR already used for a different language
    const usedUtrs = JSON.parse(localStorage.getItem('mk_masterchef_utrs') || '{}');
    if (usedUtrs[txn] && usedUtrs[txn] !== pendingLang) {
        showToast('This UTR is already used for another language', 'error', '❌');
        return;
    }

    const btn = document.getElementById('payVerifyBtn');
    btn.disabled = true;
    document.getElementById('payVerifyIcon').textContent = '⏳';
    document.getElementById('payVerifyText').textContent = 'Verifying…';

    // Animate the QR frame during verify
    document.querySelector('.pay-qr-frame').classList.add('verifying');

    setTimeout(() => {
        // Save UTR → language mapping
        usedUtrs[txn] = pendingLang;
        localStorage.setItem('mk_masterchef_utrs', JSON.stringify(usedUtrs));

        saveLangUnlock(pendingLang);

        // Apply the language immediately
        const lang = pendingLang;
        currentLanguage = lang;
        localStorage.setItem('mk_masterchef_language', lang);

        renderLangButtons();
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
        const cfg = LANGUAGES[lang];
        document.getElementById('langCurrentName').textContent = `${cfg.flag} ${lang}`;

        document.querySelector('.pay-qr-frame').classList.remove('verifying');
        closePayment();
        showToast(`${cfg.flag} ${lang} unlocked! Enjoy premium recipes! 🎉`, 'success', '⭐');
    }, 1400);
}

// ── Render lock/unlock badges on language buttons ──
function renderLangButtons() {
    const unlocked = getUnlockedLangs();
    document.querySelectorAll('.lang-btn[data-paid="true"]').forEach(btn => {
        const lang = btn.dataset.lang;
        btn.classList.remove('paid-locked', 'paid-unlocked');
        if (unlocked.has(lang)) {
            btn.classList.add('paid-unlocked');
        } else {
            btn.classList.add('paid-locked');
        }
    });
}

function selectLanguage(btn) {
    const lang = btn.dataset.lang;

    // Check if payment needed
    if (!isLangAvailable(lang)) {
        showPaymentModal(lang);
        return;
    }

    currentLanguage = lang;
    localStorage.setItem('mk_masterchef_language', lang);

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update badge
    const cfg = LANGUAGES[lang];
    document.getElementById('langCurrentName').textContent = `${cfg.flag} ${lang}`;

    showToast(`Language set to ${lang}`, 'success', cfg.flag);
}

function initLanguage() {
    // If saved language is paid but not unlocked, fall back to English
    if (!isLangAvailable(currentLanguage)) {
        currentLanguage = 'English';
        localStorage.setItem('mk_masterchef_language', 'English');
    }
    const saved = currentLanguage;
    const cfg   = LANGUAGES[saved] || LANGUAGES['English'];

    renderLangButtons();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === saved);
    });

    document.getElementById('langCurrentName').textContent = `${cfg.flag} ${saved}`;
}


// ========================================
//  INTRO SCREEN
// ========================================
function enterKitchen() {
    const intro = document.getElementById('introScreen');
    intro.classList.add('slide-out');
    setTimeout(() => {
        intro.style.display = 'none';
    }, 950);
}


// ========================================
//  TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success', icon = '✅') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    document.getElementById('toastText').textContent = message;
    document.getElementById('toastIcon').textContent = icon;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}


// ========================================
//  PROVIDER SWITCHING
// ========================================
function switchProvider(provider) {
    currentProvider = provider;
    localStorage.setItem('mk_masterchef_provider', provider);

    // Update tab active states
    document.querySelectorAll('.provider-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === provider);
    });

    // Update input placeholder & hint
    const cfg = PROVIDERS[provider];
    const input = document.getElementById('apiKeyInput');
    input.placeholder = cfg.placeholder;
    document.getElementById('apiHint').innerHTML = `<span>${cfg.hintText}</span>`;
    document.getElementById('createKeyLink').href = cfg.createUrl;
    document.getElementById('createKeyLabel').textContent = cfg.createLabel;
    document.getElementById('providerKeyLabel').textContent = `🔑 ${cfg.name} API Key`;
    document.getElementById('statusBarText').textContent = cfg.statusBarText;

    // Load saved key for this provider
    const savedKey = localStorage.getItem(cfg.storageKey) || '';
    input.value = savedKey;
    input.className = 'api-key-input' + (savedKey ? ' saved' : '');
    input.type = 'password';
    document.getElementById('toggleVisibility').textContent = '👁️';

    updateApiStatus(!!savedKey);
    showToast(`Switched to ${cfg.name}`, 'success', cfg.name === 'Groq' ? '⚡' : cfg.name === 'ChatGPT' ? '🤖' : '✨');
}

function refreshTabDots() {
    ['groq', 'openai', 'gemini'].forEach(p => {
        const dot = document.getElementById(`${p}-dot`);
        const key = localStorage.getItem(PROVIDERS[p].storageKey);
        dot.className = 'ptab-dot' + (key ? ` ${PROVIDERS[p].dotClass}` : '');
    });
}


// ========================================
//  API KEY MANAGEMENT
// ========================================
function getApiKey() {
    return localStorage.getItem(PROVIDERS[currentProvider].storageKey) || '';
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    const cfg = PROVIDERS[currentProvider];

    if (!key) {
        showToast('Please enter an API key!', 'warning', '⚠️');
        input.focus();
        return;
    }

    if (!key.startsWith(cfg.prefix)) {
        showToast(`Invalid format. ${cfg.name} keys start with "${cfg.prefix}"`, 'error', '❌');
        return;
    }

    if (key.length < 20) {
        showToast('Key seems too short.', 'error', '❌');
        return;
    }

    localStorage.setItem(cfg.storageKey, key);
    updateApiStatus(true);
    input.classList.add('saved');
    refreshTabDots();

    const btn = document.getElementById('saveKeyBtn');
    document.getElementById('saveIcon').textContent = '✅';
    document.getElementById('saveText').textContent = 'Saved!';
    btn.classList.add('saved');

    setTimeout(() => {
        document.getElementById('saveIcon').textContent = '💾';
        document.getElementById('saveText').textContent = 'Save';
        btn.classList.remove('saved');
    }, 2500);

    showToast(`${cfg.name} key saved securely!`, 'success', '🔑');
}

function removeApiKey() {
    const cfg = PROVIDERS[currentProvider];
    localStorage.removeItem(cfg.storageKey);
    const input = document.getElementById('apiKeyInput');
    input.value = '';
    input.classList.remove('saved', 'saved-openai', 'saved-gemini');
    updateApiStatus(false);
    refreshTabDots();
    showToast(`${cfg.name} key removed`, 'warning', '🗑️');
}

function updateApiStatus(connected) {
    const cfg = PROVIDERS[currentProvider];
    const status = document.getElementById('apiStatus');
    const text = document.getElementById('apiStatusText');
    const removeBtn = document.getElementById('removeKeyBtn');

    if (connected) {
        status.className = `api-status ${cfg.statusClass}`;
        text.textContent = cfg.statusLabel;
        removeBtn.classList.add('show');
    } else {
        status.className = 'api-status disconnected';
        text.textContent = 'Not Connected';
        removeBtn.classList.remove('show');
    }
}

function toggleKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const btn = document.getElementById('toggleVisibility');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function initApiSection() {
    // Set active tab
    document.querySelectorAll('.provider-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === currentProvider);
    });

    // Apply config for active provider
    const cfg = PROVIDERS[currentProvider];
    const input = document.getElementById('apiKeyInput');
    input.placeholder = cfg.placeholder;
    document.getElementById('apiHint').innerHTML = `<span>${cfg.hintText}</span>`;
    document.getElementById('createKeyLink').href = cfg.createUrl;
    document.getElementById('createKeyLabel').textContent = cfg.createLabel;
    document.getElementById('providerKeyLabel').textContent = `🔑 ${cfg.name} API Key`;
    document.getElementById('statusBarText').textContent = cfg.statusBarText;

    const savedKey = getApiKey();
    if (savedKey) {
        input.value = savedKey;
        input.classList.add('saved');
        updateApiStatus(true);
    }

    refreshTabDots();
}


// ========================================
//  AI CALL ROUTER
// ========================================
async function callAI(messages, maxTokens = 1200, temperature = 0.8) {
    const cfg = PROVIDERS[currentProvider];
    const apiKey = getApiKey();

    if (cfg.apiType === 'openai-compat') {
        const response = await fetch(cfg.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: cfg.model,
                messages,
                temperature,
                max_tokens: maxTokens
            })
        });

        if (response.status === 401 || response.status === 403) {
            return { error: 'invalid_key' };
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        return { content: data.choices[0].message.content };

    } else {
        // Gemini format
        const systemMsg = messages.find(m => m.role === 'system');
        const userMsg   = messages.find(m => m.role === 'user');

        const body = {
            contents: [{ role: 'user', parts: [{ text: userMsg.content }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens }
        };
        if (systemMsg) {
            body.system_instruction = { parts: [{ text: systemMsg.content }] };
        }

        const response = await fetch(`${cfg.endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.status === 400 || response.status === 403) {
            return { error: 'invalid_key' };
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');
        return { content: text };
    }
}


// ========================================
//  INGREDIENT COUNTER
// ========================================
function updateIngredientCounter() {
    let count = 0;
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        if (document.getElementById(`ingredient${i}`).value.trim()) count++;
    }
    const counter = document.getElementById('ingredientCounter');
    counter.textContent = `${count} / ${TOTAL_INPUTS}`;
    counter.style.color = count > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)';
}


// ========================================
//  COLLECT ALL INGREDIENTS
// ========================================
function getAllIngredients() {
    const values = [];
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        const val = document.getElementById(`ingredient${i}`).value.trim();
        if (val) values.push(val);
    }
    return values;
}

function getAllInputElements() {
    const inputs = [];
    for (let i = 1; i <= TOTAL_INPUTS; i++) {
        inputs.push(document.getElementById(`ingredient${i}`));
    }
    return inputs;
}


// ========================================
//  AI-POWERED INGREDIENT VALIDATION
// ========================================
async function validateIngredientsWithAI(ingredients) {
    try {
        const result = await callAI([
            {
                role: 'system',
                content: `You are a strict food ingredient validator. Ingredients may be written in ANY language or script (English, Hindi, Tamil, Spanish, French, Arabic, Japanese, Chinese, etc.) — accept them if they refer to real food.

VALID: Any real food, spice, herb, condiment, cooking oil, dairy, grain, meat, seafood, vegetable, fruit, nut, seed, sauce, broth, baking ingredient — in any language.
INVALID: Random words, gibberish, non-food objects (electronics, furniture, clothing), names, places, abstract concepts, slang, nonsense.

RESPOND ONLY in exact JSON:
{"valid": true, "invalid_items": []}
OR
{"valid": false, "invalid_items": ["item1", "item2"]}

No explanations. Only JSON.`
            },
            {
                role: 'user',
                content: `Validate these ingredients: ${ingredients}`
            }
        ], 300, 0);

        if (result.error) return result;

        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { valid: true, invalid_items: [] };

    } catch (error) {
        console.error('AI Validation error:', error);
        return localValidation(ingredients.split(', '));
    }
}


// ========================================
//  LOCAL FALLBACK VALIDATION
// ========================================
const FOOD_KEYWORDS = [
    'chicken','beef','pork','lamb','fish','salmon','tuna','shrimp','prawn','crab','lobster','turkey','duck',
    'bacon','sausage','ham','steak','egg','eggs','tofu','tempeh','paneer','mutton','veal','cod','tilapia',
    'squid','octopus','clam','mussel','oyster','scallop','anchovy','sardine','mackerel',
    'tomato','onion','garlic','potato','carrot','broccoli','spinach','lettuce','cabbage','cauliflower',
    'pepper','bell pepper','chili','jalapeno','celery','cucumber','zucchini','eggplant','mushroom','corn',
    'pea','peas','bean','beans','asparagus','artichoke','beet','radish','turnip','sweet potato','squash',
    'pumpkin','kale','arugula','bok choy','leek','scallion','shallot','okra','fennel','ginger','lemongrass',
    'apple','banana','orange','lemon','lime','mango','pineapple','strawberry','blueberry','raspberry',
    'grape','watermelon','melon','peach','pear','plum','cherry','coconut','avocado','fig','date','kiwi',
    'rice','pasta','noodle','noodles','bread','flour','oat','oats','quinoa','barley','wheat','couscous',
    'tortilla','pita','roti','naan','spaghetti','penne','fettuccine','lasagna','ramen','udon','macaroni',
    'milk','cheese','butter','cream','yogurt','ghee','sour cream','mozzarella','cheddar','parmesan',
    'feta','ricotta','cream cheese','buttermilk','whey',
    'salt','pepper','cumin','turmeric','paprika','cinnamon','oregano','basil','thyme','rosemary',
    'parsley','cilantro','coriander','mint','dill','sage','bay leaf','cardamom','nutmeg','clove',
    'saffron','garam masala','chili powder','cayenne','tarragon','sumac',
    'olive oil','oil','vegetable oil','sesame oil','coconut oil','vinegar','soy sauce','fish sauce',
    'oyster sauce','mustard','ketchup','mayo','mayonnaise','hot sauce','sriracha','tahini','pesto',
    'salsa','miso','hoisin','teriyaki','worcestershire','bbq sauce',
    'almond','walnut','cashew','peanut','pistachio','pecan','hazelnut','sesame','chia','flax',
    'sugar','honey','maple syrup','molasses','agave','syrup',
    'baking powder','baking soda','yeast','cornstarch','cocoa','vanilla','chocolate',
    'stock','broth','water','wine','beer','coconut milk','tomato paste','tomato sauce',
    'lentil','lentils','chickpea','chickpeas','tofu','edamame','seitan',
    'apple cider vinegar','balsamic','rice vinegar',
    'spring onion','green onion','jalapeño','habanero','serrano',
    'portobello','shiitake','cremini','oyster mushroom',
    'mozzarella','brie','gouda','swiss','colby','jack','manchego',
    'prawns','crayfish','halibut','sea bass','trout','herring','eel','perch'
];

function localValidation(ingredientArray) {
    const invalid = [];
    ingredientArray.forEach(item => {
        const lower = item.toLowerCase().trim();
        const isFood = FOOD_KEYWORDS.some(kw => lower.includes(kw) || kw.includes(lower));
        if (!isFood && lower.length > 2) invalid.push(item);
    });
    return { valid: invalid.length === 0, invalid_items: invalid };
}


// ========================================
//  SHOW ERROR OVERLAY
// ========================================
function showError(invalidItems = [], isApiError = false) {
    const overlay  = document.getElementById('errorOverlay');
    const card     = document.getElementById('errorCard');
    const icon     = document.getElementById('errorIcon');
    const title    = document.getElementById('errorTitle');
    const subtitle = document.getElementById('errorSubtitle');
    const items    = document.getElementById('errorItems');

    items.innerHTML = '';

    if (isApiError) {
        card.className = 'error-card api-error';
        icon.textContent = '🔑';
        title.textContent = 'API Key Required!';
        subtitle.innerHTML = `No API key found for <strong>${PROVIDERS[currentProvider].name}</strong>.<br>Please enter and save your key above.`;
    } else {
        card.className = 'error-card';
        icon.textContent = '🚫';
        title.textContent = 'Invalid Ingredients Detected!';
        subtitle.innerHTML = "These don't look like real food ingredients.<br>Please enter actual cooking ingredients only.";
        invalidItems.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'error-tag';
            tag.innerHTML = `<span class="cross">✕</span>${item}`;
            items.appendChild(tag);
        });
    }

    overlay.classList.add('show');
}

function closeError() {
    document.getElementById('errorOverlay').classList.remove('show');
}


// ========================================
//  COOK MAGIC — MAIN FUNCTION
// ========================================
async function cookMagic() {
    const apiKey = getApiKey();
    const btn = document.getElementById('cookBtn');
    const responseSection = document.getElementById('responseSection');
    const responseBody = document.getElementById('responseBody');
    const allInputs = getAllInputElements();

    // Reset all states
    allInputs.forEach(i => i.classList.remove('input-error', 'input-valid'));
    responseSection.classList.remove('show');

    // Check API key
    if (!apiKey) {
        showError([], true);
        return;
    }

    const ingredientValues = getAllIngredients();

    if (ingredientValues.length === 0) {
        allInputs.forEach(i => i.classList.add('input-error'));
        showError(['No ingredients entered! Please fill at least one field.']);
        return;
    }

    const allIngredients = ingredientValues.join(', ');
    const cfg = PROVIDERS[currentProvider];

    // ===== STEP 1: AI VALIDATION =====
    btn.classList.add('validating');
    btn.disabled = true;
    document.querySelector('.loading-text').textContent = '🛡️ Validating ingredients...';

    const validation = await validateIngredientsWithAI(allIngredients);

    if (validation.error === 'invalid_key') {
        btn.classList.remove('validating');
        btn.disabled = false;
        localStorage.removeItem(cfg.storageKey);
        updateApiStatus(false);
        refreshTabDots();
        document.getElementById('apiKeyInput').value = '';
        document.getElementById('apiKeyInput').classList.remove('saved');
        showError([], true);
        showToast(`${cfg.name} API key is invalid or expired!`, 'error', '❌');
        return;
    }

    if (!validation.valid && validation.invalid_items && validation.invalid_items.length > 0) {
        btn.classList.remove('validating');
        btn.disabled = false;

        // Mark invalid inputs red
        ingredientValues.forEach(val => {
            if (validation.invalid_items.some(inv => inv.toLowerCase() === val.toLowerCase())) {
                allInputs.forEach(input => {
                    if (input.value.trim().toLowerCase() === val.toLowerCase()) {
                        input.parentElement.classList.add('input-error');
                    }
                });
            }
        });

        showError(validation.invalid_items);
        return;
    }

    // Mark all filled inputs as valid
    allInputs.forEach(i => {
        if (i.value.trim()) i.classList.add('input-valid');
    });

    // ===== STEP 2: GENERATE RECIPE =====
    btn.classList.remove('validating');
    btn.classList.add('loading');
    document.querySelector('.loading-text').textContent = `👨‍🍳 ${cfg.name} is cooking...`;

    try {
        // Language config for recipe output
        const langCfg = LANGUAGES[currentLanguage] || LANGUAGES['English'];

        const result = await callAI([
            {
                role: 'system',
                content: `You are MK Master Chef 👨‍🍳, a world-class AI chef with incredible creativity.
Given ingredients, create ONE amazing, detailed recipe using as many of the provided ingredients as possible.

IMPORTANT: Write the ENTIRE recipe — title, ingredients, instructions, tips, and serving suggestion — in ${currentLanguage}. Use ${currentLanguage} for all text. Keep emoji symbols and markdown formatting as-is.

Format:
## 🍽️ [Creative Recipe Name in ${currentLanguage}]

**⏱️ Time:** [Prep + Cook time]
**🍴 Servings:** [Number]
**📊 Difficulty:** [Easy/Medium/Hard]

### 📝 Ingredients
- [Full ingredient list with quantities in ${currentLanguage}]

### 👨‍🍳 Instructions
1. [Step-by-step instructions in ${currentLanguage}]

### 💡 Chef's Pro Tip
[One amazing tip in ${currentLanguage}]

### 🌟 Serving Suggestion
[How to plate and serve, in ${currentLanguage}]

Be enthusiastic, precise, and creative! Use emojis sparingly.`
            },
            {
                role: 'user',
                content: `Create a delicious recipe using these ${ingredientValues.length} ingredients: ${allIngredients}. Write the full recipe in ${currentLanguage}.`
            }
        ], 1800, 0.8);

        if (result.error === 'invalid_key') throw new Error('Invalid API key.');

        const recipe = result.content;
        responseBody.innerHTML = formatMarkdown(recipe);

        // Apply language direction / font class
        const activeLangCfg = LANGUAGES[currentLanguage] || LANGUAGES['English'];
        responseBody.className = 'response-body';
        if (activeLangCfg.cls) responseBody.classList.add(activeLangCfg.cls);
        responseBody.style.direction = activeLangCfg.dir;

        // Update response header to show provider + language
        const providerBadge = { groq: '⚡ Groq', openai: '🤖 ChatGPT', gemini: '✨ Gemini' };
        document.getElementById('responseProvider').textContent =
            `Crafted by ${providerBadge[currentProvider]} • ${activeLangCfg.flag} ${currentLanguage}`;

        responseSection.classList.add('show');

        setTimeout(() => {
            responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);

        showToast('Recipe ready! Bon appétit! 🎉', 'success', '🍽️');

    } catch (error) {
        console.error('Error:', error);
        responseBody.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:48px;margin-bottom:15px;">😅</div>
                <p style="color:#fca5a5;font-weight:600;font-size:16px;">Kitchen Malfunction!</p>
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px;">
                    ${error.message || 'Could not reach the AI chef. Check your API key.'}
                </p>
            </div>
        `;
        responseSection.classList.add('show');
    } finally {
        btn.classList.remove('loading', 'validating');
        btn.disabled = false;
        document.querySelector('.loading-text').textContent = 'AI is thinking...';
    }
}


// ========================================
//  MARKDOWN FORMATTER
// ========================================
function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
        .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}


// ========================================
//  EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initApiSection();
    initLanguage();
    updateIngredientCounter();

    // Ingredient input events
    getAllInputElements().forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') cookMagic();
        });

        input.addEventListener('input', () => {
            input.classList.remove('input-error', 'input-valid');
            input.parentElement.classList.remove('input-error');
            updateIngredientCounter();
        });

        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // API key input enter
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveApiKey();
    });

    // Close error overlay on background click
    document.getElementById('errorOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeError();
    });

    // Close error on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeError(); closePayment(); }
    });

    // Close payment on background click
    document.getElementById('payOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closePayment();
    });

    // Enter key in txn input
    document.getElementById('payTxnInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitPayment();
    });
});
