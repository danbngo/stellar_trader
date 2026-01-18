export class Ship {
    constructor(name, type, hull, shields, fuel, maxCargo, speed, weapons) {
        this.name = name;
        this.type = type;
        this.hull = hull;
        this.maxHull = hull;
        this.shields = shields;
        this.maxShields = shields;
        this.fuel = fuel;
        this.maxFuel = fuel;
        this.cargo = {};
        this.maxCargo = maxCargo;
        this.speed = speed;
        this.weapons = weapons;
    }
    
    get value() {
        // Calculate ship value based on stats
        const baseValue = this.maxHull * 20;
        const shieldsValue = this.maxShields * 15;
        const fuelValue = this.maxFuel * 10;
        const cargoValue = this.maxCargo * 50;
        const speedValue = this.speed * 500;
        const weaponsValue = this.weapons * 500;
        return baseValue + shieldsValue + fuelValue + cargoValue + speedValue + weaponsValue;
    }
    
    damage(amount) {
        // Damage shields first, then hull
        if (this.shields > 0) {
            this.shields = Math.max(0, this.shields - amount);
            if (this.shields < 0) {
                const overflow = Math.abs(this.shields);
                this.shields = 0;
                this.hull = Math.max(0, this.hull - overflow);
            }
        } else {
            this.hull = Math.max(0, this.hull - amount);
        }
        return this.hull > 0;
    }
    
    // Calculate weapon damage with combat skill bonus
    getWeaponDamage(combatSkill = 0) {
        const baseDamage = this.weapons * 10; // Base: 10 damage per weapon
        const combatBonus = 1 + (combatSkill * 0.05); // 5% per level
        return Math.floor(baseDamage * combatBonus);
    }
    
    repair(amount) {
        this.hull = Math.min(this.maxHull, this.hull + amount);
    }
    
    restoreShields() {
        this.shields = this.maxShields;
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
