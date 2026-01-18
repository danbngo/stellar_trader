import { ce, createButton, createTwoColumnLayout, createDataTable, showMenu, createTabs, statColorSpan } from '../ui.js';
import { showMainMenu } from './mainMenu.js';
import { ProgressBar } from '../classes/ProgressBar.js';

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
    // Reset state or restore from activeJourney
    const journey = window.gameState.activeJourney;
    
    if (journey && journey.destIndex === destIndex) {
        // Restore existing journey state
        currentDay = journey.currentDay || 0;
        remainingEncounters = journey.remainingEncounters || [...allEncounters];
        activeEncounter = journey.activeEncounter || null;
    } else {
        // Reset for new journey
        currentDay = 0;
        remainingEncounters = [...allEncounters];
        activeEncounter = null;
    }
    
    isPaused = true;
    travelInterval = null;
    destinationIndex = destIndex;
    toSystem = destination;
    tripDuration = duration;
    avgPiracy = piracy;
    avgPolice = police;
    avgMerchants = merchants;
    
    // Store reference to resolveEncounter so encounter handlers can access it
    window.travelEncounterMenuInstance = {
        resolveEncounter
    };
    
    renderTravelScreen();
}

function renderTravelScreen() {
    showMenu({
        title: '',
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
    const progressRatio = Math.max(0, currentDay / tripDuration);
    const progressBar = new ProgressBar(40, progressRatio);
    
    return `
        <div id="journey-progress-bar" style="font-family: monospace; font-size: 14px; color: #09f; text-align: center; margin-bottom: 20px; letter-spacing: 1px;">
            ${progressBar.getText()} Day ${currentDay.toFixed(1)} / ${tripDuration}
        </div>
        <div id="journey-content-columns"></div>
        <div id="journey-buttons" class="button-container"></div>
    `;
}

function getEncounterContent() {
    return `
        <div id="encounter-transmission" style="background: #112; border: 1px solid #09f; border-radius: 4px; padding: 15px; margin-bottom: 20px; font-family: monospace; color: #0ff; min-height: 80px; display: none;"></div>
        <div id="encounter-content-columns"></div>
        <div id="encounter-buttons" class="button-container"></div>
    `;
}

function updateProgressBar() {
    const progressBarElement = document.getElementById('journey-progress-bar');
    if (progressBarElement) {
        const progressRatio = Math.max(0, currentDay / tripDuration);
        const progressBar = new ProgressBar(40, progressRatio);
        progressBarElement.textContent = progressBar.getText() + ` Day ${currentDay.toFixed(1)} / ${tripDuration}`;
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
                        ce({ 
                            className: 'stat-value', 
                            html: statColorSpan((avgPiracy / 5).toFixed(1) + 'x', 1 / (avgPiracy / 5))
                        })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Police Level:' }),
                        ce({ 
                            className: 'stat-value', 
                            html: statColorSpan((avgPolice / 5).toFixed(1) + 'x', avgPolice / 5)
                        })
                    ]
                }),
                ce({
                    className: 'stat-line',
                    children: [
                        ce({ className: 'stat-label', text: 'Merchants Level:' }),
                        ce({ 
                            className: 'stat-value', 
                            html: statColorSpan((avgMerchants / 5).toFixed(1) + 'x', avgMerchants / 5)
                        })
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
    const transmissionDiv = document.getElementById('encounter-transmission');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!activeEncounter) {
        if (transmissionDiv) transmissionDiv.style.display = 'none';
        container.appendChild(ce({
            tag: 'p',
            style: { textAlign: 'center', color: '#888', padding: '40px' },
            text: 'No active encounters'
        }));
        return;
    }
    
    // Display transmission if available
    if (transmissionDiv && activeEncounter.transmissionText) {
        transmissionDiv.style.display = 'block';
        transmissionDiv.innerHTML = activeEncounter.transmissionText;
    } else if (transmissionDiv) {
        transmissionDiv.style.display = 'none';
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
        const encounterTypeName = ship.encounterType ? ship.encounterType.name : ship.type;
        
        detailsDisplay = `Hull: ${ship.hull}/${ship.maxHull} | Shields: ${ship.shields}/${ship.maxShields} | Weapons: ${ship.weapons}`;
        
        // Add cargo for merchants
        if (ship.encounterType && ship.encounterType.name === 'Merchant') {
            const totalCargo = ship.getTotalCargo();
            detailsDisplay += ` | Cargo: ${totalCargo}/${ship.maxCargo}`;
        }
        
        return {
            cells: [ship.name, encounterTypeName, detailsDisplay],
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
    
    // If progress is still at 0%, show Start Journey and Cancel Journey
    if (currentDay === 0) {
        buttonsDiv.appendChild(createButton({
            text: 'Start Journey',
            action: startJourney,
            disabled: activeEncounter !== null,
            disabledReason: activeEncounter ? 'Resolve encounter first' : ''
        }));
        
        buttonsDiv.appendChild(createButton({
            text: 'Cancel Journey',
            action: cancelJourney
        }));
    } else {
        // Progress has started, only show Resume/Pause
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
}

function renderEncounterButtons() {
    const buttonsDiv = document.getElementById('encounter-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (activeEncounter && activeEncounter.actions) {
        // Render all available actions for this encounter
        activeEncounter.actions.forEach(action => {
            buttonsDiv.appendChild(createButton({
                text: action.text,
                action: action.handler
            }));
        });
    }
}

function startJourney() {
    // Deduct fuel when starting journey
    const journey = window.gameState.activeJourney;
    if (journey && !journey.fuelDeducted) {
        if (window.gameState.useFuel(journey.fuelNeeded)) {
            journey.fuelDeducted = true;
            isPaused = false;
            startTravelInterval();
            renderJourneyContent();
        }
    }
}

function cancelJourney() {
    // Clear the active journey and return to main menu
    window.gameState.activeJourney = null;
    showMainMenu();
}

function pauseJourney() {
    isPaused = true;
    if (travelInterval) {
        clearInterval(travelInterval);
        travelInterval = null;
    }
    
    // Sync state to gameState.activeJourney
    if (window.gameState.activeJourney) {
        window.gameState.activeJourney.currentDay = currentDay;
        window.gameState.activeJourney.remainingEncounters = remainingEncounters;
        window.gameState.activeJourney.activeEncounter = activeEncounter;
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
    
    // Switch back to journey tab first
    const journeyTab = document.querySelector('.tab-button[data-tab="journey"]');
    if (journeyTab) {
        journeyTab.click();
    }
    
    // Render journey content after switching tabs
    renderJourneyContent();
    
    // Resume journey automatically
    if (currentDay < tripDuration) {
        isPaused = false;
        startTravelInterval();
    }
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
    
    // Call onGreet to set up encounter data
    if (activeEncounter && activeEncounter.encounterType && activeEncounter.encounterType.onGreet) {
        const encounterData = activeEncounter.encounterType.onGreet(activeEncounter, window.gameState.ship);
        activeEncounter.transmissionText = encounterData.transmissionText;
        activeEncounter.actions = encounterData.actions;
    }
    
    // Switch to encounter tab
    const encounterTab = document.querySelector('.tab-button[data-tab="encounter"]');
    if (encounterTab) {
        encounterTab.click();
    }
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
