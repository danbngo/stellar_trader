import { generateStarSystems } from '../generators/systemGenerators.js';
import { Ship } from './Ship.js';
import { Officer } from './Officer.js';
import { Quest } from './Quest.js';

export class GameState {
    constructor() {
        this.captain = new Officer('Captain');
        
        // Create starting ship: name, type, hull, shields, fuel, maxCargo, speed, weapons
        this.ship = new Ship('SS Wanderer', 'Light Freighter', 100, 50, 100, 50, 1.0, 2);
        
        this.ownedShips = [this.ship];
        
        this.starSystems = generateStarSystems(500);
        this.currentSystemIndex = Math.floor(this.starSystems.length / 2);
        this.location = this.starSystems[this.currentSystemIndex].name;
        
        // Game date starting at 3000 AD
        this.currentDate = new Date('3000-01-01T00:00:00');
        
        // Quests
        this.quests = [];
        
        // Track seen and visited systems
        this.seenStarSystems = new Set();
        this.visitedStarSystems = new Set();
        
        // Active journey state
        this.activeJourney = null; // { destIndex, toSystem, tripDuration, fuelNeeded, currentDay, encounters, etc. }
        
        // Mark starting system and its neighbors as seen
        const startSystem = this.starSystems[this.currentSystemIndex];
        this.visitedStarSystems.add(startSystem);
        this.seenStarSystems.add(startSystem);
        startSystem.neighborSystems.forEach(neighbor => {
            this.seenStarSystems.add(neighbor);
        });
        
        // Add starting quest
        this.addStartingQuest();
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
    
    /**
     * Add starting quest
     */
    addStartingQuest() {
        const expirationDate = new Date(this.currentDate);
        expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month from start
        
        const startingQuest = new Quest({
            title: 'Supply Run',
            description: 'Collect and deliver essential supplies for your journey: 100 food, 100 water, and 100 air.',
            cargoAmounts: {
                food: 100,
                water: 100,
                air: 100
            },
            expirationDate: expirationDate,
            expReward: 100,
            creditsReward: 10000
        });
        
        this.quests.push(startingQuest);
    }
    
    /**
     * Check and complete quests based on donations
     */
    checkQuests() {
        const completedQuests = [];
        
        this.quests.forEach(quest => {
            if (!quest.isFulfilled && quest.checkFulfilled()) {
                quest.fulfill();
                this.captain.grantExperience(quest.expReward);
                if (quest.creditsReward > 0) {
                    this.addCredits(quest.creditsReward);
                }
                completedQuests.push(quest);
            }
        });
        
        return completedQuests;
    }
    
    /**
     * Advance game time by a number of days
     * @param {number} days - Number of days to advance
     */
    advanceTime(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
    }
}
