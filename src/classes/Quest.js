export class Quest {
    constructor(params = {}) {
        this.id = params.id || Date.now();
        this.title = params.title || 'Unnamed Quest';
        this.description = params.description || '';
        this.cargoAmounts = params.cargoAmounts || {}; // { food: 10, water: 10, air: 10 }
        this.expirationDate = params.expirationDate || null; // Date object
        this.isFulfilled = false;
        this.expReward = params.expReward || 0;
    }
    
    /**
     * Check if the quest is fulfilled based on current cargo
     * @param {Object} currentCargo - Current cargo in ship { food: 5, water: 10, ... }
     * @returns {boolean} - True if quest requirements are met
     */
    checkFulfilled(currentCargo) {
        if (this.isFulfilled) return false; // Already fulfilled
        
        // Check if all required cargo amounts are met
        for (const [cargoType, requiredAmount] of Object.entries(this.cargoAmounts)) {
            const currentAmount = currentCargo[cargoType] || 0;
            if (currentAmount < requiredAmount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if the quest has failed due to expiration
     * @param {Date} currentDate - Current game date
     * @returns {boolean} - True if quest has expired
     */
    checkFailed(currentDate) {
        if (this.isFulfilled) return false; // Already fulfilled, can't fail
        if (!this.expirationDate) return false; // No expiration date
        
        return currentDate > this.expirationDate;
    }
    
    /**
     * Mark quest as fulfilled
     */
    fulfill() {
        this.isFulfilled = true;
    }
}
