import { Menu, createDataTable, createButton, ce } from '../ui.js';
import { CARGO_TYPES } from '../defs/CARGO_TYPES.js';

let showBuyPrices = true; // Toggle between buy/sell prices

export function showAssistantMenu() {
    const menu = new Menu({
        tabs: [
            { 
                label: 'Trade Info', 
                content: getTradeInfoContent(),
                onActivate: renderTradeInfo
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getTradeInfoContent() {
    return ce({
        children: [
            ce({ 
                tag: 'p', 
                style: { marginBottom: '1rem' },
                text: `Showing ${showBuyPrices ? 'buying' : 'selling'} prices for reachable systems`
            }),
            ce({ tag: 'div', id: 'trade-info-container' })
        ]
    }).outerHTML;
}

function renderTradeInfo() {
    const container = document.getElementById('trade-info-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get all reachable seen systems
    const reachableSystems = window.gameState.starSystems
        .map((system, index) => ({ system, index }))
        .filter(({ system, index }) => {
            // Skip current system
            if (index === window.gameState.currentSystemIndex) return false;
            
            // Only show seen systems
            if (!window.gameState.seenStarSystems.has(system)) return false;
            
            // Check if reachable with current fuel
            const { canReach } = window.gameState.canReachSystem(system);
            return canReach;
        });
    
    if (reachableSystems.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No reachable systems. Refuel to see trade opportunities.</p>';
        renderTradeInfoButtons();
        return;
    }
    
    // Get cargo types
    const cargoTypes = Object.keys(CARGO_TYPES);
    
    // Build table headers
    const headers = ['System', 'Distance', ...cargoTypes.map(type => CARGO_TYPES[type].name)];
    
    // Build table rows
    const rows = reachableSystems.map(({ system }) => {
        const { distance } = window.gameState.canReachSystem(system);
        
        const cells = [
            system.name,
            `${distance.toFixed(1)} ly`,
            ...cargoTypes.map(type => {
                const price = showBuyPrices 
                    ? system.marketPrices[type] // Price at which the system sells (player buys)
                    : Math.floor(system.marketPrices[type] * 0.7); // Price at which player can sell (70% of buy price)
                return `${price} cr`;
            })
        ];
        
        return {
            cells,
            data: { system }
        };
    });
    
    const tradeTable = createDataTable({
        id: 'trade-info-table',
        scrollable: true,
        headers,
        rows,
        onSelect: (rowData) => {
            // Could add functionality to select a system for more details
        }
    });
    
    container.appendChild(tradeTable);
    renderTradeInfoButtons();
}

function renderTradeInfoButtons() {
    const buttonContainer = window.currentMenu?.getButtonContainer();
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = '';
    
    buttonContainer.appendChild(createButton({
        text: showBuyPrices ? 'Show Sell Prices' : 'Show Buy Prices',
        action: () => {
            showBuyPrices = !showBuyPrices;
            
            // Update the description text
            const descText = document.querySelector('#trade-info-container').previousElementSibling;
            if (descText) {
                descText.textContent = `Showing ${showBuyPrices ? 'buying' : 'selling'} prices for reachable systems`;
            }
            
            renderTradeInfo();
        }
    }));
}
