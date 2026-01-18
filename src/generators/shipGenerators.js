const shipPrefix = ['Dark', 'Swift', 'Red', 'Black', 'Steel', 'Iron', 'Golden', 'Silver', 'Shadow', 'Night'];
const shipSuffix = ['Falcon', 'Hawk', 'Eagle', 'Raven', 'Wolf', 'Tiger', 'Dragon', 'Viper', 'Cobra', 'Phoenix'];

function generateShipName() {
    const prefix = shipPrefix[Math.floor(Math.random() * shipPrefix.length)];
    const suffix = shipSuffix[Math.floor(Math.random() * shipSuffix.length)];
    return `${prefix} ${suffix}`;
}

export function generatePirateShip() {
    return {
        name: generateShipName(),
        type: 'Pirate',
        hull: Math.floor(40 + Math.random() * 60),
        maxHull: 100,
        weapons: Math.floor(3 + Math.random() * 5),
        threat: Math.floor(3 + Math.random() * 8)
    };
}

export function generatePoliceShip() {
    return {
        name: generateShipName(),
        type: 'Police',
        hull: Math.floor(60 + Math.random() * 40),
        maxHull: 100,
        weapons: Math.floor(5 + Math.random() * 5),
        threat: Math.floor(2 + Math.random() * 4)
    };
}

export function generateMerchantShip() {
    const goods = ['food', 'water', 'air'];
    const cargo = {};
    goods.forEach(good => {
        cargo[good] = Math.floor(Math.random() * 50);
    });
    
    return {
        name: generateShipName(),
        type: 'Merchant',
        hull: Math.floor(30 + Math.random() * 50),
        maxHull: 100,
        cargo: cargo,
        value: Math.floor(2000 + Math.random() * 5000)
    };
}
