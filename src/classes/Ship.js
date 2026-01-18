export class Ship {
    constructor(name, type, hull, fuel, maxCargo, weapons) {
        this.name = name;
        this.type = type;
        this.hull = hull;
        this.maxHull = hull;
        this.fuel = fuel;
        this.maxFuel = fuel;
        this.cargo = {};
        this.maxCargo = maxCargo;
        this.weapons = weapons;
    }
    
    get value() {
        // Calculate ship value based on stats
        const baseValue = this.maxHull * 20;
        const fuelValue = this.maxFuel * 10;
        const cargoValue = this.maxCargo * 50;
        const weaponsValue = this.weapons * 500;
        return baseValue + fuelValue + cargoValue + weaponsValue;
    }
    
    damage(amount) {
        this.hull = Math.max(0, this.hull - amount);
        return this.hull > 0;
    }
    
    repair(amount) {
        this.hull = Math.min(this.maxHull, this.hull + amount);
    }
    
    useFuel(amount) {
        if (this.fuel >= amount) {
            this.fuel -= amount;
            return true;
        }
        return false;
    }
    
    getTotalCargo() {
        return Object.values(this.cargo).reduce((sum, qty) => sum + qty, 0);
    }
    
    addCargo(item, quantity) {
        if (this.getTotalCargo() + quantity <= this.maxCargo) {
            this.cargo[item] = (this.cargo[item] || 0) + quantity;
            return true;
        }
        return false;
    }
    
    removeCargo(item, quantity) {
        if ((this.cargo[item] || 0) >= quantity) {
            this.cargo[item] -= quantity;
            if (this.cargo[item] === 0) delete this.cargo[item];
            return true;
        }
        return false;
    }
}
