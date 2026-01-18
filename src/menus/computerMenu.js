import { Menu, createDataTable, createButton, ce } from '../ui.js';
import { SKILLS, SKILL_NAMES, MAX_SKILL_LEVEL } from '../defs/SKILLS.js';

export function showComputerMenu() {
    const menu = new Menu({
        tabs: [
            { 
                label: 'Captain Info', 
                content: getCaptainInfoContent() 
            },
            { 
                label: 'Ship Status', 
                content: getShipStatusContent() 
            },
            { 
                label: 'Skills', 
                content: getSkillsContent(), 
                onActivate: renderSkillsTab 
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getCaptainInfoContent() {
    return `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Name:</span>
                <span class="stat-value">${window.gameState.captain.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Credits:</span>
                <span class="stat-value">${window.gameState.captain.credits}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Days Traveled:</span>
                <span class="stat-value">${window.gameState.captain.daysTraveled}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Systems Visited:</span>
                <span class="stat-value">${window.gameState.captain.systemsVisited}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Pirates Defeated:</span>
                <span class="stat-value">${window.gameState.captain.piratesDestroyed}</span>
            </div>
        </div>
    `;
}

function getSkillsContent() {
    return ce({
        children: [
            ce({ 
                tag: 'p', 
                style: { marginBottom: '0.938rem' },
                text: 'Skill Points Available: '
            }),
            ce({
                tag: 'span',
                id: 'skill-points-display',
                text: window.gameState.captain.skillPoints.toString()
            }),
            ce({ tag: 'div', id: 'skills-table-container', style: { marginTop: '0.938rem' } })
        ]
    }).outerHTML;
}

function renderSkillsTab() {
    const container = document.getElementById('skills-table-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const skillTable = createDataTable({
        id: 'skills-table',
        scrollable: true,
        headers: ['Skill', 'Level', 'Description'],
        rows: SKILL_NAMES.map(skillName => {
            const skill = SKILLS[skillName];
            const level = window.gameState.captain.skills[skillName];
            return {
                cells: [
                    skill.name,
                    `${level}/${MAX_SKILL_LEVEL}`,
                    skill.description
                ],
                data: { skillName }
            };
        }),
        onSelect: (rowData) => {
            window.selectedComputerSkill = rowData.data.skillName;
            renderSkillsButtons();
        }
    });
    
    container.appendChild(skillTable);
    renderSkillsButtons();
}

function renderSkillsButtons() {
    const buttonContainer = window.currentMenu?.getButtonContainer();
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = '';
    
    if (window.selectedComputerSkill) {
        const currentLevel = window.gameState.captain.skills[window.selectedComputerSkill];
        const canIncrease = window.gameState.captain.skillPoints > 0 && currentLevel < MAX_SKILL_LEVEL;
        
        buttonContainer.appendChild(createButton({
            text: `Increase ${SKILLS[window.selectedComputerSkill].name}`,
            action: () => {
                if (window.gameState.captain.increaseSkill(window.selectedComputerSkill)) {
                    renderSkillsTab();
                    
                    // Update skill points display
                    const display = document.getElementById('skill-points-display');
                    if (display) {
                        display.textContent = window.gameState.captain.skillPoints;
                    }
                }
            },
            disabled: !canIncrease,
            disabledReason: !canIncrease ? 
                (window.gameState.captain.skillPoints === 0 ? 'No skill points available' : 'Max skill level reached') : ''
        }));
    }
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
