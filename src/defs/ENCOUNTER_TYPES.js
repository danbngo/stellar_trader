import { SHUTTLE, SCOUT, FIGHTER, FREIGHTER, CORVETTE, DESTROYER, CRUISER } from './SHIP_TYPES.js';

const NPC_ENGAGE_DISTANCE_AU = 0.25;
const NPC_FIRE_RANGE_AU = 0.65;
const NPC_FIRE_FOV_HALF_ANGLE_DEG = 20;
const COMBAT_TICK_MS = 200;

let activeCombatInterval = null;

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

function normalizeAngleDegrees(angle) {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
}

function shortestAngleDeltaDegrees(fromAngle, toAngle) {
    const from = normalizeAngleDegrees(fromAngle);
    const to = normalizeAngleDegrees(toAngle);
    let delta = to - from;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getPlayerTurnRateDegPerSecond(playerShip) {
    const shipSpeed = Math.max(0.5, playerShip.speed || 1);
    return 90 * shipSpeed;
}

function stopActiveCombatEncounter() {
    if (activeCombatInterval) {
        clearInterval(activeCombatInterval);
        activeCombatInterval = null;
    }
}

function getEncounterController() {
    return window.gameState?.encounterController || null;
}

function resolveActiveEncounter() {
    const controller = getEncounterController();
    if (controller && controller.resolveEncounter) {
        controller.resolveEncounter();
    }
}

function setEncounterTransmission(encounterShip, html) {
    encounterShip.transmissionText = html;
    const controller = getEncounterController();
    if (controller && controller.updateTransmission) {
        controller.updateTransmission(html);
    }
}

function startHostileCombat(encounterShip, playerShip) {
    stopActiveCombatEncounter();

    const controller = getEncounterController();
    const combatSkill = window.gameState?.captain?.skills?.combat || 0;

    if (!encounterShip.combatState) {
        const initialDistance = typeof encounterShip.distanceAU === 'number'
            ? encounterShip.distanceAU
            : 0.75;
        encounterShip.combatState = {
            npcX: initialDistance,
            npcY: 0,
            npcHeadingDeg: 180,
            npcFireCooldownSec: 1.0,
            playerX: 0,
            playerY: 0
        };
    }

    const state = encounterShip.combatState;

    const updateDistanceFromState = () => {
        encounterShip.distanceAU = Math.sqrt((state.npcX * state.npcX) + (state.npcY * state.npcY));
    };

    const refreshUi = () => {
        if (controller && controller.refreshEncounter) {
            controller.refreshEncounter();
        }
    };

    const endCombat = (resultHtml) => {
        stopActiveCombatEncounter();
        setEncounterTransmission(encounterShip, resultHtml);
        encounterShip.actions = [
            {
                text: 'Continue Journey',
                handler: () => {
                    resolveActiveEncounter();
                }
            }
        ];
        refreshUi();
    };

    const playerFireHandler = () => {
        const playerDamage = playerShip.getWeaponDamage(combatSkill);
        const survived = encounterShip.damage(playerDamage);

        updateDistanceFromState();

        if (!survived) {
            endCombat(`
                <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ ENEMY DESTROYED</div>
                <div>You hit for ${playerDamage} damage and destroyed the hostile ship.</div>
            `);
            return;
        }

        setEncounterTransmission(encounterShip, `
            <div style="color: #f80; font-weight: bold; margin-bottom: 10px;">⚔️ WEAPONS FIRE EXCHANGED</div>
            <div>You hit for <span style="color:#ff0;">${playerDamage}</span> damage.</div>
            <div>Enemy hull: ${encounterShip.hull.toFixed(0)}/${encounterShip.maxHull}</div>
            <div>Enemy range: ${encounterShip.distanceAU.toFixed(2)} AU</div>
        `);

        refreshUi();
    };

    encounterShip.actions = [
        {
            text: 'Fire Weapons',
            handler: playerFireHandler
        }
    ];

    setEncounterTransmission(encounterShip, `
        <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ COMBAT INITIATED</div>
        <div>Hostile vessel is maneuvering to engagement distance.</div>
    `);
    refreshUi();

    activeCombatInterval = setInterval(() => {
        const dtSec = COMBAT_TICK_MS / 1000;

        const toPlayerX = state.playerX - state.npcX;
        const toPlayerY = state.playerY - state.npcY;
        const distanceToPlayer = Math.sqrt((toPlayerX * toPlayerX) + (toPlayerY * toPlayerY));
        const desiredHeadingDeg = normalizeAngleDegrees(toDegrees(Math.atan2(toPlayerY, toPlayerX)));

        const maxTurnThisTick = getPlayerTurnRateDegPerSecond(playerShip) * dtSec;
        const headingDelta = shortestAngleDeltaDegrees(state.npcHeadingDeg, desiredHeadingDeg);
        const appliedTurn = clamp(headingDelta, -maxTurnThisTick, maxTurnThisTick);
        state.npcHeadingDeg = normalizeAngleDegrees(state.npcHeadingDeg + appliedTurn);

        if (distanceToPlayer > NPC_ENGAGE_DISTANCE_AU) {
            const movementSpeedAuPerSec = Math.max(0.08, (encounterShip.speed || 1) * 0.15);
            const step = movementSpeedAuPerSec * dtSec;
            const headingRad = toRadians(state.npcHeadingDeg);
            state.npcX += Math.cos(headingRad) * step;
            state.npcY += Math.sin(headingRad) * step;
        }

        const newToPlayerX = state.playerX - state.npcX;
        const newToPlayerY = state.playerY - state.npcY;
        const newDistance = Math.sqrt((newToPlayerX * newToPlayerX) + (newToPlayerY * newToPlayerY));
        const newDesiredHeading = normalizeAngleDegrees(toDegrees(Math.atan2(newToPlayerY, newToPlayerX)));
        const fireAngleError = Math.abs(shortestAngleDeltaDegrees(state.npcHeadingDeg, newDesiredHeading));

        state.npcFireCooldownSec -= dtSec;

        const inFov = fireAngleError <= NPC_FIRE_FOV_HALF_ANGLE_DEG;
        const inRange = newDistance <= NPC_FIRE_RANGE_AU;
        const canFireNow = state.npcFireCooldownSec <= 0 && inRange && inFov;

        if (canFireNow) {
            state.npcFireCooldownSec = 1.25;
            const npcDamage = encounterShip.getWeaponDamage(0);
            const playerSurvived = playerShip.damage(npcDamage);

            if (!playerSurvived) {
                updateDistanceFromState();
                endCombat(`
                    <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">☠️ SHIP DESTROYED</div>
                    <div>The hostile ship fired for ${npcDamage} damage and destroyed your vessel.</div>
                `);
                return;
            }

            setEncounterTransmission(encounterShip, `
                <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ ENEMY FIRE</div>
                <div>Enemy scored a hit for <span style="color:#ff0;">${npcDamage}</span> damage.</div>
                <div>Enemy heading error: ${fireAngleError.toFixed(1)}°</div>
                <div>Enemy range: ${newDistance.toFixed(2)} AU</div>
            `);
        }

        updateDistanceFromState();
        refreshUi();
    }, COMBAT_TICK_MS);
}

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
        `;
        
        return {
            transmissionText,
            actions: [
                {
                    text: `Pay Bribe (${bribeAmount} cr)`,
                    handler: () => {
                        if (window.gameState.captain.credits >= bribeAmount) {
                            window.gameState.addCredits(-bribeAmount);
                            setEncounterTransmission(encounterShip, `
                                <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ BRIBE ACCEPTED</div>
                                <div>"Pleasure doing business with you. Move along."</div>
                            `);
                            // Auto-resolve after accepting bribe
                            setTimeout(() => {
                                resolveActiveEncounter();
                            }, 2000);
                        } else {
                            setEncounterTransmission(encounterShip, `
                                <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CREDITS</div>
                                <div>"You don't have enough credits! Prepare to die!"</div>
                            `);
                        }
                    }
                },
                {
                    text: 'Refuse and Fight',
                    handler: () => {
                        startHostileCombat(encounterShip, playerShip);
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
                                setEncounterTransmission(encounterShip, `
                                    <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ TRADE COMPLETE</div>
                                    <div>"Pleasure doing business! Safe travels, friend."</div>
                                    <div style="margin-top: 10px; color: #0f0;">Acquired ${quantity} units of ${tradeGood}</div>
                                `);
                            } else {
                                setEncounterTransmission(encounterShip, `
                                    <div style="color: #f80; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CARGO SPACE</div>
                                    <div>"Looks like you don't have room for that. Maybe next time!"</div>
                                `);
                            }
                        } else {
                            setEncounterTransmission(encounterShip, `
                                <div style="color: #f44; font-weight: bold; margin-bottom: 10px;">⚠️ INSUFFICIENT CREDITS</div>
                                <div>"You don't have enough credits. Come back when you have the funds!"</div>
                            `);
                        }
                    }
                },
                {
                    text: 'Decline Trade',
                    handler: () => {
                        setEncounterTransmission(encounterShip, `
                            <div style="color: #888; font-weight: bold; margin-bottom: 10px;">TRADE DECLINED</div>
                            <div>"No problem. Safe travels!"</div>
                        `);
                    }
                },
                {
                    text: 'Ignore and Continue',
                    handler: () => {
                        resolveActiveEncounter();
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
        `;
        
        return {
            transmissionText,
            actions: [
                {
                    text: 'Allow Inspection',
                    handler: () => {
                        // Check for contraband (for future implementation)
                        setEncounterTransmission(encounterShip, `
                            <div style="color: #0f0; font-weight: bold; margin-bottom: 10px;">✓ INSPECTION COMPLETE</div>
                            <div>"Everything checks out. You're clear to proceed. Safe travels."</div>
                        `);
                        // Auto-resolve after inspection
                        setTimeout(() => {
                            resolveActiveEncounter();
                        }, 2000);
                    }
                },
                {
                    text: 'Refuse Inspection',
                    handler: () => {
                        startHostileCombat(encounterShip, playerShip);
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
