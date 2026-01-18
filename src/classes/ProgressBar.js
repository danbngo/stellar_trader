import { ce } from '../ui.js';

/**
 * ProgressBar class for creating ASCII-style progress indicators
 */
export class ProgressBar {
    /**
     * @param {number} width - Width of the progress bar in characters
     * @param {number} ratio - Progress ratio (0.0 to 1.0)
     */
    constructor(width = 40, ratio = 0) {
        this.width = width;
        this.ratio = Math.max(0, Math.min(1, ratio)); // Clamp between 0 and 1
        this.root = this.createBar();
    }
    
    /**
     * Create the progress bar element
     * @returns {HTMLElement} The progress bar element
     */
    createBar() {
        const progressPercent = this.ratio;
        const filledWidth = Math.floor(progressPercent * this.width);
        const emptyWidth = this.width - filledWidth;
        const barText = '[' + 
                       '='.repeat(filledWidth) + 
                       '>'.repeat(Math.min(1, emptyWidth)) + 
                       '.'.repeat(Math.max(0, emptyWidth - 1)) + 
                       ']';
        
        return ce({
            tag: 'div',
            style: { 
                fontFamily: 'monospace', 
                fontSize: '14px', 
                color: '#09f', 
                textAlign: 'center', 
                letterSpacing: '1px' 
            },
            text: barText
        });
    }
    
    /**
     * Update the progress bar with a new ratio
     * @param {number} ratio - New progress ratio (0.0 to 1.0)
     */
    update(ratio) {
        this.ratio = Math.max(0, Math.min(1, ratio));
        const progressPercent = this.ratio;
        const filledWidth = Math.floor(progressPercent * this.width);
        const emptyWidth = this.width - filledWidth;
        const barText = '[' + 
                       '='.repeat(filledWidth) + 
                       '>'.repeat(Math.min(1, emptyWidth)) + 
                       '.'.repeat(Math.max(0, emptyWidth - 1)) + 
                       ']';
        
        this.root.textContent = barText;
    }
    
    /**
     * Get the progress bar text (useful for inline display)
     * @returns {string} The ASCII progress bar string
     */
    getText() {
        const progressPercent = this.ratio;
        const filledWidth = Math.floor(progressPercent * this.width);
        const emptyWidth = this.width - filledWidth;
        return '[' + 
               '='.repeat(filledWidth) + 
               '>'.repeat(Math.min(1, emptyWidth)) + 
               '.'.repeat(Math.max(0, emptyWidth - 1)) + 
               ']';
    }
}
