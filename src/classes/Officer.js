import { MAX_SKILL_LEVEL } from '../defs/SKILLS.js';

export class Officer {
    constructor(name) {
        this.name = name;
        this.credits = 1000;
        this.reputation = 0;
        this.daysTraveled = 0;
        this.systemsVisited = 0;
        this.piratesDestroyed = 0;
        
        // Experience and leveling
        this.level = 1;
        this.experience = 0;
        this.skillPoints = 0;
        
        // Skills (0-10)
        this.skills = {
            piloting: 0,
            combat: 0,
            engineering: 0,
            barter: 0
        };
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
    
    grantExperience(amount) {
        this.experience += amount;
        const expNeeded = this.level * 100; // 100 exp per level
        
        if (this.experience >= expNeeded) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience = 0;
        this.skillPoints += 3;
    }
    
    increaseSkill(skillName) {
        if (this.skillPoints > 0 && this.skills[skillName] < MAX_SKILL_LEVEL) {
            this.skills[skillName]++;
            this.skillPoints--;
            return true;
        }
        return false;
    }
}
