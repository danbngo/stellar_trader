import { showMenu, Menu, createButton, createDataTable, ce, createTwoColumnLayout } from '../ui.js';
import { GameState } from '../classes/GameState.js';
import { showMainMenu } from './mainMenu.js';
import { SKILLS, SKILL_NAMES, MAX_SKILL_LEVEL } from '../defs/SKILLS.js';

export function showTitleScreen() {
    showMenu({
        title: 'Void Merchant',
        content: `
            <p>Welcome to the vast expanse of space.</p>
            <p>Trade goods, explore systems, and build your fortune among the stars.</p>
        `,
        buttons: [
            {
                text: 'New Game',
                action: () => startNewGame()
            },
            {
                text: 'Load Game',
                action: () => {
                    showMenu({
                        title: 'LOAD GAME',
                        content: '<p>Save system not yet implemented.</p>',
                        buttons: [
                            { text: 'Back', action: () => showTitleScreen() }
                        ]
                    });
                }
            },
            {
                text: 'Credits',
                action: () => showCredits()
            }
        ]
    });
}

function showCredits() {
    showMenu({
        title: 'CREDITS',
        content: `
            <p>Void Merchant</p>
            <p>A space trading adventure</p>
            <br>
            <p>Version 1.0</p>
        `,
        buttons: [
            { text: 'Back', action: () => showTitleScreen() }
        ]
    });
}

function startNewGame() {
    window.gameState = new GameState();
    window.gameState.captain.skillPoints = 5; // Start with 5 skill points
    
    showCharacterCreation();
}

function showCharacterCreation() {
    // Left column: Name entry
    const leftColumn = ce({
        children: [
            ce({ 
                tag: 'h3', 
                text: 'Captain Information',
                style: { marginBottom: '1rem' }
            }),
            ce({ 
                tag: 'p', 
                text: 'Enter your name, Captain:'
            }),
            ce({
                tag: 'input',
                type: 'text',
                id: 'captain-name-input',
                className: 'input-text',
                value: 'Captain Nova'
            })
        ]
    });
    
    // Right column: Skill distribution
    const rightColumn = ce({
        children: [
            ce({ 
                tag: 'h3', 
                text: 'Skill Distribution',
                style: { marginBottom: '1rem' }
            }),
            ce({ 
                tag: 'p', 
                id: 'skill-points-display',
                style: { marginBottom: '0.938rem' },
                text: `You have ${window.gameState.captain.skillPoints} skill points to distribute.`
            }),
            ce({ tag: 'div', id: 'skill-selection-container' })
        ]
    });
    
    const layout = createTwoColumnLayout({ leftColumn, rightColumn });
    
    const menu = new Menu({
        tabs: [
            {
                label: 'Character Creation',
                content: layout.outerHTML,
                onActivate: () => renderSkillSelectionTable()
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function renderSkillSelectionTable() {
    const container = document.getElementById('skill-selection-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const skillTable = createDataTable({
        id: 'skill-selection-table',
        scrollable: true,
        autoSelectFirst: true,
        headers: ['Skill', 'Level', 'Description'],
        rows: SKILL_NAMES.map(skillName => {
            const skill = SKILLS[skillName];
            const level = window.gameState.captain.skills[skillName] || 0;
            return {
                cells: [
                    skill.name,
                    level.toString(),
                    skill.description
                ],
                data: { skillName }
            };
        }),
        onSelect: (rowData) => {
            window.selectedSkill = rowData.data.skillName;
            renderSkillButtons();
        }
    });
    
    container.appendChild(skillTable);
    renderSkillButtons();
}

function renderSkillButtons() {
    const buttonContainer = window.currentMenu?.getButtonContainer();
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = '';
    
    if (window.selectedSkill) {
        const currentLevel = window.gameState.captain.skills[window.selectedSkill];
        const canIncrease = window.gameState.captain.skillPoints > 0 && currentLevel < MAX_SKILL_LEVEL;
        
        buttonContainer.appendChild(createButton({
            text: 'Increase',
            action: () => {
                if (window.gameState.captain.increaseSkill(window.selectedSkill)) {
                    renderSkillSelectionTable();
                    
                    // Update skill points display
                    const pointsDisplay = document.getElementById('skill-points-display');
                    if (pointsDisplay) {
                        pointsDisplay.textContent = `You have ${window.gameState.captain.skillPoints} skill points to distribute.`;
                    }
                }
            },
            disabled: !canIncrease,
            disabledReason: !canIncrease ? 
                (window.gameState.captain.skillPoints === 0 ? 'No skill points remaining' : 'Max skill level reached') : ''
        }));
    }
    
    // Add Begin Journey and Back buttons
    buttonContainer.appendChild(createButton({
        text: 'Begin Journey',
        action: () => {
            // Save the captain name before starting
            const nameInput = document.getElementById('captain-name-input');
            if (nameInput && nameInput.value.trim()) {
                window.gameState.captain.name = nameInput.value.trim();
            }
            
            // Check if there's an active journey
            if (window.gameState.activeJourney) {
                // Resume the active journey
                const { destIndex, toSystem, tripDuration, avgPiracy, avgPolice, avgMerchants, encounters } = window.gameState.activeJourney;
                import('./travelEncounterMenu.js').then(m => {
                    m.showTravelEncounterMenu(destIndex, toSystem, tripDuration, avgPiracy, avgPolice, avgMerchants, encounters);
                });
            } else {
                showMainMenu();
            }
        }
    }));
    
    buttonContainer.appendChild(createButton({
        text: 'Back',
        action: () => showTitleScreen()
    }));
}
