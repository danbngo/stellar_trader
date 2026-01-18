# Stellar Trader - Modular Code Structure

## Overview
The game has been refactored from a single 1985-line `main.js` file into a clean, organized modular structure using ES6 modules.

## File Structure

```
stellar trader/
├── index.html                          # Entry HTML with module script tag
├── index.css                          # Blue theme styles  
├── main.js                            # Entry point (imports titleMenu)
├── main.js.backup                     # Original monolithic file (backup)
└── src/
    ├── utils.js                       # Core utilities (ce, calculateDistance, closeModal)
    ├── ui.js                          # UI components (showMenu, showModal, createTabs, etc.)
    ├── classes/
    │   ├── StarSystem.js             # Star system entity with markets and threat levels
    │   └── GameState.js              # Game state management (ship, captain, cargo)
    ├── generators/
    │   ├── nameGenerators.js         # System name generation
    │   ├── shipGenerators.js         # NPC ship generation (pirates, police, merchants)
    │   └── systemGenerators.js       # Galaxy generation
    └── menus/
        ├── titleMenu.js              # Title screen, credits, new game
        ├── mainMenu.js               # Main game menu with tabs
        ├── travelMenu.js             # Travel map and navigation
        ├── travelEncounterMenu.js    # Travel encounters (split into outer functions)
        ├── shipyardMenu.js           # Shipyard services and ship management
        ├── marketMenu.js             # Commodity trading
        ├── computerMenu.js           # Ship computer information
        └── optionsMenu.js            # Game options and settings
```

## Key Changes

### Modular Architecture
- **ES6 Modules**: All files use `import`/`export` for clean dependency management
- **Separation of Concerns**: Code organized by functionality (UI, classes, generators, menus)
- **No Circular Dependencies**: Import structure designed to avoid circular references

### Travel Encounter System Refactoring
The large `showTravelEncounterMenu` function (~450 lines with many nested inner functions) has been split into **multiple outer functions** in `travelEncounterMenu.js`:

**Outer Functions:**
- `showTravelEncounterMenu()` - Entry point
- `renderTravelScreen()` - Main screen renderer
- `getJourneyContent()` - Journey tab content generator
- `getEncounterContent()` - Encounter tab content generator
- `createProgressBar()` - ASCII progress bar generator
- `updateProgressBar()` - Progress bar updater
- `renderJourneyContent()` - Journey display renderer
- `renderEncounterContent()` - Encounter display renderer
- `renderJourneyButtons()` - Journey button renderer
- `renderEncounterButtons()` - Encounter button renderer
- `pauseJourney()` - Pause handler
- `resumeJourney()` - Resume handler
- `resolveEncounter()` - Encounter resolver
- `startTravelInterval()` - Travel timer manager
- `triggerEncounter()` - Encounter trigger
- `completeJourney()` - Journey completion handler

### Module Responsibilities

**utils.js**
- `ce()` - Element creation helper
- `calculateDistance()` - Distance calculation between systems
- `closeModal()` - Modal dialog closer

**ui.js**
- `showMenu()` - Main menu display
- `showModal()` - Modal dialog display
- `createTabs()` - Tab interface creator
- `createButton()` - Button with tooltip creator
- `createDataTable()` - Data table with selection
- `createTwoColumnLayout()` - Two-column layout creator
- `createTopButtons()` - Top corner buttons (computer `[C]`, options)

**Classes**
- `StarSystem` - System with x, y, name, markets, threat levels
- `GameState` - Captain, ship, systems, cargo management

**Generators**
- `generateStarSystemName()` - Random system names
- `generatePirateShip()` - Pirate ship generation
- `generatePoliceShip()` - Police ship generation
- `generateMerchantShip()` - Merchant ship generation
- `generateStarSystems()` - Galaxy generation

**Menus**
- Each menu file exports content generators and renderers
- Import dependencies from other modules as needed
- Use shared UI components from `ui.js`

## Module Loading
- `index.html` uses `<script type="module" src="main.js"></script>`
- Modules load automatically via import tree
- No bundler required (native ES6 modules)

## Benefits
✓ **Maintainability** - Easy to find and modify specific features
✓ **Readability** - Clear file organization and smaller files
✓ **Testability** - Individual functions can be tested in isolation
✓ **Reusability** - Shared utilities and UI components
✓ **Debugging** - Stack traces show specific files/functions
✓ **Scalability** - Easy to add new menus/features/generators

## ASCII Features
- Computer icon: `[C]` (text-based, not emoji)
- Progress bar: `[====>........]` format
- Retro terminal aesthetic throughout

## Color Theme
- Primary: `#09f` (blue)
- Accent: `#0bf` (bright blue)
- Complete theme change from green to blue
