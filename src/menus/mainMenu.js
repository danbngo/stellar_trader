import { ce, Menu, createTwoColumnLayout, createTopButtons } from '../ui.js';
import { getTravelContent, renderTravelTab } from './travelMenu.js';
import { getShipyardContent, renderShipyardTable } from './shipyardMenu.js';
import { getMarketContent, renderMarketTable } from './marketMenu.js';
import { showComputerScreen } from './computerMenu.js';
import { showOptionsModal } from './optionsMenu.js';

export function getShipStatus(ship) {
    return `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Ship:</span>
                <span class="stat-value">${ship.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Hull:</span>
                <span class="stat-value">${ship.hull}/${ship.maxHull}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Shields:</span>
                <span class="stat-value">${ship.shields}/${ship.maxShields}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Fuel:</span>
                <span class="stat-value">${ship.fuel}/${ship.maxFuel}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Cargo:</span>
                <span class="stat-value">${ship.getTotalCargo()}/${ship.maxCargo}</span>
            </div>
        </div>
    `;
}

export function getCaptainStatus(captain) {
    return `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Captain:</span>
                <span class="stat-value">${captain.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Credits:</span>
                <span class="stat-value">${captain.credits}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Reputation:</span>
                <span class="stat-value">${captain.reputation}</span>
            </div>
        </div>
    `;
}

export function showMainMenu() {
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    
    const menu = new Menu({
        tabs: [
            {
                label: 'Travel',
                content: getTravelContent(),
                onActivate: () => renderTravelTab()
            },
            {
                label: 'Info',
                content: getSystemInfoContent(currentSystem)
            },
            {
                label: 'Shipyard',
                content: getShipyardContent(),
                onActivate: () => renderShipyardTable()
            },
            {
                label: 'Market',
                content: getMarketContent(currentSystem),
                onActivate: () => renderMarketTable(currentSystem)
            }
        ]
    });
    
    menu.render();
    
    // Store menu reference globally so tabs can access button container
    window.currentMenu = menu;
    
    createTopButtons(showComputerScreen, showOptionsModal);
}

function getSystemInfoContent(system) {
    const leftColumn = `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">System Name:</span>
                <span class="stat-value">${system.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Coordinates:</span>
                <span class="stat-value">${system.x.toFixed(1)}, ${system.y.toFixed(1)}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Piracy Level:</span>
                <span class="stat-value">${system.piracyLevel}/10</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Police Level:</span>
                <span class="stat-value">${system.policeLevel}/10</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Merchants Level:</span>
                <span class="stat-value">${system.merchantsLevel}/10</span>
            </div>
        </div>
    `;
    
    const rightColumn = `
        <div style="color: #888; text-align: center; padding: 40px 20px;">
            <p>Additional system details coming soon...</p>
        </div>
    `;
    
    const layout = createTwoColumnLayout({ leftColumn, rightColumn });
    return layout.outerHTML;
}
