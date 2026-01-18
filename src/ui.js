import { ce, closeModal } from './utils.js';

// Re-export ce for convenience
export { ce } from './utils.js';

/**
 * Display a menu with title, content, and buttons
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
            onclick: btn.action
        })
    );
    
    const modal = ce({
        className: 'modal',
        children: [
            params.title ? ce({
                className: 'modal-title',
                text: params.title
            }) : null,
            params.content ? ce({
                className: 'modal-content',
                html: params.content
            }) : null,
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
            html: tab.content,
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
        tabs[0].onActivate();
    }
    
    return container;
}

/**
 * Switch active tab
 */
function switchTab(button) {
    const index = button.getAttribute('data-tab-index');
    const container = button.closest('.tabs-container');
    
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
export function createTopButtons(showComputerScreen, showOptionsModal) {
    const existing = document.querySelector('.top-right-buttons');
    if (existing) existing.remove();
    
    const buttonsContainer = ce({
        className: 'top-right-buttons',
        children: [
            ce({
                tag: 'button',
                className: 'icon-button',
                html: '&#x1F4BB;&#xFE0E;', // Computer emoji with text variation selector for monochrome
                attrs: { title: 'Computer' },
                onclick: showComputerScreen
            }),
            ce({
                tag: 'button',
                className: 'icon-button',
                html: '&#9881;&#xFE0E;', // Settings gear with text variation selector
                attrs: { title: 'Options' },
                onclick: showOptionsModal
            })
        ]
    });
    
    document.body.appendChild(buttonsContainer);
}
