import { showModal, createButton, ce } from '../ui.js';
import { showTitleScreen } from './titleMenu.js';

export function showOptionsModal() {
    const content = ce({
        className: 'menu-content',
        style: { textAlign: 'center', padding: '20px' },
        children: [
            ce({ tag: 'h2', style: { color: '#0bf', marginBottom: '20px' }, text: 'OPTIONS' }),
            ce({ tag: 'p', style: { marginBottom: '30px' }, text: 'Game settings and controls' }),
            createButton({
                text: 'Return to Title Screen',
                action: () => {
                    if (confirm('Return to title screen? Unsaved progress will be lost.')) {
                        showTitleScreen();
                    }
                }
            })
        ]
    });
    
    showModal({
        title: 'Options',
        content,
        buttons: [{ text: 'Close', action: 'close' }]
    });
}
