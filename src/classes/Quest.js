export class Quest {
    constructor(params = {}) {
        this.id = params.id || Date.now();
        this.title = params.title || 'Unnamed Quest';
        this.description = params.description || '';
        this.cargoAmounts = params.cargoAmounts || {}; // { food: 10, water: 10, air: 10 }
        this.cargoDonated = {}; // Track how much has been donated { food: 5, water: 3, ... }
        this.expirationDate = params.expirationDate || null; // Date object
        this.isFulfilled = false;
        this.expReward = params.expReward || 0;
        this.creditsReward = params.creditsReward || 0;
        
        // Initialize cargoDonated to 0 for all required cargo types
        for (const cargoType of Object.keys(this.cargoAmounts)) {
            this.cargoDonated[cargoType] = 0;
        }
    }
    
    /**
     * Donate cargo toward quest completion
     * @param {string} cargoType - Type of cargo (food, water, air)
     * @param {number} amount - Amount to donate
     * @returns {boolean} - True if donation was successful
     */
    donateCargo(cargoType, amount) {
        if (!this.cargoAmounts[cargoType]) return false;
        if (this.isFulfilled) return false;
        
        const remaining = this.cargoAmounts[cargoType] - (this.cargoDonated[cargoType] || 0);
        const actualDonation = Math.min(amount, remaining);
        
        if (actualDonation > 0) {
            this.cargoDonated[cargoType] = (this.cargoDonated[cargoType] || 0) + actualDonation;
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if the quest is fulfilled based on donated cargo
     * @returns {boolean} - True if quest requirements are met
     */
    checkFulfilled() {
        if (this.isFulfilled) return false; // Already fulfilled
        
        // Check if all required cargo amounts have been donated
        for (const [cargoType, requiredAmount] of Object.entries(this.cargoAmounts)) {
            const donatedAmount = this.cargoDonated[cargoType] || 0;
            if (donatedAmount < requiredAmount) {
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
