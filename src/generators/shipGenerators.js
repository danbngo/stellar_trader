import { SHIP_TYPE_ARRAY } from '../defs/SHIP_TYPES.js';
import { Ship } from '../classes/Ship.js';

const shipPrefix = ['Dark', 'Swift', 'Red', 'Black', 'Steel', 'Iron', 'Golden', 'Silver', 'Shadow', 'Night'];
const shipSuffix = ['Falcon', 'Hawk', 'Eagle', 'Raven', 'Wolf', 'Tiger', 'Dragon', 'Viper', 'Cobra', 'Phoenix'];

function generateShipName() {
    const prefix = shipPrefix[Math.floor(Math.random() * shipPrefix.length)];
    const suffix = shipSuffix[Math.floor(Math.random() * shipSuffix.length)];
    return `${prefix} ${suffix}`;
}

/**
 * Generate a ship from a ShipType (or random if not provided)
 * @param {ShipType} shipType - Optional ship type to use
 * @param {boolean} isDamaged - Whether ship should have random hull damage (50% chance if not specified)
 */
export function generateShip(shipType = null, isDamaged = null) {
    // Use random ship type if not provided
    if (!shipType) {
        shipType = SHIP_TYPE_ARRAY[Math.floor(Math.random() * SHIP_TYPE_ARRAY.length)];
    }
    
    // Determine if ship is damaged (50% chance if not explicitly set)
    const shouldBeDamaged = isDamaged !== null ? isDamaged : Math.random() < 0.5;
    
    // Create ship with full stats
    const ship = new Ship(
        generateShipName(),
        shipType.name,
        shipType.hull,
        shipType.shields,
        shipType.fuel,
        shipType.cargo,
        shipType.speed,
        shipType.weapons
    );
    
    // Apply random hull damage if needed
    if (shouldBeDamaged && ship.maxHull > 1) {
        ship.hull = Math.floor(Math.random() * (ship.maxHull - 1)) + 1;
    }
    
    return ship;
}

export function generatePirateShip() {
    const ship = generateShip();
    ship.type = 'Pirate';
    ship.threat = Math.floor(3 + Math.random() * 8);
    return ship;
}

export function generatePoliceShip() {
    const ship = generateShip();
    ship.type = 'Police';
    ship.threat = Math.floor(2 + Math.random() * 4);
    return ship;
}

export function generateMerchantShip() {
    const ship = generateShip();
    ship.type = 'Merchant';
    
    // Add cargo to merchant ships
    const goods = ['food', 'water', 'air'];
    goods.forEach(good => {
        const amount = Math.floor(Math.random() * 50);
        if (amount > 0) {
            ship.addCargo(good, amount);
        }
    });
    
    return ship;
}
