import { StarSystem } from '../classes/StarSystem.js';
import { generateStarSystemName } from './nameGenerators.js';

function calculateDistance(system1, system2) {
    const dx = system2.x - system1.x;
    const dy = system2.y - system1.y;
    return Math.sqrt(dx * dx + dy * dy);
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
        
        systems.push(new StarSystem(name, x, y));
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
