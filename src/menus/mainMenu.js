import { ce, createTabs, createTwoColumnLayout, createTopButtons } from '../ui.js';
import { getTravelContent, renderTravelTab } from './travelMenu.js';
import { getShipyardContent, renderShipyardTable } from './shipyardMenu.js';
import { getMarketContent, renderMarketTable } from './marketMenu.js';
import { showComputerScreen } from './computerMenu.js';
import { showOptionsModal } from './optionsMenu.js';

export function showMainMenu() {
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    
    const tabs = [
        {
            label: 'Travel',
            content: getTravelContent(),
            onActivate: renderTravelTab
        },
        {
            label: 'Info',
            content: getSystemInfoContent(currentSystem)
        },
        {
            label: 'Shipyard',
            content: getShipyardContent(),
            onActivate: renderShipyardTable
        },
        {
            label: 'Market',
            content: getMarketContent(currentSystem),
            onActivate: () => renderMarketTable(currentSystem)
        }
    ];
    
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    const menu = ce({
        className: 'menu',
        children: [
            createTabs(tabs)
        ]
    });
    
    container.appendChild(menu);
    createTopButtons(showComputerScreen, showOptionsModal);
}

function getSystemInfoContent(system) {
    const leftColumn = `
        <h3 style="color: #0bf; margin-bottom: 15px;">SYSTEM INFORMATION</h3>
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
        <h3 style="color: #0bf; margin: 20px 0 15px;">YOUR SHIP</h3>
        ${window.gameState.getShipStatus()}
    `;
    
    const rightColumn = `
        <h3 style="color: #0bf; margin-bottom: 15px;">CARGO HOLD</h3>
        <div class="stats-group">
            ${Object.keys(window.gameState.ship.cargo).length > 0 ? 
                Object.entries(window.gameState.ship.cargo).map(([item, qty]) => `
                    <div class="stat-line">
                        <span class="stat-label">${item.charAt(0).toUpperCase() + item.slice(1)}:</span>
                        <span class="stat-value">${qty} units</span>
                    </div>
                `).join('') : 
                '<p style="text-align: center; color: #888;">Cargo hold is empty</p>'
            }
        </div>
        <h3 style="color: #0bf; margin: 20px 0 15px;">CAPTAIN INFO</h3>
        ${window.gameState.getCaptainStatus()}
    `;
    
    const layout = createTwoColumnLayout({ leftColumn, rightColumn });
    return layout.outerHTML;
}
