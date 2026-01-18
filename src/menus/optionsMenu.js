import { Menu, createButton, ce } from '../ui.js';
import { showTitleScreen } from './titleMenu.js';

export function showOptionsMenu() {
    const menu = new Menu({
        tabs: [
            {
                label: 'Game Options',
                content: getOptionsContent(),
                onActivate: renderOptionsButtons
            }
        ]
    });
    
    menu.render();
    window.currentMenu = menu;
}

function getOptionsContent() {
    return ce({
        className: 'stats-group',
        style: { textAlign: 'center', padding: '1.25rem' },
        children: [
            ce({
                tag: 'p',
                text: 'Game Options',
                style: { marginBottom: '1rem' }
            })
        ]
    }).outerHTML;
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
