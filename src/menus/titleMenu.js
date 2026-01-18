import { showMenu, createButton, createDataTable, ce } from '../ui.js';
import { GameState } from '../classes/GameState.js';
import { showMainMenu } from './mainMenu.js';
import { SKILLS, SKILL_NAMES, MAX_SKILL_LEVEL } from '../defs/SKILLS.js';

export function showTitleScreen() {
    showMenu({
        title: 'STELLAR TRADER',
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
            <p>STELLAR TRADER</p>
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
    
    showMenu({
        title: 'NEW GAME',
        content: `
            <p>Enter your name, Captain:</p>
            <input type="text" id="captain-name-input" value="Captain Nova" 
                   style="width: 100%; padding: 8px; margin: 10px 0; background: #001; 
                   border: 1px solid #09f; color: #09f; font-family: 'Courier New', monospace;">
        `,
        buttons: [
            {
                text: 'Continue',
                action: () => {
                    const nameInput = document.getElementById('captain-name-input');
                    if (nameInput && nameInput.value.trim()) {
                        window.gameState.captain.name = nameInput.value.trim();
                    }
                    showSkillSelection();
                }
            },
            {
                text: 'Back',
                action: () => showTitleScreen()
            }
        ]
    });
}

function showSkillSelection() {
    const content = ce({
        children: [
            ce({ 
                tag: 'p', 
                style: { marginBottom: '15px' },
                text: `You have ${window.gameState.captain.skillPoints} skill points to distribute.`
            }),
            ce({ tag: 'div', id: 'skill-selection-container' })
        ]
    });
    
    showMenu({
        title: 'SKILL SELECTION',
        content: content.outerHTML,
        buttons: [
            {
                text: 'Begin Journey',
                action: () => showMainMenu()
            },
            {
                text: 'Back',
                action: () => startNewGame()
            }
        ]
    });
    
    renderSkillSelectionTable();
}

function renderSkillSelectionTable() {
    const container = document.getElementById('skill-selection-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const skillTable = createDataTable({
        id: 'skill-selection-table',
        scrollable: true,
        headers: ['Skill', 'Level', 'Description'],
        rows: SKILL_NAMES.map(skillName => {
            const skill = SKILLS[skillName];
            const level = window.gameState.captain.skills[skillName];
            return {
                cells: [
                    skill.name,
                    level,
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
    
    const buttonsDiv = ce({ 
        id: 'skill-selection-buttons',
        className: 'button-container',
        style: { marginTop: '15px' }
    });
    container.appendChild(buttonsDiv);
    
    renderSkillButtons();
}

function renderSkillButtons() {
    const buttonsDiv = document.getElementById('skill-selection-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (window.selectedSkill) {
        const currentLevel = window.gameState.captain.skills[window.selectedSkill];
        const canIncrease = window.gameState.captain.skillPoints > 0 && currentLevel < MAX_SKILL_LEVEL;
        
        buttonsDiv.appendChild(createButton({
            text: `Increase ${SKILLS[window.selectedSkill].name}`,
            action: () => {
                if (window.gameState.captain.increaseSkill(window.selectedSkill)) {
                    renderSkillSelectionTable();
                    
                    // Update skill points display
                    const menu = document.querySelector('.menu-content p');
                    if (menu) {
                        menu.textContent = `You have ${window.gameState.captain.skillPoints} skill points to distribute.`;
                    }
                }
            },
            disabled: !canIncrease,
            disabledReason: !canIncrease ? 
                (window.gameState.captain.skillPoints === 0 ? 'No skill points remaining' : 'Max skill level reached') : ''
        }));
    }
}
