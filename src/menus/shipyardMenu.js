import { ce, createDataTable, createButton } from '../ui.js';
import { showMainMenu } from './mainMenu.js';
import { generateShip } from '../generators/shipGenerators.js';
import { SCOUT, FREIGHTER, DESTROYER } from '../defs/SHIP_TYPES.js';

export function getShipyardContent() {
    return `
        <h3 style="color: #0bf; margin-bottom: 15px;">SHIPYARD SERVICES</h3>
        <div id="shipyard-content" class="two-column-layout">
            <div class="column" id="shipyard-left"></div>
            <div class="column" id="shipyard-right"></div>
        </div>
        <div id="shipyard-buttons" class="button-container"></div>
    `;
}

export function renderShipyardTable() {
    const leftCol = document.getElementById('shipyard-left');
    const rightCol = document.getElementById('shipyard-right');
    const buttonsDiv = document.getElementById('shipyard-buttons');
    if (!leftCol || !rightCol || !buttonsDiv) return;
    
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';
    buttonsDiv.innerHTML = '';
    
    const yourShipsSection = ce({
        className: 'stats-group',
        style: { marginTop: '20px' },
        children: [
            ce({ tag: 'h4', style: { color: '#0bf', marginBottom: '10px' }, text: 'Your Ships' })
        ]
    });
    
    const yourShipsTable = createDataTable({
        id: 'your-ships',
        scrollable: true,
        headers: ['Name', 'Type', 'Hull', 'Shields', 'Speed', 'Status'],
        rows: window.gameState.ownedShips.map((ship, idx) => ({
            cells: [
                ship.name, 
                ship.type, 
                `${ship.hull}/${ship.maxHull}`,
                `${ship.shields}/${ship.maxShields}`,
                `${ship.speed.toFixed(1)}x`,
                ship === window.gameState.ship ? '<span style="color: #0bf;">ACTIVE</span>' : `${ship.value} cr`
            ],
            data: { ship, index: idx }
        })),
        onSelect: (rowData) => {
            window.selectedOwnedShip = rowData.data;
            window.selectedShipToBuy = null;
            renderShipyardButtons();
        }
    });
    
    yourShipsSection.appendChild(yourShipsTable);
    leftCol.appendChild(yourShipsSection);
    
    const shipsForSale = [
        generateShip(SCOUT, false),
        generateShip(FREIGHTER, false),
        generateShip(DESTROYER, false)
    ];
    
    const shipsSection = ce({
        className: 'stats-group',
        style: { marginTop: '20px' },
        children: [
            ce({ tag: 'h4', style: { color: '#0bf', marginBottom: '10px' }, text: 'Ships for Sale' })
        ]
    });
    
    const shipsTable = createDataTable({
        id: 'ships-for-sale',
        scrollable: true,
        headers: ['Name', 'Type', 'Hull', 'Shields', 'Speed', 'Price'],
        rows: shipsForSale.map((ship, idx) => ({
            cells: [ship.name, ship.type, ship.maxHull, ship.maxShields, `${ship.speed.toFixed(1)}x`, `${ship.value} cr`],
            data: { ship, index: idx }
        })),
        onSelect: (rowData) => {
            window.selectedShipToBuy = rowData.data;
            window.selectedOwnedShip = null;
            renderShipyardButtons();
        }
    });
    
    shipsSection.appendChild(shipsTable);
    rightCol.appendChild(shipsSection);
    
    renderShipyardButtons();
}

function renderShipyardButtons() {
    const buttonsDiv = document.getElementById('shipyard-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (window.selectedShipToBuy) {
        const { ship } = window.selectedShipToBuy;
        const canAfford = window.gameState.captain.credits >= ship.value;
        
        buttonsDiv.appendChild(createButton({
            text: `Purchase Ship (${ship.value} cr)`,
            action: () => buyShip(window.selectedShipToBuy.index),
            disabled: !canAfford,
            disabledReason: canAfford ? '' : `Need ${ship.value} credits (have ${window.gameState.captain.credits})`
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
            text: needsRepair ? `Repair Hull (${repairCost} cr)` : 'Hull at Full Integrity',
            action: () => repairShip(index),
            disabled: !needsRepair || !canAffordRepair,
            disabledReason: !needsRepair ? 'No repairs needed' : 
                          !canAffordRepair ? `Need ${repairCost} credits (have ${window.gameState.captain.credits})` : ''
        }));
        
        // Refuel button
        const fuelNeeded = ship.maxFuel - ship.fuel;
        const refuelCost = fuelNeeded * 3;
        const canAffordRefuel = window.gameState.captain.credits >= refuelCost;
        const needsFuel = fuelNeeded > 0;
        
        buttonsDiv.appendChild(createButton({
            text: needsFuel ? `Refuel (${refuelCost} cr)` : 'Fuel Tank Full',
            action: () => refuelShip(index),
            disabled: !needsFuel || !canAffordRefuel,
            disabledReason: !needsFuel ? 'Tank is full' :
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
    
    if (window.gameState.spendCredits(newShip.value)) {
        window.gameState.ownedShips.push(newShip);
        showMainMenu();
    }
}

function switchToShip(index) {
    window.gameState.ship = window.gameState.ownedShips[index];
    showMainMenu();
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
    showMainMenu();
}
