import { Menu, createDataTable, ce, createButton, showModal } from '../ui.js';

export function showJournalMenu() {
    const menu = new Menu({
        tabs: [
            { 
                label: 'Quests', 
                content: getQuestsContent(),
                onActivate: renderQuests
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getQuestsContent() {
    return `
        <div id="quests-container"></div>
    `;
}

function renderQuests() {
    const container = document.getElementById('quests-container');
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!container || !buttonsDiv) return;
    
    container.innerHTML = '';
    buttonsDiv.innerHTML = '';
    
    const activeQuests = window.gameState.quests.filter(q => !q.isFulfilled);
    const completedQuests = window.gameState.quests.filter(q => q.isFulfilled);
    
    if (activeQuests.length === 0 && completedQuests.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No quests available.</p>';
        return;
    }
    
    // Show active quests
    if (activeQuests.length > 0) {
        container.appendChild(ce({
            tag: 'h3',
            style: { marginBottom: '1rem' },
            text: 'Active Quests'
        }));
        
        activeQuests.forEach(quest => {
            const questCard = createQuestCard(quest);
            container.appendChild(questCard);
        });
    }
    
    // Show completed quests
    if (completedQuests.length > 0) {
        const completedHeader = ce({
            tag: 'h3',
            style: { marginTop: '2rem', marginBottom: '1rem', color: '#0f0' },
            text: 'Completed Quests'
        });
        container.appendChild(completedHeader);
        
        completedQuests.forEach(quest => {
            const questCard = createQuestCard(quest);
            container.appendChild(questCard);
        });
    }
    
    // Render donation buttons for selected quest
    renderQuestButtons();
}

function renderQuestButtons() {
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (window.selectedQuest && !window.selectedQuest.isFulfilled) {
        const quest = window.selectedQuest;
        
        // Add donation button for each cargo type
        for (const [cargoType, requiredAmount] of Object.entries(quest.cargoAmounts)) {
            const donated = quest.cargoDonated[cargoType] || 0;
            const remaining = requiredAmount - donated;
            const playerHas = window.gameState.ship.cargo[cargoType] || 0;
            
            if (remaining > 0 && playerHas > 0) {
                const canDonate = Math.min(remaining, playerHas);
                
                buttonsDiv.appendChild(createButton({
                    text: `Donate ${canDonate} ${cargoType} (have ${playerHas})`,
                    action: () => donateCargoToQuest(quest, cargoType, canDonate)
                }));
            }
        }
    }
}

function donateCargoToQuest(quest, cargoType, amount) {
    // Remove cargo from ship
    if (window.gameState.removeCargo(cargoType, amount)) {
        // Donate to quest
        quest.donateCargo(cargoType, amount);
        
        // Refresh display
        renderQuests();
        
        // Check if quest is now complete
        const completedQuests = window.gameState.checkQuests();
        
        if (completedQuests.length > 0) {
            const questList = completedQuests.map(q => 
                `<div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid #0f0; border-radius: 0.25rem;">
                    <strong style="color: #0f0;">${q.title}</strong>
                    <div style="color: #888; font-size: 0.9em;">${q.description}</div>
                    <div style="color: #09f; margin-top: 0.25rem;">Reward: ${q.expReward} EXP${q.creditsReward > 0 ? `, ${q.creditsReward} Credits` : ''}</div>
                </div>`
            ).join('');
            
            showModal({
                title: 'Quest Completed!',
                content: `
                    <div style="color: #0f0; margin-bottom: 1rem;">
                        <strong>Congratulations! You completed ${completedQuests.length} quest${completedQuests.length > 1 ? 's' : ''}!</strong>
                    </div>
                    ${questList}
                `,
                buttons: [{ text: 'Continue', action: 'close' }]
            });
        }
    }
}

function createQuestCard(quest) {
    const isFailed = quest.checkFailed(window.gameState.currentDate);
    const statusColor = quest.isFulfilled ? '#0f0' : isFailed ? '#f00' : '#09f';
    const statusText = quest.isFulfilled ? 'COMPLETED' : isFailed ? 'FAILED' : 'ACTIVE';
    
    // Build cargo requirements as table rows
    const cargoRows = Object.entries(quest.cargoAmounts).map(([type, required]) => {
        const donated = quest.cargoDonated[type] || 0;
        const remaining = required - donated;
        const playerHas = window.gameState.ship.cargo[type] || 0;
        const percentComplete = (donated / required) * 100;
        const color = donated >= required ? '#0f0' : '#f00';
        
        return [
            type.charAt(0).toUpperCase() + type.slice(1),
            `${donated}`,
            `${remaining}`,
            `${playerHas}`,
            `<span style="color: ${color};">${percentComplete.toFixed(0)}%</span>`
        ];
    });
    
    const requirementsTable = createDataTable({
        headers: ['Type', 'Donated', 'Remaining', 'You Have', 'Progress'],
        rows: cargoRows.map(cells => ({ cells })),
        scrollable: false
    });
    
    // Format expiration date
    const expirationStr = quest.expirationDate 
        ? quest.expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'No time limit';
    
    const card = ce({
        className: 'stats-group',
        style: { 
            marginBottom: '1.5rem', 
            padding: '1rem',
            border: `2px solid ${statusColor}`,
            borderRadius: '0.25rem',
            cursor: quest.isFulfilled ? 'default' : 'pointer'
        }
    });
    
    // Header
    const header = ce({
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
        children: [
            ce({ tag: 'h4', style: { color: statusColor, margin: 0 }, text: quest.title }),
            ce({ tag: 'span', style: { color: statusColor, fontWeight: 'bold' }, text: statusText })
        ]
    });
    card.appendChild(header);
    
    // Description
    card.appendChild(ce({ 
        tag: 'p', 
        style: { color: '#888', marginBottom: '1rem' }, 
        text: quest.description 
    }));
    
    // Requirements label
    card.appendChild(ce({
        tag: 'strong',
        style: { color: '#09f', display: 'block', marginBottom: '0.5rem' },
        text: 'Requirements:'
    }));
    
    // Requirements table
    card.appendChild(requirementsTable);
    
    // Expiration and reward info
    const infoDiv = ce({
        style: { marginTop: '1rem' },
        children: [
            ce({
                className: 'stat-line',
                children: [
                    ce({ tag: 'span', className: 'stat-label', text: 'Expires:' }),
                    ce({ tag: 'span', className: 'stat-value', text: expirationStr })
                ]
            }),
            ce({
                className: 'stat-line',
                children: [
                    ce({ tag: 'span', className: 'stat-label', text: 'Reward:' }),
                    ce({ tag: 'span', className: 'stat-value', text: `${quest.expReward} EXP${quest.creditsReward > 0 ? `, ${quest.creditsReward} Credits` : ''}` })
                ]
            })
        ]
    });
    card.appendChild(infoDiv);
    
    // Make card clickable if active
    if (!quest.isFulfilled && !isFailed) {
        card.addEventListener('click', () => {
            window.selectedQuest = quest;
            renderQuestButtons();
        });
    }
    
    return card;
}
