import { ce, createDataTable, createButton, showModal, statColorSpan } from '../ui.js';
import { showMainMenu } from './mainMenu.js';
import { CARGO_TYPES } from '../defs/CARGO_TYPES.js';

let marketMode = 'buy'; // 'buy' or 'sell'

// Calculate effective fees after barter skill
function getEffectiveFees(system) {
    const barterLevel = window.gameState.captain.skills.barter;
    const feeReduction = barterLevel * 0.05; // 5% per level
    return Math.max(0, system.fees - feeReduction);
}

// Calculate buy price (higher with fees)
function getBuyPrice(basePrice, system) {
    const effectiveFees = getEffectiveFees(system);
    return Math.ceil(basePrice * (1 + effectiveFees));
}

// Calculate sell price (lower with fees)
function getSellPrice(basePrice, system) {
    const effectiveFees = getEffectiveFees(system);
    return Math.floor(basePrice * (1 - effectiveFees));
}

export function getMarketContent(system) {
    return `
        <div class="stats-group" style="margin-bottom: 15px;">
            <div class="stat-line">
                <span class="stat-label">Cargo Space:</span>
                <span class="stat-value">${window.gameState.getTotalCargo()}/${window.gameState.ship.maxCargo}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Credits:</span>
                <span class="stat-value">${window.gameState.captain.credits}</span>
            </div>
        </div>
        <div id="market-container"></div>
    `;
}

export function renderMarketTable(system) {
    const container = document.getElementById('market-container');
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!container || !buttonsDiv) return;
    
    container.innerHTML = '';
    
    const goods = ['food', 'water', 'air'];
    
    if (marketMode === 'buy') {
        // Show market prices (for buying)
        const marketSection = ce({
            className: 'stats-group',
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Market Prices' })
            ]
        });
    
    const marketTable = createDataTable({
        id: 'market-goods',
        scrollable: true,
        autoSelectFirst: true,
        headers: ['Commodity', 'Buy Price', 'Sell Price', 'Base', 'Available'],
        rows: goods.map(good => {
            const cargoType = CARGO_TYPES[good];
            const basePrice = cargoType.baseValue;
            const buyPrice = getBuyPrice(system.marketPrices[good], system);
            const sellPrice = getSellPrice(system.marketPrices[good], system);
            
            // For buy price: higher is worse, so invert ratio (4x buy = 0.25 ratio = bad/red)
            const buyRatio = basePrice / buyPrice; // If buyPrice is 4x base, ratio = 0.25
            // For sell price: higher is better (4x sell = 4.0 ratio = good/green)
            const sellRatio = sellPrice / basePrice; // If sellPrice is 4x base, ratio = 4.0
            
            return {
                cells: [
                    good.charAt(0).toUpperCase() + good.slice(1),
                    statColorSpan(`${buyPrice} cr`, buyRatio),
                    statColorSpan(`${sellPrice} cr`, sellRatio),
                    `${basePrice} cr`,
                    `${system.cargo[good]} units`
                ],
                data: { good, buyPrice, sellPrice, basePrice, available: system.cargo[good] }
            };
        }),
        onSelect: (rowData) => {
            window.selectedMarketGood = rowData.data;
            window.selectedCargoGood = null;
            renderMarketButtons(system);
        }
    });
    
    marketSection.appendChild(marketTable);
    container.appendChild(marketSection);
    } else {
        // Show cargo (for selling)
        const cargoSection = ce({
            className: 'stats-group',
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Your Cargo' })
            ]
        });
        
        const cargoItems = Object.entries(window.gameState.ship.cargo);
        
        if (cargoItems.length > 0) {
            const cargoTable = createDataTable({
                id: 'cargo-goods',
                scrollable: true,
                autoSelectFirst: true,
                headers: ['Commodity', 'Quantity', 'Value'],
                rows: cargoItems.map(([good, qty]) => {
                    const sellPrice = getSellPrice(system.marketPrices[good], system);
                    return {
                        cells: [
                            good.charAt(0).toUpperCase() + good.slice(1),
                            `${qty} units`,
                            `${sellPrice * qty} cr`
                        ],
                        data: { good, quantity: qty, sellPrice }
                    };
                }),
                onSelect: (rowData) => {
                    window.selectedCargoGood = rowData.data;
                    window.selectedMarketGood = null;
                    renderMarketButtons(system);
                }
            });
            
            cargoSection.appendChild(cargoTable);
        } else {
            cargoSection.appendChild(ce({
                tag: 'p',
                style: { textAlign: 'center', color: '#888', padding: '20px' },
                text: 'Cargo hold is empty'
            }));
        }
        
        container.appendChild(cargoSection);
    }
    
    renderMarketButtons(system);
}

function renderMarketButtons(system) {
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    // Add toggle button first
    const toggleBtn = createButton({
        id: 'market-mode-toggle',
        text: marketMode === 'buy' ? 'Show Your Cargo' : 'Show Market Prices',
        action: () => {
            marketMode = marketMode === 'buy' ? 'sell' : 'buy';
            window.selectedMarketGood = null;
            window.selectedCargoGood = null;
            renderMarketTable(system);
        }
    });
    buttonsDiv.appendChild(toggleBtn);
    
    if (window.selectedMarketGood) {
        const { good, buyPrice, sellPrice, available } = window.selectedMarketGood;
        const cargoSpace = window.gameState.ship.maxCargo - window.gameState.getTotalCargo();
        const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
        const systemCargo = currentSystem.cargo[good] || 0;
        
        const canBuy1 = window.gameState.captain.credits >= buyPrice && cargoSpace >= 1 && systemCargo >= 1;
        const buy1Reason = systemCargo < 1 ? 'Market out of stock' :
                          window.gameState.captain.credits < buyPrice ? `Need ${buyPrice} credits (have ${window.gameState.captain.credits})` :
                          cargoSpace < 1 ? 'Cargo hold is full' : '';
        
        buttonsDiv.appendChild(createButton({
            text: `Buy 1 ${good} (${buyPrice} cr)`,
            action: () => buyGood(good, buyPrice, 1, system),
            disabled: !canBuy1,
            disabledReason: buy1Reason
        }));
        
        const qty10Cost = buyPrice * 10;
        const canBuy10 = window.gameState.captain.credits >= qty10Cost && cargoSpace >= 10 && systemCargo >= 10;
        const buy10Reason = systemCargo < 10 ? `Only ${systemCargo} units available` :
                           window.gameState.captain.credits < qty10Cost ? `Need ${qty10Cost} credits (have ${window.gameState.captain.credits})` :
                           cargoSpace < 10 ? `Need ${10 - cargoSpace} more cargo space` : '';
        
        buttonsDiv.appendChild(createButton({
            text: `Buy 10 ${good} (${qty10Cost} cr)`,
            action: () => buyGood(good, buyPrice, 10, system),
            disabled: !canBuy10,
            disabledReason: buy10Reason
        }));
    }
    
    if (window.selectedCargoGood) {
        const { good, quantity, sellPrice } = window.selectedCargoGood;
        
        buttonsDiv.appendChild(createButton({
            text: `Sell 1 ${good} (${sellPrice} cr)`,
            action: () => sellGood(good, sellPrice, 1, system),
            disabled: quantity < 1,
            disabledReason: quantity < 1 ? 'Not enough cargo' : ''
        }));
        
        buttonsDiv.appendChild(createButton({
            text: `Sell 10 ${good} (${sellPrice * 10} cr)`,
            action: () => sellGood(good, sellPrice, 10, system),
            disabled: quantity < 10,
            disabledReason: quantity < 10 ? `Only have ${quantity} units` : ''
        }));
        
        buttonsDiv.appendChild(createButton({
            text: `Sell All ${good} (${sellPrice * quantity} cr)`,
            action: () => sellGood(good, sellPrice, quantity, system),
            disabled: quantity < 1,
            disabledReason: quantity < 1 ? 'Not enough cargo' : ''
        }));
    }
    
    if (!window.selectedMarketGood && !window.selectedCargoGood) {
        // Don't clear the toggle button - just add message after it
        const messageP = ce({
            tag: 'p',
            style: { color: '#888', textAlign: 'center', width: '100%', marginTop: '1rem' },
            text: 'Select a commodity to trade'
        });
        buttonsDiv.appendChild(messageP);
    }
}

function buyGood(good, price, quantity, system) {
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    const available = currentSystem.cargo[good] || 0;
    
    if (available >= quantity && window.gameState.spendCredits(price * quantity) && window.gameState.addCargo(good, quantity)) {
        currentSystem.cargo[good] -= quantity;
        renderMarketTable(currentSystem);
    }
}

function sellGood(good, price, quantity, system) {
    if (window.gameState.removeCargo(good, quantity)) {
        window.gameState.addCredits(price * quantity);
        const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
        currentSystem.cargo[good] = (currentSystem.cargo[good] || 0) + quantity;
        renderMarketTable(currentSystem);
    }
}
