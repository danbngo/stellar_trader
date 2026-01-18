import { ce, createButton, createTwoColumnLayout, createDataTable } from '../ui.js';
import { calculateDistance } from '../utils.js';
import { showMainMenu } from './mainMenu.js';
import { generatePirateShip, generatePoliceShip, generateMerchantShip } from '../generators/shipGenerators.js';
import { showTravelEncounterMenu } from './travelEncounterMenu.js';

export function getTravelContent() {
    return `
        <h3 style="color: #0bf; margin-bottom: 15px; text-align: center;">STAR NAVIGATION</h3>
        <div id="travel-map-container"></div>
        <div class="stats-group" style="margin-top: 15px;">
            <div class="stat-line">
                <span class="stat-label">Current Location:</span>
                <span class="stat-value">${window.gameState.location}</span>
            </div>
            <div id="destination-info"></div>
        </div>
        <div id="travel-buttons" class="button-container"></div>
    `;
}

export function renderTravelTab() {
    const mapContainer = document.getElementById('travel-map-container');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = '';
    
    const travelMap = ce({
        className: 'travel-map',
        children: [
            ce({
                className: 'travel-map-title',
                text: 'GALAXY MAP'
            }),
            ce({
                className: 'travel-map-canvas',
                id: 'travel-map-canvas',
                children: [
                    ce({
                        tag: 'svg',
                        id: 'travel-lines-svg',
                        attrs: {
                            xmlns: 'http://www.w3.org/2000/svg',
                            viewBox: '0 0 800 600',
                            preserveAspectRatio: 'none'
                        },
                        style: { 
                            position: 'absolute', 
                            top: '0', 
                            left: '0', 
                            width: '100%', 
                            height: '100%', 
                            pointerEvents: 'none',
                            zIndex: '1'
                        }
                    }),
                    ce({
                        className: 'travel-map-viewport',
                        id: 'travel-map-viewport'
                    })
                ]
            })
        ]
    });
    
    mapContainer.appendChild(travelMap);
    
    // Add resize observer to recenter map when canvas resizes
    const canvas = document.getElementById('travel-map-canvas');
    if (canvas && window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            updateTravelMap();
            updateDestinationInfo();
        });
        resizeObserver.observe(canvas);
    }
    
    updateTravelMap();
    updateDestinationInfo();
}

function updateTravelMap() {
    const viewport = document.getElementById('travel-map-viewport');
    const canvas = document.getElementById('travel-map-canvas');
    const svg = document.getElementById('travel-lines-svg');
    if (!viewport || !canvas || !svg || !window.gameState) return;
    
    viewport.innerHTML = '';
    svg.innerHTML = '';
    
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    // Store positions for line drawing
    const systemPositions = new Map();
    
    window.gameState.starSystems.forEach((system, index) => {
        // Only show systems that have been seen
        if (!window.gameState.seenStarSystems.has(system)) return;
        
        const isCurrent = index === window.gameState.currentSystemIndex;
        const isVisited = window.gameState.visitedStarSystems.has(system);
        const distance = calculateDistance(currentSystem, system);
        
        const fuelNeeded = Math.ceil(distance / 2.5);
        const canReach = window.gameState.ship.fuel >= fuelNeeded;
        
        // Calculate relative position to center
        const relativeX = (system.x - currentSystem.x) * 20;
        const relativeY = (system.y - currentSystem.y) * 20;
        
        const left = centerX + relativeX;
        const top = centerY + relativeY;
        
        systemPositions.set(system, { left, top });
        
        let systemClass = 'travel-system';
        if (isCurrent) {
            systemClass += ' current';
        } else if (isVisited) {
            systemClass += ' visited';
        } else {
            systemClass += ' seen';
        }
        
        const systemDot = ce({
            className: systemClass,
            style: { left: `${left}px`, top: `${top}px` },
            attrs: { title: isVisited ? `${system.name} - ${fuelNeeded} fuel` : '???' },
            onclick: isCurrent ? null : () => selectTravelDestination(system, index, distance, fuelNeeded, canReach, left, top)
        });
        
        viewport.appendChild(systemDot);
        
        // Show name for visited systems, "?" for seen but unvisited
        const label = ce({
            className: 'travel-system-label',
            text: isVisited ? system.name : '?',
            style: { 
                left: `${left}px`, 
                top: `${top}px`,
                color: isCurrent ? '#0bf' : isVisited ? '#0f0' : '#888'
            }
        });
        viewport.appendChild(label);
    });
    
    // Draw line if destination is selected
    if (window.selectedDestination) {
        const currentPos = systemPositions.get(currentSystem);
        const destSystem = window.gameState.starSystems[window.selectedDestination.index];
        const destPos = systemPositions.get(destSystem);
        
        if (currentPos && destPos && svg) {
            // Set SVG viewBox to match canvas dimensions
            const canvasRect = canvas.getBoundingClientRect();
            svg.setAttribute('viewBox', `0 0 ${canvasRect.width} ${canvasRect.height}`);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', currentPos.left.toString());
            line.setAttribute('y1', currentPos.top.toString());
            line.setAttribute('x2', destPos.left.toString());
            line.setAttribute('y2', destPos.top.toString());
            line.setAttribute('stroke', window.selectedDestination.canReach ? '#0f0' : '#f00');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '5,5');
            svg.appendChild(line);
        }
    }
}

function selectTravelDestination(system, index, distance, fuelNeeded, canReach, left, top) {
    const tripDuration = Math.ceil(distance / 1.25); // 4x duration: 1 day per 1.25 distance units
    window.selectedDestination = { system, index, distance, fuelNeeded, canReach, tripDuration };
    
    updateTravelMap(); // Redraw to show line
    updateDestinationInfo();
    renderTravelButtons();
}

function updateDestinationInfo() {
    const infoDiv = document.getElementById('destination-info');
    if (!infoDiv) return;
    
    if (window.selectedDestination) {
        const { system, distance, fuelNeeded, tripDuration, canReach } = window.selectedDestination;
        const isVisited = window.gameState.visitedStarSystems.has(system);
        const systemName = isVisited ? system.name : 'Unknown System';
        
        infoDiv.innerHTML = `
            <div class="stat-line" style="margin-top: 10px;">
                <span class="stat-label">Destination:</span>
                <span class="stat-value">${systemName}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Distance:</span>
                <span class="stat-value">${distance.toFixed(1)} units</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Fuel Cost:</span>
                <span class="stat-value" style="color: ${canReach ? '#09f' : '#f00'};">${fuelNeeded} / ${window.gameState.ship.fuel}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Trip Duration:</span>
                <span class="stat-value">${tripDuration} day${tripDuration > 1 ? 's' : ''}</span>
            </div>
        `;
    } else {
        infoDiv.innerHTML = '<p style="text-align: center; color: #888; margin-top: 10px;">Select a system to view travel details</p>';
    }
}

function renderTravelButtons() {
    const buttonsDiv = document.getElementById('travel-buttons');
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (window.selectedDestination) {
        const { system, index, canReach } = window.selectedDestination;
        const isVisited = window.gameState.visitedStarSystems.has(system);
        const systemName = isVisited ? system.name : 'Unknown System';
        
        buttonsDiv.appendChild(createButton({
            text: `Travel to ${systemName}`,
            action: () => travelToSystem(index),
            disabled: !canReach,
            disabledReason: canReach ? '' : `Not enough fuel (need ${window.selectedDestination.fuelNeeded})`
        }));
    }
}

function travelToSystem(index) {
    if (!window.selectedDestination) return;
    
    const { fuelNeeded, canReach, tripDuration } = window.selectedDestination;
    
    if (canReach && window.gameState.useFuel(fuelNeeded)) {
        const fromSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
        const toSystem = window.gameState.starSystems[index];
        
        // Mark destination as visited and add its neighbors to seen systems
        window.gameState.visitedStarSystems.add(toSystem);
        window.gameState.seenStarSystems.add(toSystem);
        toSystem.neighborSystems.forEach(neighbor => {
            window.gameState.seenStarSystems.add(neighbor);
        });
        
        // Calculate encounter chance
        const avgPiracy = (fromSystem.piracyLevel + toSystem.piracyLevel) / 2;
        const avgPolice = (fromSystem.policeLevel + toSystem.policeLevel) / 2;
        const avgMerchants = (fromSystem.merchantsLevel + toSystem.merchantsLevel) / 2;
        
        // Generate encounters based on trip duration and regional levels
        const encounters = [];
        
        // Multiple chances for encounters based on trip duration
        const encounterChecks = Math.max(1, Math.floor(tripDuration / 2));
        
        for (let i = 0; i < encounterChecks; i++) {
            // Chance for pirate encounter based on piracy level
            if (Math.random() * 10 < avgPiracy) {
                encounters.push(generatePirateShip());
            }
            
            // Chance for police encounter based on police level
            if (Math.random() * 10 < avgPolice) {
                encounters.push(generatePoliceShip());
            }
            
            // Chance for merchant encounter based on merchants level
            if (Math.random() * 10 < avgMerchants) {
                encounters.push(generateMerchantShip());
            }
        }
        
        // Show travel encounter menu
        showTravelEncounterMenu(index, toSystem, tripDuration, avgPiracy, avgPolice, avgMerchants, encounters);
    }
}
