import { SHUTTLE, SCOUT, FIGHTER, FREIGHTER, CORVETTE, DESTROYER, CRUISER, BATTLESHIP } from './SHIP_TYPES.js';

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
        
        const transmissionText = `
            <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ PIRATE TRANSMISSION</div>
            <div style="margin-bottom: 10px;">"Hand over <span style="color: #ff0;">${bribeAmount} credits</span> or prepare to be boarded!"</div>
            <div style="font-size: 0.9em; color: #888;">
                Pirate Ship: ${encounterShip.name}<br>
                Weapons: ${encounterShip.weapons}<br>
                Hull: ${encounterShip.hull}/${encounterShip.maxHull}
            </div>
        `;
        
        return {
            transmissionText,
            actions: [
                {
                    text: `Pay Bribe (${bribeAmount} cr)`,
                    handler: () => {
                        if (window.gameState.captain.credits >= bribeAmount) {
                            window.gameState.addCredits(-bribeAmount);
                            encounterShip.transmissionText = `
                                <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ BRIBE ACCEPTED</div>
                                <div>"Pleasure doing business with you. Move along."</div>
                            `;
                            // Auto-resolve after accepting bribe
                            setTimeout(() => {
                                const menu = window.travelEncounterMenuInstance;
                                if (menu && menu.resolveEncounter) {
                                    menu.resolveEncounter();
                                }
                            }, 2000);
                        } else {
                            encounterShip.transmissionText = `
                                <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CREDITS</div>
                                <div>"You don't have enough credits! Prepare to die!"</div>
                            `;
                        }
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                    }
                },
                {
                    text: 'Refuse and Fight',
                    handler: () => {
                        encounterShip.transmissionText = `
                            <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ COMBAT INITIATED</div>
                            <div>"Your funeral! All weapons, FIRE!"</div>
                        `;
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                        // TODO: Implement combat system
                    }
                }
            ]
        };
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
        
        const transmissionText = `
            <div style="color: #0bf; font-weight: bold; margin-bottom: 10px;">📡 MERCHANT TRANSMISSION</div>
            <div style="margin-bottom: 10px;">"Greetings, traveler! I'm carrying some ${tradeGood}. Would you like to buy <span style="color: #0f0;">${quantity} units</span> for <span style="color: #ff0;">${totalPrice} credits</span>?"</div>
            <div style="font-size: 0.9em; color: #888;">
                Price per unit: ${pricePerUnit} cr<br>
                Your cargo space: ${playerShip.getTotalCargo()}/${playerShip.maxCargo}
            </div>
        `;
        
        return {
            transmissionText,
            actions: [
                {
                    text: `Buy ${quantity} ${tradeGood} (${totalPrice} cr)`,
                    handler: () => {
                        if (window.gameState.captain.credits >= totalPrice) {
                            if (playerShip.addCargo(tradeGood, quantity)) {
                                window.gameState.addCredits(-totalPrice);
                                encounterShip.transmissionText = `
                                    <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ TRADE COMPLETE</div>
                                    <div>"Pleasure doing business! Safe travels, friend."</div>
                                    <div style="margin-top: 10px; color: #0f0;">Acquired ${quantity} units of ${tradeGood}</div>
                                `;
                            } else {
                                encounterShip.transmissionText = `
                                    <div style="color: #f80; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CARGO SPACE</div>
                                    <div>"Looks like you don't have room for that. Maybe next time!"</div>
                                `;
                            }
                        } else {
                            encounterShip.transmissionText = `
                                <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CREDITS</div>
                                <div>"You don't have enough credits. Come back when you have the funds!"</div>
                            `;
                        }
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                    }
                },
                {
                    text: 'Decline Trade',
                    handler: () => {
                        encounterShip.transmissionText = `
                            <div style="color: #888; font-weight: bold; margin-bottom: 10px;">TRADE DECLINED</div>
                            <div>"No problem. Safe travels!"</div>
                        `;
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                    }
                },
                {
                    text: 'Ignore and Continue',
                    handler: () => {
                        const menu = window.travelEncounterMenuInstance;
                        if (menu && menu.resolveEncounter) {
                            menu.resolveEncounter();
                        }
                    }
                }
            ]
        };
    }
);

// Police Encounter - law enforcement that may inspect cargo
export const POLICE_ENCOUNTER = new EncounterType(
    'Police',
    'System security patrol detected',
    [SCOUT, CORVETTE, CRUISER],
    (encounterShip, playerShip) => {
        const transmissionText = `
            <div style="color: #09f; font-weight: bold; margin-bottom: 10px;">🚨 POLICE TRANSMISSION</div>
            <div style="margin-bottom: 10px;">"This is system security. We're conducting routine inspections. Prepare to be boarded for a cargo scan."</div>
            <div style="font-size: 0.9em; color: #888;">
                Police Ship: ${encounterShip.name}<br>
                Weapons: ${encounterShip.weapons}<br>
                ⚠️ Refusing inspection will be considered hostile.
            </div>
        `;
        
        return {
            transmissionText,
            actions: [
                {
                    text: 'Allow Inspection',
                    handler: () => {
                        // Check for contraband (for future implementation)
                        encounterShip.transmissionText = `
                            <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ INSPECTION COMPLETE</div>
                            <div>"Everything checks out. You're clear to proceed. Safe travels."</div>
                        `;
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                        // Auto-resolve after inspection
                        setTimeout(() => {
                            const menu = window.travelEncounterMenuInstance;
                            if (menu && menu.resolveEncounter) {
                                menu.resolveEncounter();
                            }
                        }, 2000);
                    }
                },
                {
                    text: 'Refuse Inspection',
                    handler: () => {
                        encounterShip.transmissionText = `
                            <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ HOSTILE ACTION DETECTED</div>
                            <div>"All units, engage target! Weapons hot!"</div>
                        `;
                        // Update the transmission display
                        const transmissionDiv = document.getElementById('encounter-transmission');
                        if (transmissionDiv && encounterShip.transmissionText) {
                            transmissionDiv.innerHTML = encounterShip.transmissionText;
                        }
                        // TODO: Implement combat system
                    }
                }
            ]
        };
    }
);

export const ENCOUNTER_TYPES = {
    pirate: PIRATE_ENCOUNTER,
    merchant: MERCHANT_ENCOUNTER,
    police: POLICE_ENCOUNTER
};
