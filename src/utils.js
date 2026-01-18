// ===== UTILITY FUNCTIONS =====

/**
 * Create Element - Creates an HTML element with specified properties
 */
export function ce(params = {}) {
    const element = document.createElement(params.tag || 'div');
    
    if (params.className) element.className = params.className;
    if (params.id) element.id = params.id;
    if (params.text) element.textContent = params.text;
    if (params.html) element.innerHTML = params.html;
    
    if (params.attrs) {
        Object.keys(params.attrs).forEach(key => {
            element.setAttribute(key, params.attrs[key]);
        });
    }
    
    if (params.style) {
        Object.assign(element.style, params.style);
    }
    
    if (params.onclick) {
        if (typeof params.onclick === 'function') {
            element.addEventListener('click', params.onclick);
        }
    }
    
    if (params.children) {
        params.children.filter(Boolean).forEach(child => {
            element.appendChild(child);
        });
    }
    
    return element;
}

/**
 * Calculate distance between two systems
 */
export function calculateDistance(system1, system2) {
    const dx = system2.x - system1.x;
    const dy = system2.y - system1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Close the current modal
 */
export function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}
