import { ce, createDataTable, createButton, statColorSpan } from '../ui.js';
import { generateShip } from '../generators/shipGenerators.js';
import { SCOUT, FREIGHTER, DESTROYER, AVERAGE_SHIP } from '../defs/SHIP_TYPES.js';

let shipyardMode = 'sell'; // 'buy' or 'sell'

export function getShipyardContent() {
    return `
        <div id="shipyard-container"></div>
    `;
}

export function renderShipyardTable() {
    const container = document.getElementById('shipyard-container');
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!container || !buttonsDiv) return;
    
    container.innerHTML = '';
    
    const fees = window.gameState.currentSystem?.fees || 1.0;
    
    // Generate ships for sale once
    const shipsForSale = [
        generateShip(SCOUT, false),
        generateShip(FREIGHTER, false),
        generateShip(DESTROYER, false)
    ];
    
    if (shipyardMode === 'sell') {
        // Show player's ships (for selling)
        const yourShipsSection = ce({
            className: 'stats-group',
            style: { marginTop: '20px' },
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Your Ships' })
            ]
        });
        
        const yourShipsTable = createDataTable({
            id: 'your-ships',
            scrollable: true,
            autoSelectFirst: true,
            headers: ['Name', 'Type', 'Hull', 'Shields', 'Speed', 'Weapons', 'Fuel', 'Status'],
            rows: window.gameState.ownedShips.map((ship, idx) => {
                // Calculate ratios vs average ship
                const hullRatio = ship.maxHull / AVERAGE_SHIP.hull;
                const shieldsRatio = ship.maxShields / AVERAGE_SHIP.shields;
                const speedRatio = ship.speed / AVERAGE_SHIP.speed;
                const weaponsRatio = ship.weapons / AVERAGE_SHIP.weapons;
                const fuelRatio = ship.maxFuel / AVERAGE_SHIP.fuel;
                
                return {
                    cells: [
                        ship.name, 
                        ship.type, 
                        statColorSpan(`${ship.hull}/${ship.maxHull}`, hullRatio),
                        statColorSpan(`${ship.shields}/${ship.maxShields}`, shieldsRatio),
                        statColorSpan(`${ship.speed.toFixed(1)}x`, speedRatio),
                        statColorSpan(ship.weapons.toString(), weaponsRatio),
                        statColorSpan(ship.maxFuel.toString(), fuelRatio),
                        ship === window.gameState.ship ? '<span style="color: #0bf;">ACTIVE</span>' : `${ship.value} cr`
                    ],
                    data: { ship, index: idx }
                };
            }),
            onSelect: (rowData) => {
                window.selectedOwnedShip = rowData.data;
                window.selectedShipToBuy = null;
                renderShipyardButtons();
            }
        });
        
        yourShipsSection.appendChild(yourShipsTable);
        container.appendChild(yourShipsSection);
    } else {
        // Show ships for sale (for buying)
        const shipsSection = ce({
            className: 'stats-group',
            style: { marginTop: '20px' },
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Ships for Sale' })
            ]
        });
        
        const shipsTable = createDataTable({
            id: 'ships-for-sale',
            scrollable: true,
            autoSelectFirst: true,
            headers: ['Name', 'Type', 'Hull', 'Shields', 'Speed', 'Weapons', 'Fuel', 'Price'],
            rows: shipsForSale.map((ship, idx) => {
                const basePrice = ship.value;
                const effectivePrice = Math.round(basePrice * fees);
                const priceRatio = effectivePrice / basePrice;
                
                // Calculate ratios vs average ship
                const hullRatio = ship.maxHull / AVERAGE_SHIP.hull;
                const shieldsRatio = ship.maxShields / AVERAGE_SHIP.shields;
                const speedRatio = ship.speed / AVERAGE_SHIP.speed;
                const weaponsRatio = ship.weapons / AVERAGE_SHIP.weapons;
                const fuelRatio = ship.maxFuel / AVERAGE_SHIP.fuel;
                
                return {
                    cells: [
                        ship.name, 
                        ship.type, 
                        statColorSpan(ship.maxHull.toString(), hullRatio),
                        statColorSpan(ship.maxShields.toString(), shieldsRatio),
                        statColorSpan(`${ship.speed.toFixed(1)}x`, speedRatio),
                        statColorSpan(ship.weapons.toString(), weaponsRatio),
                        statColorSpan(ship.maxFuel.toString(), fuelRatio),
                        statColorSpan(`${effectivePrice} cr`, priceRatio)
                    ],
                    data: { ship, index: idx, effectivePrice }
                };
            }),
            onSelect: (rowData) => {
                window.selectedShipToBuy = rowData.data;
                window.selectedOwnedShip = null;
                renderShipyardButtons();
            }
        });
        
        shipsSection.appendChild(shipsTable);
        container.appendChild(shipsSection);
    }
    
    renderShipyardButtons();
}

function renderShipyardButtons() {
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!buttonsDiv) return;
    
    // Clear buttons but we'll rebuild including toggle
    buttonsDiv.innerHTML = '';
    
    // Add toggle button first
    const toggleBtn = createButton({
        id: 'shipyard-mode-toggle',
        text: shipyardMode === 'buy' ? 'Show Your Ships' : 'Show Ships for Sale',
        action: () => {
            shipyardMode = shipyardMode === 'buy' ? 'sell' : 'buy';
            window.selectedOwnedShip = null;
            window.selectedShipToBuy = null;
            renderShipyardTable();
        }
    });
    buttonsDiv.appendChild(toggleBtn);
    
    if (window.selectedShipToBuy) {
        const { ship, effectivePrice } = window.selectedShipToBuy;
        const canAfford = window.gameState.captain.credits >= effectivePrice;
        
        buttonsDiv.appendChild(createButton({
            text: `Purchase Ship (${effectivePrice} cr)`,
            action: () => buyShip(window.selectedShipToBuy.index),
            disabled: !canAfford,
            disabledReason: canAfford ? '' : `Need ${effectivePrice} credits (have ${window.gameState.captain.credits})`
        }));
    }
    
    if (window.selectedOwnedShip) {
        const { ship, index } = window.selectedOwnedShip;
        const isActive = ship === window.gameState.ship;
        
        // Repair button
        const damageAmount = ship.maxHull - ship.hull;
        const repairCost = damageAmount * 5;
        const canAffordRepair = window.gameState.captain.credits >= repairCost;
        const needsRepair = damageAmount > 0;
        
        buttonsDiv.appendChild(createButton({
            text: `Repair Hull (${repairCost} cr)`,
            action: () => repairShip(index),
            disabled: !needsRepair || !canAffordRepair,
            disabledReason: !needsRepair ? 'Hull at full integrity' : 
                          !canAffordRepair ? `Need ${repairCost} credits (have ${window.gameState.captain.credits})` : ''
        }));
        
        // Refuel button
        const fuelNeeded = ship.maxFuel - ship.fuel;
        const refuelCost = fuelNeeded * 3;
        const canAffordRefuel = window.gameState.captain.credits >= refuelCost;
        const needsFuel = fuelNeeded > 0;
        
        buttonsDiv.appendChild(createButton({
            text: `Refuel (${refuelCost} cr)`,
            action: () => refuelShip(index),
            disabled: !needsFuel || !canAffordRefuel,
            disabledReason: !needsFuel ? 'Fuel tank full' :
                          !canAffordRefuel ? `Need ${refuelCost} credits (have ${window.gameState.captain.credits})` : ''
        }));
        
        if (!isActive) {
            buttonsDiv.appendChild(createButton({
                text: 'Switch To Ship',
                action: () => switchToShip(index)
            }));
            
            const canSell = window.gameState.ownedShips.length > 1;
            buttonsDiv.appendChild(createButton({
                text: `Sell Ship (${ship.value} cr)`,
                action: () => sellShip(index),
                disabled: !canSell,
                disabledReason: canSell ? '' : 'Cannot sell your last ship'
            }));
        }
    }
}

function buyShip(index) {
    const shipsForSale = [
        generateShip(SCOUT, false),
        generateShip(FREIGHTER, false),
        generateShip(DESTROYER, false)
    ];
    
    const newShip = shipsForSale[index];
    const fees = window.gameState.currentSystem?.fees || 1.0;
    const effectivePrice = Math.round(newShip.value * fees);
    
    if (window.gameState.spendCredits(effectivePrice)) {
        window.gameState.ownedShips.push(newShip);
        window.selectedShipToBuy = null;
        renderShipyardTable();
    }
}

function switchToShip(index) {
    window.gameState.ship = window.gameState.ownedShips[index];
    renderShipyardTable();
}

function repairShip(index) {
    const ship = window.gameState.ownedShips[index];
    const damageAmount = ship.maxHull - ship.hull;
    const repairCost = damageAmount * 5;
    
    if (window.gameState.spendCredits(repairCost)) {
        ship.repair(damageAmount);
        renderShipyardTable();
    }
}

function refuelShip(index) {
    const ship = window.gameState.ownedShips[index];
    const fuelNeeded = ship.maxFuel - ship.fuel;
    const refuelCost = fuelNeeded * 3;
    
    if (window.gameState.spendCredits(refuelCost)) {
        ship.fuel = ship.maxFuel;
        renderShipyardTable();
    }
}

function sellShip(index) {
    if (window.gameState.ownedShips.length <= 1) return;
    
    const ship = window.gameState.ownedShips[index];
    window.gameState.addCredits(ship.value);
    window.gameState.ownedShips.splice(index, 1);
    renderShipyardTable();
}
