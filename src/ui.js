import { ce, closeModal } from './utils.js';

// Re-export ce for convenience
export { ce } from './utils.js';

/**
 * Create a colored span based on a ratio value
 * @param {string} text - The text to display
 * @param {number} ratio - The ratio value (0.0 to 4.0+)
 * @returns {string} - HTML string with colored span
 */
export function statColorSpan(text, ratio) {
    let color;
    
    if (ratio <= 0.5) {
        // Dark red to red (0.0 - 0.5)
        const intensity = Math.floor(100 + (ratio / 0.5) * 100); // 100-200
        color = `rgb(${intensity}, 0, 0)`;
    } else if (ratio <= 0.75) {
        // Red to orange (0.5 - 0.75)
        const t = (ratio - 0.5) / 0.25;
        const r = 200;
        const g = Math.floor(t * 100); // 0-100
        color = `rgb(${r}, ${g}, 0)`;
    } else if (ratio <= 1.0) {
        // Orange to yellow to white (0.75 - 1.0)
        const t = (ratio - 0.75) / 0.25;
        const r = 200 + Math.floor(t * 55); // 200-255
        const g = 100 + Math.floor(t * 155); // 100-255
        const b = Math.floor(t * 255); // 0-255
        color = `rgb(${r}, ${g}, ${b})`;
    } else if (ratio <= 1.5) {
        // White to light green (1.0 - 1.5)
        const t = (ratio - 1.0) / 0.5;
        const r = 255 - Math.floor(t * 105); // 255-150
        const g = 255;
        const b = 255 - Math.floor(t * 105); // 255-150
        color = `rgb(${r}, ${g}, ${b})`;
    } else if (ratio <= 2.5) {
        // Light green to green (1.5 - 2.5)
        const t = (ratio - 1.5) / 1.0;
        const r = 150 - Math.floor(t * 150); // 150-0
        const g = 255;
        const b = 150 - Math.floor(t * 150); // 150-0
        color = `rgb(${r}, ${g}, ${b})`;
    } else {
        // Green to dark green (2.5 - 4.0+)
        const t = Math.min((ratio - 2.5) / 1.5, 1.0);
        const g = 255 - Math.floor(t * 155); // 255-100
        color = `rgb(0, ${g}, 0)`;
    }
    
    return `<span style="color: ${color};">${text}</span>`;
}

/**
 * Menu class with integrated tabs, scrollable content, and fixed buttons
 */
export class Menu {
    constructor(params = {}) {
        this.tabs = params.tabs || [];
        this.activeTabIndex = 0;
        this.container = null;
        this.tabContentElements = [];
        this.buttonContainer = null;
    }

    render() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = '';

        // Create tab buttons
        const tabButtons = this.tabs.map((tab, index) => 
            ce({
                tag: 'button',
                className: index === 0 ? 'tab-button active' : 'tab-button',
                text: tab.label,
                attrs: { 'data-tab-index': index },
                onclick: () => this.switchTab(index)
            })
        );

        // Create tab header
        const tabsHeader = ce({
            className: 'menu-tabs-header',
            children: tabButtons
        });

        // Create tab content elements
        this.tabContentElements = this.tabs.map((tab, index) => {
            const content = typeof tab.content === 'string' 
                ? ce({ html: tab.content })
                : tab.content;
            
            return ce({
                className: index === 0 ? 'menu-tab-content active' : 'menu-tab-content',
                attrs: { 'data-tab-index': index },
                children: [content]
            });
        });

        // Create scrollable content container
        const contentContainer = ce({
            className: 'menu-content-container',
            children: this.tabContentElements
        });

        // Create button container
        this.buttonContainer = ce({
            className: 'menu-button-container'
        });

        // Create menu
        this.container = ce({
            className: 'menu',
            children: [
                tabsHeader,
                contentContainer,
                this.buttonContainer
            ]
        });

        gameContainer.appendChild(this.container);

        // Activate first tab
        if (this.tabs[0]?.onActivate) {
            setTimeout(() => this.tabs[0].onActivate(), 0);
        }
    }

    switchTab(index) {
        this.activeTabIndex = index;

        // Update tab buttons
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach((btn, idx) => {
            btn.classList.toggle('active', idx === index);
        });

        // Update tab content
        this.tabContentElements.forEach((content, idx) => {
            content.classList.toggle('active', idx === index);
        });

        // Clear buttons
        this.buttonContainer.innerHTML = '';

        // Call onActivate for new tab
        if (this.tabs[index]?.onActivate) {
            this.tabs[index].onActivate();
        }
    }

    getButtonContainer() {
        return this.buttonContainer;
    }
}

/**
 * Display a menu with title, content, and buttons (legacy function)
 */
export function showMenu(params = {}) {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    const buttons = params.buttons || [];
    const buttonElements = buttons.map(btn => 
        ce({
            tag: 'button',
            className: 'menu-button',
            text: btn.text,
            onclick: btn.action
        })
    );
    
    const menu = ce({
        className: 'menu',
        children: [
            params.title ? ce({
                className: 'menu-title',
                text: params.title
            }) : null,
            params.content ? ce({
                className: 'menu-content',
                html: params.content
            }) : null,
            ce({
                className: 'menu-buttons',
                children: buttonElements
            })
        ].filter(Boolean)
    });
    
    container.appendChild(menu);
}

/**
 * Show a modal dialog
 */
export function showModal(params = {}) {
    const buttons = params.buttons || [];
    const buttonElements = buttons.map(btn => 
        ce({
            tag: 'button',
            className: btn.danger ? 'modal-button danger' : 'modal-button',
            text: btn.text,
            onclick: btn.action === 'close' ? closeModal : btn.action
        })
    );
    
    // Handle content - can be string or HTMLElement
    let contentElement = null;
    if (params.content) {
        if (typeof params.content === 'string') {
            contentElement = ce({
                className: 'modal-content',
                html: params.content
            });
        } else {
            // Wrap HTMLElement in modal-content div
            contentElement = ce({
                className: 'modal-content',
                children: [params.content]
            });
        }
    }
    
    const modal = ce({
        className: 'modal',
        children: [
            params.title ? ce({
                className: 'modal-title',
                text: params.title
            }) : null,
            contentElement,
            ce({
                className: 'modal-buttons',
                children: buttonElements
            })
        ].filter(Boolean)
    });
    
    const overlay = ce({
        className: 'modal-overlay',
        children: [modal]
    });
    
    document.body.appendChild(overlay);
}

/**
 * Create a data table with selectable rows
 */
export function createDataTable(params = {}) {
    const tableId = params.id || 'data-table-' + Date.now();
    
    const headerRow = ce({
        tag: 'tr',
        children: params.headers.map(header => 
            ce({ tag: 'th', text: header })
        )
    });
    
    const bodyRows = params.rows.map((row, index) => {
        const tr = ce({
            tag: 'tr',
            children: row.cells.map(cell => 
                ce({ tag: 'td', html: cell })
            ),
            onclick: () => {
                document.querySelectorAll('.data-table tbody tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
                if (params.onSelect) params.onSelect(row, index);
            }
        });
        return tr;
    });
    
    const table = ce({
        tag: 'table',
        className: 'data-table',
        id: tableId,
        children: [
            ce({
                tag: 'thead',
                children: [headerRow]
            }),
            ce({
                tag: 'tbody',
                children: bodyRows
            })
        ]
    });
    
    // Auto-select first row if specified and rows exist
    if (params.autoSelectFirst && bodyRows.length > 0) {
        setTimeout(() => {
            bodyRows[0].classList.add('selected');
            if (params.onSelect) params.onSelect(params.rows[0], 0);
        }, 0);
    }
    
    return params.scrollable ? ce({
        className: 'table-container',
        children: [table]
    }) : table;
}

/**
 * Create a button with optional disabled state and tooltip
 */
export function createButton(params = {}) {
    const button = ce({
        tag: 'button',
        className: params.className || 'menu-button',
        text: params.text,
        onclick: params.disabled ? null : params.action
    });
    
    if (params.disabled) {
        button.disabled = true;
    }
    
    if (params.disabled && params.disabledReason) {
        const wrapper = ce({
            className: 'tooltip',
            children: [
                button,
                ce({
                    className: 'tooltip-text',
                    text: params.disabledReason
                })
            ]
        });
        return wrapper;
    }
    
    return button;
}

/**
 * Create a two-column layout
 */
export function createTwoColumnLayout(params = {}) {
    const leftCol = ce({
        className: 'column',
        ...(typeof params.leftColumn === 'string' ? { html: params.leftColumn } : { children: [params.leftColumn] })
    });
    
    const rightCol = ce({
        className: 'column',
        ...(typeof params.rightColumn === 'string' ? { html: params.rightColumn } : { children: [params.rightColumn] })
    });
    
    return ce({
        className: 'two-column-layout',
        children: [leftCol, rightCol]
    });
}

/**
 * Create tabs interface
 */
export function createTabs(tabs) {
    const tabButtons = tabs.map((tab, index) => 
        ce({
            tag: 'button',
            className: index === 0 ? 'tab-button active' : 'tab-button',
            text: tab.label,
            attrs: { 
                'data-tab-index': index,
                'data-tab': tab.id || tab.label.toLowerCase()
            },
            onclick: (e) => {
                switchTab(e.target);
                if (tab.onActivate) tab.onActivate();
            }
        })
    );
    
    const tabContents = tabs.map((tab, index) => 
        ce({
            className: index === 0 ? 'tab-content active' : 'tab-content',
            ...(typeof tab.content === 'string' ? { html: tab.content } : { children: [tab.content] }),
            attrs: { 'data-tab-index': index }
        })
    );
    
    const container = ce({
        className: 'tabs-container',
        children: [
            ce({
                className: 'tabs-header',
                children: tabButtons
            }),
            ...tabContents
        ]
    });
    
    if (tabs[0].onActivate) {
        // Use setTimeout to ensure DOM is ready before calling onActivate
        setTimeout(() => tabs[0].onActivate(), 0);
    }
    
    return container;
}

/**
 * Switch active tab
 */
function switchTab(button) {
    const index = button.getAttribute('data-tab-index');
    const container = button.closest('.tabs-container');
    
    // Clear button container when switching tabs
    const buttonContainer = document.getElementById('tab-buttons');
    if (buttonContainer) {
        buttonContainer.innerHTML = '';
    }
    
    container.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    container.querySelectorAll('.tab-content').forEach(content => {
        const contentIndex = content.getAttribute('data-tab-index');
        content.classList.toggle('active', contentIndex === index);
    });
}

/**
 * Create top-left icon buttons
 */
export function createTopButtons(callbacks = {}) {
    const existing = document.querySelector('.top-right-buttons');
    if (existing) existing.remove();
    
    // Determine system button icon and callback based on active journey
    const hasActiveJourney = window.gameState?.activeJourney;
    const systemIcon = hasActiveJourney ? '⭐' : '🏙️'; // Star when traveling, city when docked
    const systemCallback = hasActiveJourney 
        ? () => import('./menus/travelEncounterMenu.js').then(m => m.showTravelEncounterMenu())
        : callbacks.showSystem;
    
    const buttonsContainer = ce({
        className: 'top-right-buttons',
        children: [
            ce({
                tag: 'button',
                className: window.currentViewMode === 'system' ? 'icon-button active' : 'icon-button',
                html: systemIcon,
                attrs: { title: 'System', 'data-mode': 'system' },
                onclick: () => switchViewMode('system', { ...callbacks, showSystem: systemCallback })
            }),
            ce({
                tag: 'button',
                className: window.currentViewMode === 'fleet' ? 'icon-button active' : 'icon-button',
                html: '🚀', // Flying saucer/ship emoji
                attrs: { title: 'Fleet', 'data-mode': 'fleet' },
                onclick: () => switchViewMode('fleet', callbacks)
            }),
            ce({
                tag: 'button',
                className: window.currentViewMode === 'captain' ? 'icon-button active' : 'icon-button',
                html: '👤', // Bust in silhouette/person emoji
                attrs: { title: 'Captain', 'data-mode': 'captain' },
                onclick: () => switchViewMode('captain', callbacks)
            }),
            ce({
                tag: 'button',
                className: window.currentViewMode === 'journal' ? 'icon-button active' : 'icon-button',
                html: '📖', // Open book emoji
                attrs: { title: 'Journal', 'data-mode': 'journal' },
                onclick: () => switchViewMode('journal', callbacks)
            }),
            ce({
                tag: 'button',
                className: window.currentViewMode === 'assistant' ? 'icon-button active' : 'icon-button',
                html: '❓', // Computer emoji
                attrs: { title: 'Assistant', 'data-mode': 'assistant' },
                onclick: () => switchViewMode('assistant', callbacks)
            }),
            ce({
                tag: 'button',
                className: window.currentViewMode === 'options' ? 'icon-button active' : 'icon-button',
                html: '⚙', // Settings gear emoji
                attrs: { title: 'Options', 'data-mode': 'options' },
                onclick: () => switchViewMode('options', callbacks)
            })
        ]
    });
    
    document.body.appendChild(buttonsContainer);
}

/**
 * Switch between system, fleet, captain, journal, assistant, and options views
 */
function switchViewMode(mode, callbacks) {
    if (window.currentViewMode === mode) return; // Already in this mode
    
    window.currentViewMode = mode;
    
    // Update button states
    document.querySelectorAll('.top-right-buttons .icon-button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    
    // Call the appropriate callback
    if (mode === 'system' && callbacks.showSystem) {
        callbacks.showSystem();
    } else if (mode === 'fleet' && callbacks.showFleet) {
        callbacks.showFleet();
    } else if (mode === 'captain' && callbacks.showCaptain) {
        callbacks.showCaptain();
    } else if (mode === 'journal' && callbacks.showJournal) {
        callbacks.showJournal();
    } else if (mode === 'assistant' && callbacks.showAssistant) {
        callbacks.showAssistant();
    } else if (mode === 'options' && callbacks.showOptions) {
        callbacks.showOptions();
    }
}
