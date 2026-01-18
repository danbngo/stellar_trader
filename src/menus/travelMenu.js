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
                        className: 'travel-map-viewport',
                        id: 'travel-map-viewport'
                    })
                ]
            })
        ]
    });
    
    mapContainer.appendChild(travelMap);
    updateTravelMap();
    updateDestinationInfo();
}

function updateTravelMap() {
    const viewport = document.getElementById('travel-map-viewport');
    const canvas = document.getElementById('travel-map-canvas');
    if (!viewport || !canvas || !window.gameState) return;
    
    viewport.innerHTML = '';
    
    const currentSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    // Calculate view range (show systems within a certain radius)
    const viewRadius = 50; // Show systems within 50 units of current position
    
    window.gameState.starSystems.forEach((system, index) => {
        const isCurrent = index === window.gameState.currentSystemIndex;
        const distance = calculateDistance(currentSystem, system);
        
        // Only show systems within view radius or current system
        if (!isCurrent && distance > viewRadius) return;
        
        const fuelNeeded = Math.ceil(distance / 2.5);
        const canReach = window.gameState.ship.fuel >= fuelNeeded;
        
        // Calculate relative position to center
        const relativeX = (system.x - currentSystem.x) * 20; // 5x zoom: scale factor increased from 4 to 20
        const relativeY = (system.y - currentSystem.y) * 20;
        
        const left = centerX + relativeX;
        const top = centerY + relativeY;
        
        let systemClass = 'travel-system';
        if (isCurrent) systemClass += ' current';
        else if (canReach && !isCurrent) systemClass += ' reachable';
        else if (!isCurrent) systemClass += ' unreachable';
        
        const systemDot = ce({
            className: systemClass,
            style: { left: `${left}px`, top: `${top}px` },
            attrs: { title: `${system.name} - ${fuelNeeded} fuel` },
            onclick: isCurrent ? null : () => selectTravelDestination(system, index, distance, fuelNeeded, canReach)
        });
        
        viewport.appendChild(systemDot);
        
        const label = ce({
            className: 'travel-system-label',
            text: system.name,
            style: { 
                left: `${left}px`, 
                top: `${top}px`,
                color: isCurrent ? '#0bf' : canReach ? '#ff0' : '#f00'
            }
        });
        viewport.appendChild(label);
    });
}

function selectTravelDestination(system, index, distance, fuelNeeded, canReach) {
    const tripDuration = Math.ceil(distance / 1.25); // 4x duration: 1 day per 1.25 distance units
    window.selectedDestination = { system, index, distance, fuelNeeded, canReach, tripDuration };
    
    updateDestinationInfo();
    renderTravelButtons();
}

function updateDestinationInfo() {
    const infoDiv = document.getElementById('destination-info');
    if (!infoDiv) return;
    
    if (window.selectedDestination) {
        const { system, fuelNeeded, tripDuration, canReach } = window.selectedDestination;
        infoDiv.innerHTML = `
            <div class="stat-line" style="margin-top: 10px;">
                <span class="stat-label">Destination:</span>
                <span class="stat-value">${system.name}</span>
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
        const { system, index, fuelNeeded, canReach } = window.selectedDestination;
        
        buttonsDiv.appendChild(createButton({
            text: `Travel to ${system.name} (${fuelNeeded} fuel)`,
            action: () => travelToSystem(index),
            disabled: !canReach,
            disabledReason: canReach ? '' : `Need ${fuelNeeded} fuel (have ${window.gameState.ship.fuel})`
        }));
    }
}

function travelToSystem(index) {
    if (!window.selectedDestination) return;
    
    const { fuelNeeded, canReach, tripDuration } = window.selectedDestination;
    
    if (canReach && window.gameState.useFuel(fuelNeeded)) {
        const fromSystem = window.gameState.starSystems[window.gameState.currentSystemIndex];
        const toSystem = window.gameState.starSystems[index];
        
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
