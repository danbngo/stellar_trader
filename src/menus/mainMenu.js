import { ce, Menu, createTwoColumnLayout, createTopButtons, statColorSpan } from '../ui.js';
import { getTravelContent, renderTravelTab } from './travelMenu.js';
import { getShipyardContent, renderShipyardTable } from './shipyardMenu.js';
import { getMarketContent, renderMarketTable } from './marketMenu.js';

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
    window.currentViewMode = 'system';
    renderGameView();
    
    createTopButtons({
        showSystem: renderGameView,
        showFleet: () => import('./computerMenu.js').then(m => m.showFleetMenu()),
        showCaptain: () => import('./captainMenu.js').then(m => m.showCaptainMenu()),
        showJournal: () => import('./journalMenu.js').then(m => m.showJournalMenu()),
        showAssistant: () => import('./assistantMenu.js').then(m => m.showAssistantMenu()),
        showOptions: () => import('./optionsMenu.js').then(m => m.showOptionsMenu())
    });
}

function renderGameView() {
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    
    const menu = new Menu({
        tabs: [
            {
                label: 'Travel',
                content: getTravelContent(),
                onActivate: () => renderTravelTab()
            },
            {
                label: 'System Info',
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
}

function getSystemInfoContent(system) {
    // Convert ratings to multiplier format (value / 5 = multiplier, where 5 = 1x, 20 = 4x)
    const toMultiplier = (value) => (value / 5).toFixed(1);
    
    const piracyMultiplier = parseFloat(toMultiplier(system.piracyLevel));
    const policeMultiplier = parseFloat(toMultiplier(system.policeLevel));
    const merchantsMultiplier = parseFloat(toMultiplier(system.merchantsLevel));
    
    // For piracy: higher is worse, so invert the ratio (4x piracy = 0.25 ratio = bad/red)
    // For police/merchants: higher is better (4x = 4.0 ratio = good/green)
    const piracyRatio = 1 / piracyMultiplier; // Inverted: 4x piracy becomes 0.25 ratio
    const policeRatio = policeMultiplier; // Direct: 4x police becomes 4.0 ratio
    const merchantsRatio = merchantsMultiplier; // Direct: 4x merchants becomes 4.0 ratio
    
    const leftColumn = `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">System Name:</span>
                <span class="stat-value">${system.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Piracy Level:</span>
                <span class="stat-value">${statColorSpan(piracyMultiplier.toFixed(1) + 'x', piracyRatio)}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Police Level:</span>
                <span class="stat-value">${statColorSpan(policeMultiplier.toFixed(1) + 'x', policeRatio)}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Merchants Level:</span>
                <span class="stat-value">${statColorSpan(merchantsMultiplier.toFixed(1) + 'x', merchantsRatio)}</span>
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
