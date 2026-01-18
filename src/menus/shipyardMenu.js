import { ce, createDataTable, createButton } from '../ui.js';
import { showMainMenu } from './mainMenu.js';

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
        headers: ['Name', 'Type', 'Hull', 'Fuel', 'Cargo', 'Status'],
        rows: window.gameState.ownedShips.map((ship, idx) => ({
            cells: [
                ship.name, 
                ship.type, 
                `${ship.hull}/${ship.maxHull}`, 
                `${ship.fuel}/${ship.maxFuel}`, 
                ship.maxCargo,
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
        { name: 'Scout Ship', type: 'Scout', hull: 80, fuel: 150, cargo: 30, value: 8000, weapons: 3 },
        { name: 'Cargo Hauler', type: 'Freighter', hull: 120, fuel: 100, cargo: 100, value: 15000, weapons: 1 },
        { name: 'Battle Cruiser', type: 'Combat', hull: 200, fuel: 120, cargo: 40, value: 25000, weapons: 8 }
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
        headers: ['Name', 'Type', 'Hull', 'Fuel', 'Cargo', 'Price'],
        rows: shipsForSale.map((ship, idx) => ({
            cells: [ship.name, ship.type, ship.hull, ship.fuel, ship.cargo, `${ship.value} cr`],
            data: { ...ship, index: idx }
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
        const ship = window.selectedShipToBuy;
        const canAfford = window.gameState.captain.credits >= ship.value;
        
        buttonsDiv.appendChild(createButton({
            text: `Purchase Ship (${ship.value} cr)`,
            action: () => buyShip(ship.index),
            disabled: !canAfford,
            disabledReason: canAfford ? '' : `Need ${ship.value} credits (have ${window.gameState.captain.credits})`
        }));
    }
    
    if (window.selectedOwnedShip) {
        const { ship, index } = window.selectedOwnedShip;
        const isActive = ship === window.gameState.ship;
        
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
    const ships = [
        { name: 'Scout Ship', type: 'Scout', hull: 80, fuel: 150, cargo: 30, value: 8000, weapons: 3 },
        { name: 'Cargo Hauler', type: 'Freighter', hull: 120, fuel: 100, cargo: 100, value: 15000, weapons: 1 },
        { name: 'Battle Cruiser', type: 'Combat', hull: 200, fuel: 120, cargo: 40, value: 25000, weapons: 8 }
    ];
    
    const shipTemplate = ships[index];
    if (window.gameState.spendCredits(shipTemplate.value)) {
        const newShip = {
            name: shipTemplate.name,
            type: shipTemplate.type,
            hull: shipTemplate.hull,
            maxHull: shipTemplate.hull,
            fuel: shipTemplate.fuel,
            maxFuel: shipTemplate.fuel,
            cargo: {},
            maxCargo: shipTemplate.cargo,
            value: shipTemplate.value,
            weapons: shipTemplate.weapons
        };
        window.gameState.ownedShips.push(newShip);
        showMainMenu();
    }
}

function switchToShip(index) {
    window.gameState.ship = window.gameState.ownedShips[index];
    showMainMenu();
}

function sellShip(index) {
    if (window.gameState.ownedShips.length <= 1) return;
    
    const ship = window.gameState.ownedShips[index];
    window.gameState.addCredits(ship.value);
    window.gameState.ownedShips.splice(index, 1);
    showMainMenu();
}
