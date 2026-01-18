import { showMenu } from '../ui.js';
import { GameState } from '../classes/GameState.js';
import { showMainMenu } from './mainMenu.js';

export function showTitleScreen() {
    showMenu({
        title: 'STELLAR TRADER',
        content: `
            <p>Welcome to the vast expanse of space.</p>
            <p>Trade goods, explore systems, and build your fortune among the stars.</p>
        `,
        buttons: [
            {
                text: 'New Game',
                action: () => startNewGame()
            },
            {
                text: 'Load Game',
                action: () => {
                    showMenu({
                        title: 'LOAD GAME',
                        content: '<p>Save system not yet implemented.</p>',
                        buttons: [
                            { text: 'Back', action: () => showTitleScreen() }
                        ]
                    });
                }
            },
            {
                text: 'Credits',
                action: () => showCredits()
            }
        ]
    });
}

function showCredits() {
    showMenu({
        title: 'CREDITS',
        content: `
            <p>STELLAR TRADER</p>
            <p>A space trading adventure</p>
            <br>
            <p>Version 1.0</p>
        `,
        buttons: [
            { text: 'Back', action: () => showTitleScreen() }
        ]
    });
}

function startNewGame() {
    window.gameState = new GameState();
    
    showMenu({
        title: 'NEW GAME',
        content: `
            <p>Enter your name, Captain:</p>
            <input type="text" id="captain-name-input" value="Captain Nova" 
                   style="width: 100%; padding: 8px; margin: 10px 0; background: #001; 
                   border: 1px solid #09f; color: #09f; font-family: 'Courier New', monospace;">
        `,
        buttons: [
            {
                text: 'Begin Journey',
                action: () => {
                    const nameInput = document.getElementById('captain-name-input');
                    if (nameInput && nameInput.value.trim()) {
                        window.gameState.captain.name = nameInput.value.trim();
                    }
                    showMainMenu();
                }
            },
            {
                text: 'Back',
                action: () => showTitleScreen()
            }
        ]
    });
    
    setTimeout(() => {
        const input = document.getElementById('captain-name-input');
        if (input) input.focus();
    }, 0);
}
