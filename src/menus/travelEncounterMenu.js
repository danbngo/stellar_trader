import { ce, createButton, createTwoColumnLayout, createDataTable, showMenu, showModal, createTabs } from '../ui.js';
import { showMainMenu } from './mainMenu.js';

// Travel state variables (module-level to share across functions)
let currentDay = 0;
let isPaused = true;
let travelInterval = null;
let activeEncounter = null;
let remainingEncounters = [];
let destinationIndex = null;
let toSystem = null;
let tripDuration = 0;
let avgPiracy = 0;
let avgPolice = 0;
let avgMerchants = 0;

export function showTravelEncounterMenu(destIndex, destination, duration, piracy, police, merchants, allEncounters) {
    // Reset state
    currentDay = 0;
    isPaused = true;
    travelInterval = null;
    activeEncounter = null;
    remainingEncounters = [...allEncounters];
    destinationIndex = destIndex;
    toSystem = destination;
    tripDuration = duration;
    avgPiracy = piracy;
    avgPolice = police;
    avgMerchants = merchants;
    
    renderTravelScreen();
}

function renderTravelScreen() {
    showMenu({
        title: 'TRAVELING TO ' + toSystem.name.toUpperCase(),
        content: '<div id="travel-encounter-content"></div>',
        buttons: []
    });
    
    const contentContainer = document.getElementById('travel-encounter-content');
    if (!contentContainer) return;
    
    // Create tabs
    const tabs = createTabs([
        {
            label: 'Journey',
            id: 'journey',
            content: getJourneyContent(),
            onActivate: renderJourneyContent
        },
        {
            label: 'Encounter',
            id: 'encounter',
            content: getEncounterContent(),
            onActivate: renderEncounterContent
        }
    ]);
    
    contentContainer.appendChild(tabs);
}

function getJourneyContent() {
    const progressBar = createProgressBar();
    
    return `
        <div id="journey-progress-bar" style="font-family: monospace; font-size: 14px; color: #09f; text-align: center; margin-bottom: 20px; letter-spacing: 1px;">
            ${progressBar} Day ${currentDay.toFixed(1)} / ${tripDuration}
        </div>
        <div id="journey-content-columns"></div>
        <div id="journey-buttons" class="button-container"></div>
    `;
}

function getEncounterContent() {
    return `
        <div id="encounter-content-columns"></div>
        <div id="encounter-buttons" class="button-container"></div>
    `;
}

function createProgressBar() {
    const progressPercent = Math.max(0, currentDay / tripDuration);
    const barWidth = 40;
    const filledWidth = Math.floor(progressPercent * barWidth);
    const emptyWidth = barWidth - filledWidth;
    return '[' + '='.repeat(filledWidth) + '>'.repeat(Math.min(1, emptyWidth)) + '.'.repeat(Math.max(0, emptyWidth - 1)) + ']';
}

function updateProgressBar() {
    const progressBarElement = document.getElementById('journey-progress-bar');
    if (progressBarElement) {
        const progressBar = createProgressBar();
        progressBarElement.textContent = progressBar + ` Day ${currentDay.toFixed(1)} / ${tripDuration}`;
    }
}

function renderJourneyContent() {
    const container = document.getElementById('journey-content-columns');
    if (!container) return;
    
    container.innerHTML = '';
    
    const layout = createTwoColumnLayout({
        leftColumn: ce({
            className: 'stats-group',
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Travel Progress' }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Destination:' }),
                        ce({ className: 'stat-value', text: toSystem.name })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Current Day:' }),
                        ce({ className: 'stat-value', text: `${currentDay.toFixed(1)} of ${tripDuration}` })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Days Remaining:' }),
                        ce({ className: 'stat-value', text: `${Math.max(0, tripDuration - currentDay).toFixed(1)}` })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Status:' }),
                        ce({ 
                            className: 'stat-value', 
                            text: activeEncounter ? 'ENCOUNTER!' : (isPaused ? 'Paused' : 'Traveling...'), 
                            style: { color: activeEncounter ? '#f00' : (isPaused ? '#ff0' : '#09f') } 
                        })
                    ]
                })
            ]
        }),
        rightColumn: ce({
            className: 'stats-group',
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Region Statistics' }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Piracy Level:' }),
                        ce({ className: 'stat-value', text: avgPiracy.toFixed(1) + '/10' })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Police Level:' }),
                        ce({ className: 'stat-value', text: avgPolice.toFixed(1) + '/10' })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Merchants Level:' }),
                        ce({ className: 'stat-value', text: avgMerchants.toFixed(1) + '/10' })
                    ]
                })
            ]
        })
    });
    
    container.appendChild(layout);
    renderJourneyButtons();
}

function renderEncounterContent() {
    const container = document.getElementById('encounter-content-columns');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!activeEncounter) {
        container.appendChild(ce({
            tag: 'p',
            style: { textAlign: 'center', color: '#888', padding: '40px' },
            text: 'No active encounters'
        }));
        return;
    }
    
    // Player ship rows
    const playerShipRows = [window.gameState.ship].map(ship => {
        const weapons = ship.weapons || 0;
        return {
            cells: [
                ship.name,
                ship.type,
                `Hull: ${ship.hull}/${ship.maxHull} | Shields: ${ship.shields}/${ship.maxShields} | Weapons: ${weapons}`
            ],
            data: ship
        };
    });
    
    // Encounter ship rows
    const encounterRows = [activeEncounter].map(ship => {
        let detailsDisplay = '';
        
        if (ship.type === 'Pirate' || ship.type === 'Police') {
            detailsDisplay = `Hull: ${ship.hull}/${ship.maxHull} | Shields: ${ship.shields}/${ship.maxShields} | Weapons: ${ship.weapons} | Threat: ${ship.threat}`;
        } else if (ship.type === 'Merchant') {
            detailsDisplay = `Hull: ${ship.hull}/${ship.maxHull} | Shields: ${ship.shields}/${ship.maxShields}`;
        }
        
        return {
            cells: [ship.name, ship.type, detailsDisplay],
            data: ship
        };
    });
    
    const layout = createTwoColumnLayout({
        leftColumn: ce({
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Your Ships' }),
                createDataTable({
                    id: 'player-ships-encounter',
                    scrollable: true,
                    headers: ['Ship Name', 'Type', 'Status'],
                    rows: playerShipRows,
                    onSelect: () => {}
                })
            ]
        }),
        rightColumn: ce({
            children: [
                ce({ tag: 'h4', style: { marginBottom: '10px' }, text: 'Encountered Ship' }),
                createDataTable({
                    id: 'encountered-ships-active',
                    scrollable: true,
                    headers: ['Ship Name', 'Type', 'Status'],
                    rows: encounterRows,
                    onSelect: () => {}
                })
            ]
        })
    });
    
    container.appendChild(layout);
    renderEncounterButtons();
}

function renderJourneyButtons() {
    const buttonsDiv = document.getElementById('journey-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (isPaused) {
        buttonsDiv.appendChild(createButton({
            text: 'Resume Journey',
            action: resumeJourney,
            disabled: activeEncounter !== null,
            disabledReason: activeEncounter ? 'Resolve encounter first' : ''
        }));
    } else {
        buttonsDiv.appendChild(createButton({
            text: 'Pause Journey',
            action: pauseJourney,
            disabled: activeEncounter !== null
        }));
    }
}

function renderEncounterButtons() {
    const buttonsDiv = document.getElementById('encounter-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (activeEncounter) {
        buttonsDiv.appendChild(createButton({
            text: 'Ignore and Continue',
            action: resolveEncounter
        }));
    }
}

function pauseJourney() {
    isPaused = true;
    if (travelInterval) {
        clearInterval(travelInterval);
        travelInterval = null;
    }
    renderJourneyContent();
}

function resumeJourney() {
    if (activeEncounter) return;
    isPaused = false;
    startTravelInterval();
    renderJourneyContent();
}

function resolveEncounter() {
    // Restore player shields after encounter
    window.gameState.ship.restoreShields();
    
    activeEncounter = null;
    renderEncounterContent();
    renderJourneyContent();
    
    // Check quests after encounter
    checkAndShowCompletedQuests();
    
    // Resume journey automatically
    if (currentDay < tripDuration) {
        isPaused = false;
        startTravelInterval();
    }
    
    // Switch back to journey tab
    const journeyTab = document.querySelector('.tab-button[data-tab="journey"]');
    if (journeyTab) journeyTab.click();
}

function startTravelInterval() {
    if (travelInterval) clearInterval(travelInterval);
    
    travelInterval = setInterval(() => {
        if (isPaused || activeEncounter) return;
        
        currentDay += 0.1; // Increment by 0.1 days for smoother progress
        
        // Engineering skill: repair 1 hull per day per level
        const engineeringLevel = window.gameState.captain.skills.engineering;
        if (engineeringLevel > 0) {
            const repairPerTick = (engineeringLevel * 0.1); // 0.1 days per tick
            window.gameState.ship.repair(repairPerTick);
        }
        
        updateProgressBar();
        renderJourneyContent();
        
        // Check for encounters (roughly one per 2 days of travel)
        if (remainingEncounters.length > 0 && Math.random() < 0.04) { // Adjusted for faster ticks
            triggerEncounter();
        }
        
        // Check if journey is complete
        if (currentDay >= tripDuration) {
            completeJourney();
        }
    }, 200); // Update every 200ms for smoother progress
}

function triggerEncounter() {
    if (remainingEncounters.length === 0) return;
    
    // Restore player shields before encounter
    window.gameState.ship.restoreShields();
    
    activeEncounter = remainingEncounters.shift();
    isPaused = true;
    
    if (travelInterval) {
        clearInterval(travelInterval);
        travelInterval = null;
    }
    
    renderJourneyContent();
    renderEncounterContent();
    
    // Switch to encounter tab
    const encounterTab = document.querySelector('.tab-button[data-tab="encounter"]');
    if (encounterTab) encounterTab.click();
}

function completeJourney() {
    if (travelInterval) {
        clearInterval(travelInterval);
        travelInterval = null;
    }
    
    // Complete the travel
    window.gameState.currentSystemIndex = destinationIndex;
    window.gameState.location = toSystem.name;
    window.gameState.advanceTime(tripDuration);
    window.selectedDestination = null;
    
    // Check quests after arrival
    // Return to main menu
    showMainMenu();
}
