export class Officer {
    constructor(name) {
        this.name = name;
        this.credits = 1000;
        this.reputation = 0;
        this.daysTraveled = 0;
        this.systemsVisited = 0;
        this.piratesDestroyed = 0;
    }
    
    addCredits(amount) {
        this.credits += amount;
    }
    
    spendCredits(amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            return true;
        }
        return false;
    }
}
