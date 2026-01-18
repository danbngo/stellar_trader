import { SHUTTLE, SCOUT, FIGHTER, FREIGHTER, CORVETTE, DESTROYER, CRUISER, BATTLESHIP } from './SHIP_TYPES.js';
import { showModal } from '../ui.js';

export class EncounterType {
    constructor(name, description, shipTypes, onGreet) {
        this.name = name;
        this.description = description;
        this.shipTypes = shipTypes;
        this.onGreet = onGreet;
    }
}

// Pirate Encounter - aggressive ships that demand bribes
export const PIRATE_ENCOUNTER = new EncounterType(
    'Pirate',
    'Hostile pirate vessel detected',
    [FIGHTER, CORVETTE, DESTROYER],
    (encounterShip, playerShip) => {
        const bribeAmount = Math.floor(encounterShip.weapons * 200 + Math.random() * 500);
        
        showModal({
            title: 'Pirate Transmission',
            message: `<p style="color: #f44;">⚠️ This is a pirate vessel!</p>
                     <p>"Hand over <span style="color: #ff0;">${bribeAmount} credits</span> or prepare to be boarded!"</p>
                     <p style="font-size: 0.9em; color: #888; margin-top: 1rem;">
                        Pirate Ship: ${encounterShip.name}<br>
                        Weapons: ${encounterShip.weapons}<br>
                        Hull: ${encounterShip.hull}/${encounterShip.maxHull}
                     </p>`,
            buttons: [
                {
                    text: `Pay Bribe (${bribeAmount} cr)`,
                    action: () => {
                        if (window.gameState.captain.credits >= bribeAmount) {
                            window.gameState.addCredits(-bribeAmount);
                            showModal({
                                title: 'Bribe Accepted',
                                message: `<p style="color: #0f0;">The pirates accept your payment and move on.</p>`,
                                buttons: [{ text: 'Continue', action: () => {} }]
                            });
                        } else {
                            showModal({
                                title: 'Insufficient Credits',
                                message: `<p style="color: #f44;">You don't have enough credits! The pirates prepare to attack!</p>`,
                                buttons: [{ text: 'Prepare for Combat', action: () => {} }]
                            });
                        }
                    }
                },
                {
                    text: 'Refuse and Fight',
                    action: () => {
                        showModal({
                            title: 'Combat Initiated',
                            message: `<p style="color: #f44;">The pirates open fire!</p>`,
                            buttons: [{ text: 'Defend Yourself', action: () => {} }]
                        });
                    }
                }
            ]
        });
    }
);

// Merchant Encounter - trading ships that offer deals
export const MERCHANT_ENCOUNTER = new EncounterType(
    'Merchant',
    'Friendly merchant vessel detected',
    [SHUTTLE, FREIGHTER],
    (encounterShip, playerShip) => {
        const goods = ['food', 'water', 'air'];
        const tradeGood = goods[Math.floor(Math.random() * goods.length)];
        const quantity = Math.floor(10 + Math.random() * 30);
        const pricePerUnit = Math.floor(50 + Math.random() * 100);
        const totalPrice = quantity * pricePerUnit;
        
        showModal({
            title: 'Merchant Transmission',
            message: `<p style="color: #0bf;">📡 Greetings, traveler!</p>
                     <p>"I'm carrying some ${tradeGood}. Would you like to buy <span style="color: #0f0;">${quantity} units</span> for <span style="color: #ff0;">${totalPrice} credits</span>?"</p>
                     <p style="font-size: 0.9em; color: #888; margin-top: 1rem;">
                        Price per unit: ${pricePerUnit} cr<br>
                        Your cargo space: ${playerShip.getTotalCargo()}/${playerShip.maxCargo}
                     </p>`,
            buttons: [
                {
                    text: `Buy (${totalPrice} cr)`,
                    action: () => {
                        if (window.gameState.captain.credits >= totalPrice) {
                            if (playerShip.addCargo(tradeGood, quantity)) {
                                window.gameState.addCredits(-totalPrice);
                                showModal({
                                    title: 'Trade Complete',
                                    message: `<p style="color: #0f0;">You purchased ${quantity} units of ${tradeGood}.</p>`,
                                    buttons: [{ text: 'Continue', action: () => {} }]
                                });
                            } else {
                                showModal({
                                    title: 'Insufficient Cargo Space',
                                    message: `<p style="color: #f80;">You don't have enough cargo space!</p>`,
                                    buttons: [{ text: 'Decline', action: () => {} }]
                                });
                            }
                        } else {
                            showModal({
                                title: 'Insufficient Credits',
                                message: `<p style="color: #f44;">You don't have enough credits!</p>`,
                                buttons: [{ text: 'Decline', action: () => {} }]
                            });
                        }
                    }
                },
                {
                    text: 'Decline Trade',
                    action: () => {
                        showModal({
                            title: 'Trade Declined',
                            message: `<p style="color: #888;">The merchant nods and continues on their way.</p>`,
                            buttons: [{ text: 'Continue', action: () => {} }]
                        });
                    }
                }
            ]
        });
    }
);

// Police Encounter - law enforcement that may inspect cargo
export const POLICE_ENCOUNTER = new EncounterType(
    'Police',
    'System security patrol detected',
    [SCOUT, CORVETTE, CRUISER],
    (encounterShip, playerShip) => {
        showModal({
            title: 'Police Transmission',
            message: `<p style="color: #09f;">🚨 This is system security.</p>
                     <p>"We're conducting routine inspections. Prepare to be boarded for a cargo scan."</p>
                     <p style="font-size: 0.9em; color: #888; margin-top: 1rem;">
                        Police Ship: ${encounterShip.name}<br>
                        Weapons: ${encounterShip.weapons}<br>
                        Refusing inspection will be considered hostile.
                     </p>`,
            buttons: [
                {
                    text: 'Allow Inspection',
                    action: () => {
                        // Check for contraband (for future implementation)
                        showModal({
                            title: 'Inspection Complete',
                            message: `<p style="color: #0f0;">The police scan your cargo and find everything in order.</p>
                                     <p>"You're clear to proceed. Safe travels."</p>`,
                            buttons: [{ text: 'Continue', action: () => {} }]
                        });
                    }
                },
                {
                    text: 'Refuse Inspection',
                    action: () => {
                        showModal({
                            title: 'Hostile Action Detected',
                            message: `<p style="color: #f44;">⚠️ The police interpret your refusal as hostile!</p>
                                     <p>"All units, engage target!"</p>`,
                            buttons: [{ text: 'Prepare for Combat', action: () => {} }]
                        });
                    }
                }
            ]
        });
    }
);

export const ENCOUNTER_TYPES = {
    pirate: PIRATE_ENCOUNTER,
    merchant: MERCHANT_ENCOUNTER,
    police: POLICE_ENCOUNTER
};
