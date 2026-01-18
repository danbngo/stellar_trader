# Module Dependency Graph

```
main.js (entry point)
  │
  └─> titleMenu.js
        ├─> ui.js ──────────────┐
        │     ├─> utils.js      │
        │     └─> (DOM)         │
        │                       │
        └─> GameState.js        │
              └─> systemGenerators.js
                    ├─> StarSystem.js
                    └─> nameGenerators.js

When user starts game:
  │
  └─> mainMenu.js
        ├─> ui.js (shared)
        │
        ├─> travelMenu.js
        │     ├─> ui.js (shared)
        │     ├─> utils.js (shared)
        │     ├─> shipGenerators.js
        │     └─> travelEncounterMenu.js
        │           ├─> ui.js (shared)
        │           └─> mainMenu.js (circular, handled)
        │
        ├─> shipyardMenu.js
        │     ├─> ui.js (shared)
        │     └─> mainMenu.js (circular, handled)
        │
        ├─> marketMenu.js
        │     ├─> ui.js (shared)
        │     └─> mainMenu.js (circular, handled)
        │
        ├─> computerMenu.js
        │     └─> ui.js (shared)
        │
        └─> optionsMenu.js
              ├─> ui.js (shared)
              └─> titleMenu.js

SHARED MODULES (imported by many):
  - ui.js (imported by all menu files)
  - utils.js (imported by ui.js, travelMenu.js)
  - GameState.js (accessed via window.gameState)
  - shipGenerators.js (imported by travelMenu.js)

DEPENDENCY RULES:
  ✓ Utilities have no dependencies (except DOM)
  ✓ UI only depends on utils
  ✓ Classes only depend on generators
  ✓ Generators only depend on classes
  ✓ Menus depend on ui, utils, and other menus (carefully)
  ✓ Circular references handled by using window.gameState
```

## Import Flow

### Level 0 (No Dependencies)
- `utils.js` - Pure utilities

### Level 1 (Only Level 0)
- `ui.js` imports `utils.js`
- `nameGenerators.js` - Pure generator
- `StarSystem.js` - Pure class

### Level 2 (Up to Level 1)
- `shipGenerators.js` - Pure generator
- `systemGenerators.js` imports `StarSystem.js`, `nameGenerators.js`

### Level 3 (Up to Level 2)
- `GameState.js` imports `systemGenerators.js`

### Level 4 (Menu Layer - Up to Level 3)
- `titleMenu.js` imports `ui.js`, `GameState.js`
- `computerMenu.js` imports `ui.js`
- `optionsMenu.js` imports `ui.js`, `titleMenu.js`

### Level 5 (Interactive Menus)
- `travelEncounterMenu.js` imports `ui.js`, `mainMenu.js`
- `shipyardMenu.js` imports `ui.js`, `mainMenu.js`
- `marketMenu.js` imports `ui.js`, `mainMenu.js`

### Level 6 (Main Menu)
- `travelMenu.js` imports `ui.js`, `utils.js`, `shipGenerators.js`, `mainMenu.js`, `travelEncounterMenu.js`
- `mainMenu.js` imports `ui.js`, all menu content providers

### Level 7 (Entry Point)
- `main.js` imports `titleMenu.js`

## Circular Reference Handling

**Problem:** Menu files need to call `showMainMenu()` to return to main menu, but `mainMenu.js` imports those same menu files.

**Solution:** 
1. Menu files import `showMainMenu` from `mainMenu.js`
2. `mainMenu.js` imports content/render functions (not the whole module)
3. Use `window.gameState` instead of importing GameState in every file
4. This creates a one-way dependency: menus → mainMenu (only function reference)

**Why It Works:**
- ES6 modules are evaluated once and cached
- Function references can cross module boundaries
- `window.gameState` breaks direct import chain for state access
- Import of specific exports (not whole modules) reduces coupling
