export class CargoType {
    constructor(name, baseValue) {
        this.name = name;
        this.baseValue = baseValue;
    }
}

export const AIR = new CargoType('air', 5);
export const WATER = new CargoType('water', 10);
export const FOOD = new CargoType('food', 20);

export const CARGO_TYPES = {
    air: AIR,
    water: WATER,
    food: FOOD
};
