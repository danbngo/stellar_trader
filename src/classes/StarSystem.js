export class StarSystem {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.marketPrices = this.generateMarketPrices();
        this.cargo = this.generateCargo();
        this.piracyLevel = Math.floor(Math.random() * 10) + 1; // 1-10
        this.policeLevel = Math.floor(Math.random() * 10) + 1; // 1-10
        this.merchantsLevel = Math.floor(Math.random() * 10) + 1; // 1-10
    }
    
    generateMarketPrices() {
        return {
            food: Math.floor(50 + Math.random() * 50),
            water: Math.floor(30 + Math.random() * 40),
            air: Math.floor(20 + Math.random() * 30)
        };
    }
    
    generateCargo() {
        return {
            food: Math.floor(Math.random() * 100) + 20,
            water: Math.floor(Math.random() * 100) + 20,
            air: Math.floor(Math.random() * 100) + 20
        };
    }
}
