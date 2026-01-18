import { ce, createDataTable, createButton } from '../ui.js';
import { showMainMenu } from './mainMenu.js';
import { CARGO_TYPES } from '../defs/CARGO_TYPES.js';

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
        <div class="two-column-layout">
            <div class="column" id="market-left"></div>
            <div class="column" id="market-right"></div>
        </div>
    `;
}

export function renderMarketTable(system) {
    const leftCol = document.getElementById('market-left');
    const rightCol = document.getElementById('market-right');
    const buttonsDiv = document.getElementById('tab-buttons');
    if (!leftCol || !rightCol || !buttonsDiv) return;
    
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';
    buttonsDiv.innerHTML = '';
    
    const goods = ['food', 'water', 'air'];
    
    const marketSection = ce({
        className: 'stats-group',
        children: [
            ce({ tag: 'h4', style: { color: '#0bf', marginBottom: '10px' }, text: 'Market Prices' })
        ]
    });
    
    const marketTable = createDataTable({
        id: 'market-goods',
        scrollable: true,
        headers: ['Commodity', 'Buy Price', 'Sell Price', 'Base', 'Available'],
        rows: goods.map(good => {
            const cargoType = CARGO_TYPES[good];
            const basePrice = cargoType.baseValue;
            const buyPrice = getBuyPrice(system.marketPrices[good], system);
            const sellPrice = getSellPrice(system.marketPrices[good], system);
            
            return {
                cells: [
                    good.charAt(0).toUpperCase() + good.slice(1),
                    `${buyPrice} cr`,
                    `${sellPrice} cr`,
                    `${basePrice} cr`,
                    `${system.cargo[good]} units`
                ],
                data: { good, buyPrice, sellPrice, basePrice, available: system.cargo[good] }
            };
        }),
        onSelect: (rowData) => {
            window.selectedMarketGood = rowData.data;
            renderMarketButtons(system);
        }
    });
    
    marketSection.appendChild(marketTable);
    leftCol.appendChild(marketSection);
    
    const cargoSection = ce({
        className: 'stats-group',
        children: [
            ce({ tag: 'h4', style: { color: '#0bf', marginBottom: '10px' }, text: 'Your Cargo' })
        ]
    });
    
    const cargoItems = Object.entries(window.gameState.ship.cargo);
    
    if (cargoItems.length > 0) {
        const cargoTable = createDataTable({
            id: 'cargo-goods',
            scrollable: true,
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
    
    rightCol.appendChild(cargoSection);
    
    renderMarketButtons(system);
}

function renderMarketButtons(system) {
    const buttonsDiv = document.getElementById('market-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
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
        buttonsDiv.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Select a commodity to trade</p>';
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
