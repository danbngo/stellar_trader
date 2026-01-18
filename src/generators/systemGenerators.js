import { StarSystem } from '../classes/StarSystem.js';
import { generateStarSystemName } from './nameGenerators.js';

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
    
    return systems;
}
