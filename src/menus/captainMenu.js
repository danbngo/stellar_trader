import { Menu, createDataTable, createButton, ce } from '../ui.js';
import { SKILLS, SKILL_NAMES, MAX_SKILL_LEVEL } from '../defs/SKILLS.js';

export function showCaptainMenu() {
    const menu = new Menu({
        tabs: [
            { 
                label: 'Captain Info', 
                content: getCaptainInfoContent() 
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
        autoSelectFirst: true,
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
            window.selectedCaptainSkill = rowData.data.skillName;
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
    
    if (window.selectedCaptainSkill) {
        const currentLevel = window.gameState.captain.skills[window.selectedCaptainSkill];
        const canIncrease = window.gameState.captain.skillPoints > 0 && currentLevel < MAX_SKILL_LEVEL;
        
        buttonContainer.appendChild(createButton({
            text: `Increase ${SKILLS[window.selectedCaptainSkill].name}`,
            action: () => {
                if (window.gameState.captain.increaseSkill(window.selectedCaptainSkill)) {
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
