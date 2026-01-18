import { StarSystem } from '../classes/StarSystem.js';
import { generateStarSystemName } from './nameGenerators.js';
import { CARGO_TYPES } from '../defs/CARGO_TYPES.js';

function calculateDistance(system1, system2) {
    const dx = system2.x - system1.x;
    const dy = system2.y - system1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate market prices for a system
 * Prices range from 0.25x to 4x the base value
 */
function generateMarketPrices() {
    const prices = {};
    const cargoTypes = Object.keys(CARGO_TYPES);
    
    for (const type of cargoTypes) {
        const baseValue = CARGO_TYPES[type].baseValue;
        // Random multiplier between 0.25x and 4x
        const multiplier = 0.25 + Math.random() * 3.75;
        prices[type] = Math.round(baseValue * multiplier);
    }
    
    return prices;
}

/**
 * Generate cargo amounts for a system
 * Amounts range from 0.25x to 4x a base amount (100)
 */
function generateCargo() {
    const cargo = {};
    const cargoTypes = Object.keys(CARGO_TYPES);
    const baseAmount = 100;
    
    for (const type of cargoTypes) {
        // Random multiplier between 0.25x and 4x
        const multiplier = 0.25 + Math.random() * 3.75;
        cargo[type] = Math.round(baseAmount * multiplier);
    }
    
    return cargo;
}

export function generateStarSystems(count = 15) {
    const systems = [];
    const usedNames = new Set();
    
    for (let i = 0; i < count; i++) {
        let name;
        let attempts = 0;
        do {
            name = generateStarSystemName();
            attempts++;
        } while (usedNames.has(name) && attempts < 50);
        
        usedNames.add(name);
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Generate all system properties
        const marketPrices = generateMarketPrices();
        const cargo = generateCargo();
        const fees = Math.random(); // 0-1, affects buy/sell prices
        const piracyLevel = Math.floor(Math.random() * 10) + 1; // 1-10
        const policeLevel = Math.floor(Math.random() * 10) + 1; // 1-10
        const merchantsLevel = Math.floor(Math.random() * 10) + 1; // 1-10
        
        systems.push(new StarSystem(
            name, 
            x, 
            y, 
            marketPrices, 
            cargo, 
            piracyLevel, 
            policeLevel, 
            merchantsLevel, 
            fees
        ));
    }
    
    // Calculate neighbors for each system
    for (let i = 0; i < systems.length; i++) {
        const currentSystem = systems[i];
        const distances = [];
        
        // Calculate distances to all other systems
        for (let j = 0; j < systems.length; j++) {
            if (i !== j) {
                distances.push({
                    system: systems[j],
                    distance: calculateDistance(currentSystem, systems[j])
                });
            }
        }
        
        // Sort by distance and take the 2 nearest
        distances.sort((a, b) => a.distance - b.distance);
        const nearestTwo = distances.slice(0, 2);
        
        // Add bidirectional neighbor relationships
        for (const { system } of nearestTwo) {
            if (!currentSystem.neighborSystems.includes(system)) {
                currentSystem.neighborSystems.push(system);
            }
            if (!system.neighborSystems.includes(currentSystem)) {
                system.neighborSystems.push(currentSystem);
            }
        }
    }
    
    return systems;
}
