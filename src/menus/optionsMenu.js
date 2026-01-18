import { Menu, createButton, ce } from '../ui.js';
import { showTitleScreen } from './titleMenu.js';

export function showOptionsMenu() {
    const menu = new Menu({
        tabs: [
            {
                label: 'Exit',
                content: getOptionsContent(),
                onActivate: renderOptionsButtons
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getOptionsContent() {
    return ''
}

function renderOptionsButtons() {
    const buttonContainer = window.currentMenu?.getButtonContainer();
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = '';
    
    buttonContainer.appendChild(createButton({
        text: 'Return to Title Screen',
        action: () => {
            if (confirm('Return to title screen? Unsaved progress will be lost.')) {
                showTitleScreen();
            }
        }
    }));
}
