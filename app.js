// Unit Converter - Length, Weight, Temperature, Volume
// Enhanced with Conversion History Feature ✨

const conversions = {
    length: {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.344,
        yd: 0.9144,
        ft: 0.3048,
        in: 0.0254
    },
    weight: {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lb: 0.453592,
        oz: 0.0283495,
        st: 6.35029
    },
    temperature: {
        c: 'celsius',
        f: 'fahrenheit',
        k: 'kelvin'
    },
    volume: {
        l: 1,
        ml: 0.001,
        gal: 3.78541,
        qt: 0.946353,
        pt: 0.473176,
        cup: 0.24,
        floz: 0.0295735
    }
};

const unitNames = {
    m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters',
    mi: 'Miles', yd: 'Yards', ft: 'Feet', in: 'Inches',
    kg: 'Kilograms', g: 'Grams', mg: 'Milligrams', lb: 'Pounds', oz: 'Ounces', st: 'Stone',
    c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin',
    l: 'Liters', ml: 'Milliliters', gal: 'Gallons', qt: 'Quarts', pt: 'Pints', cup: 'Cups', floz: 'Fluid Ounces'
};

// Conversion History Management
const MAX_HISTORY_ITEMS = 10;

function getHistory() {
    const saved = localStorage.getItem('conversion-history');
    return saved ? JSON.parse(saved) : [];
}

function saveToHistory(entry) {
    const history = getHistory();
    // Add new entry to beginning
    history.unshift({
        ...entry,
        timestamp: new Date().toISOString()
    });
    // Keep only MAX_HISTORY_ITEMS
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem('conversion-history', JSON.stringify(trimmed));
    displayHistory();
}

function clearHistory() {
    localStorage.removeItem('conversion-history');
    displayHistory();
}

function formatTimeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
}

function displayHistory() {
    const history = getHistory();
    const container = document.getElementById('history-container');
    const listEl = document.getElementById('history-list');
    
    if (!container || !listEl) return;
    
    if (history.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    listEl.innerHTML = history.map(item => `
        <div class="history-item">
            <span class="history-conversion">${item.value} ${unitNames[item.from] || item.from} → ${item.result} ${unitNames[item.to] || item.to}</span>
            <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
        </div>
    `).join('');
}

function convertTemperature(value, from, to) {
    let celsius;
    
    // Convert to Celsius first
    switch(from) {
        case 'c': celsius = value; break;
        case 'f': celsius = (value - 32) * 5/9; break;
        case 'k': celsius = value - 273.15; break;
    }
    
    // Convert from Celsius to target
    switch(to) {
        case 'c': return celsius;
        case 'f': return celsius * 9/5 + 32;
        case 'k': return celsius + 273.15;
    }
}

function formatResult(value) {
    return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

function convert() {
    const category = document.getElementById('category').value;
    const value = parseFloat(document.getElementById('value').value);
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const resultDiv = document.getElementById('result');
    
    if (isNaN(value)) {
        resultDiv.innerHTML = '❌ Please enter a valid number';
        return;
    }
    
    let result;
    
    if (category === 'temperature') {
        result = convertTemperature(value, from, to);
    } else {
        const fromFactor = conversions[category][from];
        const toFactor = conversions[category][to];
        result = value * fromFactor / toFactor;
    }
    
    const formattedResult = formatResult(result);
    
    resultDiv.innerHTML = `<strong>${value} ${from} = ${formattedResult} ${to}</strong>`;
    
    // Save to history
    saveToHistory({
        value: value,
        from: from,
        to: to,
        result: formattedResult,
        category: category
    });
}

function updateUnits() {
    const category = document.getElementById('category').value;
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    const units = Object.keys(conversions[category]);
    
    fromSelect.innerHTML = units.map(u => `<option value="${u}">${unitNames[u]}</option>`).join('');
    toSelect.innerHTML = units.map(u => `<option value="${u}">${unitNames[u]}</option>`).join('');
    
    // Set different defaults
    if (units.length > 1) {
        toSelect.value = units[1];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUnits();
    displayHistory();
});

// Export for global access
window.convert = convert;
window.updateUnits = updateUnits;
window.clearHistory = clearHistory;
