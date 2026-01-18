import { Menu, createDataTable, createButton, ce, statColorSpan } from '../ui.js';
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
    
    // Get current system and all reachable seen systems
    const currentSystem = {
        system: window.gameState.starSystems[window.gameState.currentSystemIndex],
        index: window.gameState.currentSystemIndex,
        isCurrent: true
    };
    
    const reachableSystems = window.gameState.starSystems
        .map((system, index) => ({ system, index, isCurrent: false }))
        .filter(({ system, index }) => {
            // Skip current system (we'll add it separately)
            if (index === window.gameState.currentSystemIndex) return false;
            
            // Only show seen systems
            if (!window.gameState.seenStarSystems.has(system)) return false;
            
            // Check if reachable with current fuel
            const { canReach } = window.gameState.canReachSystem(system);
            return canReach;
        });
    
    // Add current system at the beginning
    const allSystems = [currentSystem, ...reachableSystems];
    
    if (allSystems.length === 1) { // Only current system, no reachable systems
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No reachable systems. Refuel to see trade opportunities.</p>';
        renderTradeInfoButtons();
        return;
    }
    
    // Get cargo types
    const cargoTypes = Object.keys(CARGO_TYPES);
    
    // Build table headers
    const headers = ['System', 'Distance', ...cargoTypes.map(type => CARGO_TYPES[type].name)];
    
    // Build table rows
    const rows = allSystems.map(({ system, isCurrent }) => {
        const { distance } = isCurrent ? { distance: 0 } : window.gameState.canReachSystem(system);
        
        const cells = [
            isCurrent ? `⭐ ${system.name}` : system.name,
            isCurrent ? '-' : `${distance.toFixed(1)} ly`,
            ...cargoTypes.map(type => {
                const baseValue = CARGO_TYPES[type].baseValue;
                const marketPrice = system.marketPrices[type];
                
                if (showBuyPrices) {
                    // For buying: lower price is better, so invert the ratio
                    // ratio < 1 means good deal (green), ratio > 1 means bad deal (red)
                    const ratio = baseValue / marketPrice;
                    return statColorSpan(`${marketPrice} cr`, ratio);
                } else {
                    // For selling: higher price is better (70% of market price)
                    const sellPrice = Math.floor(marketPrice * 0.7);
                    // ratio > 1 means good deal (green), ratio < 1 means bad deal (red)
                    const ratio = sellPrice / baseValue;
                    return statColorSpan(`${sellPrice} cr`, ratio);
                }
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
        autoSelectFirst: true,
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
