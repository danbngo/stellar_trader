import { Menu, createDataTable, createButton, ce } from '../ui.js';
import { SKILLS, SKILL_NAMES, MAX_SKILL_LEVEL } from '../defs/SKILLS.js';
import { ProgressBar } from '../classes/ProgressBar.js';

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
    const captain = window.gameState.captain;
    const expNeeded = captain.level * 100;
    const expProgress = captain.experience / expNeeded;
    const progressBar = new ProgressBar(30, expProgress);
    
    return `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Name:</span>
                <span class="stat-value">${captain.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Level:</span>
                <span class="stat-value">${captain.level}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Experience:</span>
                <span class="stat-value">${captain.experience} / ${expNeeded}</span>
            </div>
            <div style="margin: 0.625rem 0; text-align: center;">
                <div style="font-family: monospace; font-size: 12px; color: #09f; letter-spacing: 1px;">
                    ${progressBar.getText()}
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 0.313rem;">
                    ${Math.round(expProgress * 100)}% to Level ${captain.level + 1}
                </div>
            </div>
            <div class="stat-line">
                <span class="stat-label">Credits:</span>
                <span class="stat-value">${captain.credits}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Days Traveled:</span>
                <span class="stat-value">${captain.daysTraveled}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Systems Visited:</span>
                <span class="stat-value">${captain.systemsVisited}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Pirates Defeated:</span>
                <span class="stat-value">${captain.piratesDestroyed}</span>
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
