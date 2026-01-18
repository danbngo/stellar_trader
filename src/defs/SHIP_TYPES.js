export class ShipType {
    constructor(name, hull, shields, fuel, cargo, speed, weapons) {
        this.name = name;
        this.hull = hull;
        this.shields = shields;
        this.fuel = fuel;
        this.cargo = cargo;
        this.speed = speed;
        this.weapons = weapons;
    }
}

// Define ship types with balanced stats
export const SHUTTLE = new ShipType('Shuttle', 40, 20, 80, 20, 1.5, 1);
export const SCOUT = new ShipType('Scout', 60, 40, 120, 25, 2.0, 2);
export const FIGHTER = new ShipType('Fighter', 80, 60, 100, 15, 2.5, 6);
export const FREIGHTER = new ShipType('Freighter', 100, 40, 90, 80, 1.0, 2);
export const CORVETTE = new ShipType('Corvette', 120, 80, 110, 30, 1.8, 5);
export const DESTROYER = new ShipType('Destroyer', 150, 100, 120, 35, 1.5, 8);
export const CRUISER = new ShipType('Cruiser', 180, 120, 130, 40, 1.3, 10);
export const BATTLESHIP = new ShipType('Battleship', 250, 150, 140, 45, 1.0, 15);

export const SHIP_TYPES = {
    shuttle: SHUTTLE,
    scout: SCOUT,
    fighter: FIGHTER,
    freighter: FREIGHTER,
    corvette: CORVETTE,
    destroyer: DESTROYER,
    cruiser: CRUISER,
    battleship: BATTLESHIP
};

export const SHIP_TYPE_ARRAY = [
    SHUTTLE,
    SCOUT,
    FIGHTER,
    FREIGHTER,
    CORVETTE,
    DESTROYER,
    CRUISER,
    BATTLESHIP
];
