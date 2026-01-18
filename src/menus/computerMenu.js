import { Menu, ce } from '../ui.js';

export function showFleetMenu() {
    const menu = new Menu({
        tabs: [
            { 
                label: 'Ship Status', 
                content: getShipStatusContent() 
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getShipStatusContent() {
    const totalCargo = window.gameState.getTotalCargo();
    const cargoValue = Object.entries(window.gameState.ship.cargo).reduce((sum, [good, qty]) => {
        const system = window.gameState.starSystems[window.gameState.currentSystemIndex];
        return sum + (system.marketPrices[good] * qty);
    }, 0);
    
    return `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Ship Name:</span>
                <span class="stat-value">${window.gameState.ship.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Ship Type:</span>
                <span class="stat-value">${window.gameState.ship.type}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Hull Integrity:</span>
                <span class="stat-value">${window.gameState.ship.hull}/${window.gameState.ship.maxHull}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Fuel:</span>
                <span class="stat-value">${window.gameState.ship.fuel}/${window.gameState.ship.maxFuel}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Weapons:</span>
                <span class="stat-value">${window.gameState.ship.weapons}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Cargo Space:</span>
                <span class="stat-value">${totalCargo}/${window.gameState.ship.maxCargo}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Cargo Value:</span>
                <span class="stat-value">${cargoValue} cr</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Ship Value:</span>
                <span class="stat-value">${window.gameState.ship.value} cr</span>
            </div>
        </div>
    `;
}
