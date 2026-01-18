import { showMenu } from '../ui.js';
import { GameState } from '../classes/GameState.js';

export function showTitleScreen(showMainMenu) {
    showMenu({
        title: 'STELLAR TRADER',
        content: `
            <p>Welcome to the vast expanse of space.</p>
            <p>Trade goods, explore systems, and build your fortune among the stars.</p>
        `,
        buttons: [
            {
                text: 'New Game',
                action: () => startNewGame(showMainMenu)
            },
            {
                text: 'Load Game',
                action: () => {
                    showMenu({
                        title: 'LOAD GAME',
                        content: '<p>Save system not yet implemented.</p>',
                        buttons: [
                            { text: 'Back', action: () => showTitleScreen(showMainMenu) }
                        ]
                    });
                }
            },
            {
                text: 'Credits',
                action: () => showCredits(showMainMenu)
            }
        ]
    });
}

function showCredits(showMainMenu) {
    showMenu({
        title: 'CREDITS',
        content: `
            <p>STELLAR TRADER</p>
            <p>A space trading adventure</p>
            <br>
            <p>Version 1.0</p>
        `,
        buttons: [
            { text: 'Back', action: () => showTitleScreen(showMainMenu) }
        ]
    });
}

function startNewGame(showMainMenu) {
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
                action: () => showTitleScreen(showMainMenu)
            }
        ]
    });
    
    setTimeout(() => {
        const input = document.getElementById('captain-name-input');
        if (input) input.focus();
    }, 0);
}
