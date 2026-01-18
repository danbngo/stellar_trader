import { generateStarSystems } from '../generators/systemGenerators.js';
import { Ship } from './Ship.js';
import { Officer } from './Officer.js';

export class GameState {
    constructor() {
        this.captain = new Officer('Captain');
        
        // Create starting ship: name, type, hull, shields, fuel, maxCargo, speed, weapons
        this.ship = new Ship('SS Wanderer', 'Light Freighter', 100, 50, 100, 50, 1.0, 2);
        
        this.ownedShips = [this.ship];
        
        this.starSystems = generateStarSystems(500);
        this.currentSystemIndex = Math.floor(this.starSystems.length / 2);
        this.location = this.starSystems[this.currentSystemIndex].name;
        this.day = 1;
        
        // Track seen and visited systems
        this.seenStarSystems = new Set();
        this.visitedStarSystems = new Set();
        
        // Mark starting system and its neighbors as seen
        const startSystem = this.starSystems[this.currentSystemIndex];
        this.visitedStarSystems.add(startSystem);
        this.seenStarSystems.add(startSystem);
        startSystem.neighborSystems.forEach(neighbor => {
            this.seenStarSystems.add(neighbor);
        });
    }
    
    damageShip(amount) {
        return this.ship.damage(amount);
    }
    
    repairShip(amount) {
        this.ship.repair(amount);
    }
    
    useFuel(amount) {
        return this.ship.useFuel(amount);
    }
    
    addCredits(amount) {
        this.captain.addCredits(amount);
    }
    
    spendCredits(amount) {
        return this.captain.spendCredits(amount);
    }
    
    getTotalCargo() {
        return this.ship.getTotalCargo();
    }
    
    addCargo(item, quantity) {
        return this.ship.addCargo(item, quantity);
    }
    
    removeCargo(item, quantity) {
        return this.ship.removeCargo(item, quantity);
    }
    
    /**
     * Check if a destination system can be reached with current fuel
     * @param {Object} destinationSystem - The system to check
     * @returns {Object} - { canReach: boolean, fuelNeeded: number, distance: number }
     */
    canReachSystem(destinationSystem) {
        const currentSystem = this.starSystems[this.currentSystemIndex];
        const dx = destinationSystem.x - currentSystem.x;
        const dy = destinationSystem.y - currentSystem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const fuelNeeded = Math.ceil(distance * 10);
        const canReach = this.ship.fuel >= fuelNeeded;
        
        return { canReach, fuelNeeded, distance };
    }
}
