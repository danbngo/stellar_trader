import { Menu, createDataTable, ce } from '../ui.js';

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
    return ce({
        children: [
            ce({ 
                tag: 'h3', 
                style: { marginBottom: '1rem' },
                text: 'Active Quests'
            }),
            ce({ tag: 'div', id: 'quests-container' })
        ]
    }).outerHTML;
}

function renderQuests() {
    const container = document.getElementById('quests-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const activeQuests = window.gameState.quests.filter(q => !q.isFulfilled);
    const completedQuests = window.gameState.quests.filter(q => q.isFulfilled);
    
    if (activeQuests.length === 0 && completedQuests.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;">No quests available.</p>';
        return;
    }
    
    // Show active quests
    if (activeQuests.length > 0) {
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
}

function createQuestCard(quest) {
    const isFailed = quest.checkFailed(window.gameState.currentDate);
    const statusColor = quest.isFulfilled ? '#0f0' : isFailed ? '#f00' : '#09f';
    const statusText = quest.isFulfilled ? 'COMPLETED' : isFailed ? 'FAILED' : 'ACTIVE';
    
    // Build cargo requirements display
    const cargoRequirements = Object.entries(quest.cargoAmounts).map(([type, amount]) => {
        const currentAmount = window.gameState.ship.cargo[type] || 0;
        const hasEnough = currentAmount >= amount;
        const color = hasEnough ? '#0f0' : '#f00';
        return `<div class="stat-line">
            <span class="stat-label">${type}:</span>
            <span class="stat-value" style="color: ${color};">${currentAmount}/${amount}</span>
        </div>`;
    }).join('');
    
    // Format expiration date
    const expirationStr = quest.expirationDate 
        ? quest.expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'No time limit';
    
    return ce({
        className: 'stats-group',
        style: { 
            marginBottom: '1.5rem', 
            padding: '1rem',
            border: `2px solid ${statusColor}`,
            borderRadius: '0.25rem'
        },
        html: `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="color: ${statusColor}; margin: 0;">${quest.title}</h4>
                <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
            </div>
            <p style="color: #888; margin-bottom: 1rem;">${quest.description}</p>
            <div style="margin-bottom: 0.5rem;">
                <strong style="color: #09f;">Requirements:</strong>
            </div>
            ${cargoRequirements}
            <div class="stat-line" style="margin-top: 1rem;">
                <span class="stat-label">Expires:</span>
                <span class="stat-value">${expirationStr}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Reward:</span>
                <span class="stat-value">${quest.expReward} EXP</span>
            </div>
        `
    });
}
