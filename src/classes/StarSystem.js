export class StarSystem {
    constructor(name, x, y, marketPrices, cargo, piracyLevel, policeLevel, merchantsLevel, fees) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.neighborSystems = [];
        this.fees = fees;
        this.marketPrices = marketPrices;
        this.cargo = cargo;
        this.piracyLevel = piracyLevel;
        this.policeLevel = policeLevel;
        this.merchantsLevel = merchantsLevel;
    }
}
