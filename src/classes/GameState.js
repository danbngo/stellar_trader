import { generateStarSystems } from '../generators/systemGenerators.js';

export class GameState {
    constructor() {
        this.captain = {
            name: 'Captain',
            credits: 1000,
            reputation: 0
        };
        
        this.ship = {
            name: 'SS Wanderer',
            type: 'Light Freighter',
            hull: 100,
            maxHull: 100,
            fuel: 100,
            maxFuel: 100,
            cargo: {},
            maxCargo: 50,
            value: 5000,
            weapons: 2
        };
        
        this.ownedShips = [this.ship];
        
        this.starSystems = generateStarSystems(500);
        this.currentSystemIndex = Math.floor(this.starSystems.length / 2);
        this.location = this.starSystems[this.currentSystemIndex].name;
        this.day = 1;
    }
    
    damageShip(amount) {
        this.ship.hull = Math.max(0, this.ship.hull - amount);
        return this.ship.hull > 0;
    }
    
    repairShip(amount) {
        this.ship.hull = Math.min(this.ship.maxHull, this.ship.hull + amount);
    }
    
    useFuel(amount) {
        if (this.ship.fuel >= amount) {
            this.ship.fuel -= amount;
            return true;
        }
        return false;
    }
    
    addCredits(amount) {
        this.captain.credits += amount;
    }
    
    spendCredits(amount) {
        if (this.captain.credits >= amount) {
            this.captain.credits -= amount;
            return true;
        }
        return false;
    }
    
    getTotalCargo() {
        return Object.values(this.ship.cargo).reduce((sum, qty) => sum + qty, 0);
    }
    
    addCargo(item, quantity) {
        if (this.getTotalCargo() + quantity <= this.ship.maxCargo) {
            this.ship.cargo[item] = (this.ship.cargo[item] || 0) + quantity;
            return true;
        }
        return false;
    }
    
    removeCargo(item, quantity) {
        if ((this.ship.cargo[item] || 0) >= quantity) {
            this.ship.cargo[item] -= quantity;
            if (this.ship.cargo[item] === 0) delete this.ship.cargo[item];
            return true;
        }
        return false;
    }
    
    getShipStatus() {
        return `
            <div class="stats-group">
                <div class="stat-line">
                    <span class="stat-label">Ship:</span>
                    <span class="stat-value">${this.ship.name}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Hull:</span>
                    <span class="stat-value">${this.ship.hull}/${this.ship.maxHull}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Fuel:</span>
                    <span class="stat-value">${this.ship.fuel}/${this.ship.maxFuel}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Cargo:</span>
                    <span class="stat-value">${this.getTotalCargo()}/${this.ship.maxCargo}</span>
                </div>
            </div>
        `;
    }
    
    getCaptainStatus() {
        return `
            <div class="stats-group">
                <div class="stat-line">
                    <span class="stat-label">Captain:</span>
                    <span class="stat-value">${this.captain.name}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Credits:</span>
                    <span class="stat-value">${this.captain.credits}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Reputation:</span>
                    <span class="stat-value">${this.captain.reputation}</span>
                </div>
            </div>
        `;
    }
}
