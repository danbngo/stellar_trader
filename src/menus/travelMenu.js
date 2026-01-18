import { ce, createButton, createTwoColumnLayout, createDataTable, statColorSpan } from '../ui.js';
import { calculateDistance } from '../utils.js';
import { showMainMenu } from './mainMenu.js';
import { generatePirateShip, generatePoliceShip, generateMerchantShip } from '../generators/shipGenerators.js';
import { showTravelEncounterMenu } from './travelEncounterMenu.js';

export function getTravelContent() {
    const leftColumn = '<div id="travel-map-container"></div>';
    const rightColumn = `
        <div class="stats-group">
            <div class="stat-line">
                <span class="stat-label">Current Location:</span>
                <span class="stat-value">${window.gameState.location}</span>
            </div>
            <div id="destination-info"></div>
        </div>
    `;
    
    return createTwoColumnLayout({ leftColumn, rightColumn });
}

export function renderTravelTab() {
    const mapContainer = document.getElementById('travel-map-container');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = '';
    
    const travelMap = ce({
        className: 'travel-map',
        children: [
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
    renderTravelButtons(); // Render buttons to show selected system on tab activation
}

function updateTravelMap() {
    const viewport = document.getElementById('travel-map-viewport');
    const canvas = document.getElementById('travel-map-canvas');
    const svg = document.getElementById('travel-lines-svg');
    if (!viewport || !canvas || !svg || !window.gameState) return;
    
    viewport.innerHTML = '';
    svg.innerHTML = '';
    
    // Add invisible rect to prevent browser optimization bug with single SVG child
    const invisibleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    invisibleRect.setAttribute('width', '100%');
    invisibleRect.setAttribute('height', '100%');
    invisibleRect.setAttribute('fill', 'transparent');
    svg.appendChild(invisibleRect);
    
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    // Store positions for line drawing
    const systemPositions = new Map();
    
    window.gameState.starSystems.forEach((system, index) => {
        const isCurrent = index === window.gameState.currentSystemIndex;
        const isVisited = window.gameState.visitedStarSystems.has(system);
        const isSeen = window.gameState.seenStarSystems.has(system);
        const isSelected = window.selectedDestination && window.selectedDestination.index === index;
        
        const { canReach, fuelNeeded, distance } = window.gameState.canReachSystem(system);
        
        // Calculate relative position to center
        const relativeX = (system.x - currentSystem.x) * 20;
        const relativeY = (system.y - currentSystem.y) * 20;
        
        const left = centerX + relativeX;
        const top = centerY + relativeY;
        
        systemPositions.set(system, { left, top });
        
        let systemClass = 'travel-system';
        if (isCurrent) {
            systemClass += ' current';
        } else if (isSelected) {
            systemClass += ' selected';
        } else if (canReach) {
            systemClass += ' reachable';
        } else {
            systemClass += ' unreachable';
        }
        
        const systemDot = ce({
            className: systemClass,
            style: { left: `${left}px`, top: `${top}px` },
            attrs: { title: isVisited ? `${system.name} - ${fuelNeeded} fuel` : isSeen ? `${system.name} - ${fuelNeeded} fuel` : '???' },
            onclick: isCurrent ? null : () => selectTravelDestination(system, index, distance, fuelNeeded, canReach, left, top, isVisited, isSeen)
        });
        
        viewport.appendChild(systemDot);
        
        // Show name for visited/seen systems, "?" for unseen
        const label = ce({
            className: 'travel-system-label',
            text: isVisited ? system.name : isSeen ? system.name : '?',
            style: { 
                left: `${left}px`, 
                top: `${top}px`,
                color: isCurrent ? '#0ff' : canReach ? '#0f0' : '#888'
            }
        });
        viewport.appendChild(label);
    });
    
    // Draw line if destination is selected
    if (window.selectedDestination) {
        console.log('=== Drawing SVG Line ===');
        console.log('Selected destination:', window.selectedDestination);
        console.log('Current system:', currentSystem.name, 'at', currentSystem.x, currentSystem.y);
        
        const currentPos = systemPositions.get(currentSystem);
        const destSystem = window.gameState.starSystems[window.selectedDestination.index];
        const destPos = systemPositions.get(destSystem);
        
        console.log('Current position:', currentPos);
        console.log('Destination system:', destSystem.name, 'at', destSystem.x, destSystem.y);
        console.log('Destination position:', destPos);
        console.log('SVG element:', svg);
        console.log('Canvas rect:', canvas ? canvas.getBoundingClientRect() : 'No canvas');
        
        if (currentPos && destPos && svg) {
            // Force SVG reflow to ensure browser recognizes it's live
            svg.getBoundingClientRect();
            
            // Set SVG viewBox to match canvas dimensions
            const canvasRect = canvas.getBoundingClientRect();
            svg.setAttribute('viewBox', `0 0 ${canvasRect.width} ${canvasRect.height}`);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const strokeColor = window.selectedDestination.canReach ? '#0ff' : '#f00';
            line.setAttribute('x1', currentPos.left.toString());
            line.setAttribute('y1', currentPos.top.toString());
            line.setAttribute('x2', destPos.left.toString());
            line.setAttribute('y2', destPos.top.toString());
            line.setAttribute('style', `stroke:${strokeColor};stroke-width:2;stroke-dasharray:5,5`);
            
            console.log('Line created:', line);
            console.log('Line attributes:', {
                x1: line.getAttribute('x1'),
                y1: line.getAttribute('y1'),
                x2: line.getAttribute('x2'),
                y2: line.getAttribute('y2'),
                stroke: line.getAttribute('stroke'),
                strokeWidth: line.getAttribute('stroke-width')
            });
            
            svg.appendChild(line);
            console.log('Line appended to SVG. SVG children count:', svg.children.length);
        } else {
            console.log('Missing required elements:', {
                currentPos: !!currentPos,
                destPos: !!destPos,
                svg: !!svg
            });
        }
    } else {
        console.log('No selected destination');
    }
}

function selectTravelDestination(system, index, distance, fuelNeeded, canReach, left, top, isVisited, isSeen) {
    // Calculate trip duration based on distance, ship speed, and piloting skill
    const baseSpeed = 1.25; // Base speed units per day
    const shipSpeed = window.gameState.ship.speed || 1.0;
    const pilotingBonus = 1 + (window.gameState.captain.skills.piloting * 0.05); // 5% per level
    const effectiveSpeed = baseSpeed * shipSpeed * pilotingBonus;
    const tripDuration = Math.ceil(distance / effectiveSpeed);
    
    window.selectedDestination = { system, index, distance, fuelNeeded, canReach, tripDuration, isVisited, isSeen };
    
    updateTravelMap(); // Redraw to show line
    updateDestinationInfo();
    renderTravelButtons();
}

function updateDestinationInfo() {
    const infoDiv = document.getElementById('destination-info');
    if (!infoDiv) return;
    
    if (window.selectedDestination) {
        const { system, distance, fuelNeeded, tripDuration, canReach, isVisited, isSeen } = window.selectedDestination;
        const systemName = (isVisited || isSeen) ? system.name : 'Unknown System';
        
        // Stats HTML - only show actual values if visited, otherwise show ?
        let piracyHTML, policeHTML, merchantsHTML;
        if (isVisited) {
            const piracyMultiplier = (system.piracyLevel / 5).toFixed(1);
            const policeMultiplier = (system.policeLevel / 5).toFixed(1);
            const merchantsMultiplier = (system.merchantsLevel / 5).toFixed(1);
            
            // Piracy is bad when high (inverted ratio)
            const piracyRatio = 1 / (system.piracyLevel / 5);
            // Police and merchants are good when high (direct ratio)
            const policeRatio = system.policeLevel / 5;
            const merchantsRatio = system.merchantsLevel / 5;
            
            piracyHTML = statColorSpan(`${piracyMultiplier}x`, piracyRatio);
            policeHTML = statColorSpan(`${policeMultiplier}x`, policeRatio);
            merchantsHTML = statColorSpan(`${merchantsMultiplier}x`, merchantsRatio);
        } else {
            piracyHTML = '?';
            policeHTML = '?';
            merchantsHTML = '?';
        }
        
        infoDiv.innerHTML = `
            <div class="stat-line">
                <span class="stat-label">Destination:</span>
                <span class="stat-value">${systemName}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Visited:</span>
                <span class="stat-value">${isVisited ? 'Yes' : 'No'}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Distance:</span>
                <span class="stat-value">${distance.toFixed(1)} light years</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Fuel Cost:</span>
                <span class="stat-value" style="color: ${canReach ? '#09f' : '#f00'};">${fuelNeeded} / ${window.gameState.ship.fuel}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Trip Duration:</span>
                <span class="stat-value">${tripDuration} day${tripDuration > 1 ? 's' : ''}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Piracy:</span>
                <span class="stat-value">${piracyHTML}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Police:</span>
                <span class="stat-value">${policeHTML}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Merchants:</span>
                <span class="stat-value">${merchantsHTML}</span>
            </div>
        `;
    } else {
        infoDiv.innerHTML = '<p style="text-align: center; color: #888; margin-top: 10px;">Select a system to view travel details</p>';
    }
}

function renderTravelButtons() {
    const buttonsDiv = window.currentMenu?.getButtonContainer();
    if (!buttonsDiv) return;
    
    buttonsDiv.innerHTML = '';
    
    if (window.selectedDestination) {
        const { system, index, canReach, isVisited, isSeen } = window.selectedDestination;
        const systemName = (isVisited || isSeen) ? system.name : 'Unknown System';
        
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
    
    if (canReach) {
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
            // Chance for pirate encounter based on piracy level (piracyLevel/5 = multiplier)
            if (Math.random() * 20 < avgPiracy) {
                encounters.push(generatePirateShip());
            }
            
            // Chance for police encounter based on police level
            if (Math.random() * 20 < avgPolice) {
                encounters.push(generatePoliceShip());
            }
            
            // Chance for merchant encounter based on merchants level
            if (Math.random() * 20 < avgMerchants) {
                encounters.push(generateMerchantShip());
            }
        }
        
        // Store journey in gameState (fuel not yet deducted)
        window.gameState.activeJourney = {
            destIndex: index,
            toSystem,
            tripDuration,
            fuelNeeded,
            currentDay: 0,
            encounters,
            avgPiracy,
            avgPolice,
            avgMerchants,
            fuelDeducted: false
        };
        
        // Show travel encounter menu
        showTravelEncounterMenu(index, toSystem, tripDuration, avgPiracy, avgPolice, avgMerchants, encounters);
    }
}
