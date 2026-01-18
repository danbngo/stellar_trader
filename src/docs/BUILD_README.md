# Stellar Trader - Build Instructions

## Development Setup

### Prerequisites
- Node.js and npm installed

### Installation
```bash
npm install
```

## Build Commands

### Build for Production
```bash
npm run build
```
Creates a bundled `dist/bundle.js` file from all ES6 modules.

### Watch Mode (Auto-rebuild on changes)
```bash
npm run watch
```
Automatically rebuilds when source files change.

### Development Server (with Hot Reload)
```bash
npm run dev
```
Starts webpack-dev-server at http://localhost:8080 with hot module replacement.

## Project Structure

```
stellar trader/
├── index.html              # Main HTML (loads dist/bundle.js)
├── index.css              # Styles
├── main.js                # Entry point
├── webpack.config.js      # Webpack configuration
├── package.json           # Dependencies and scripts
├── dist/                  # Build output (generated)
│   └── bundle.js         # Bundled JavaScript
└── src/                   # Source modules
    ├── utils.js
    ├── ui.js
    ├── classes/
    ├── generators/
    └── menus/
```

## Webpack Configuration

- **Entry**: `main.js`
- **Output**: `dist/bundle.js`
- **Mode**: Development (with source maps)
- **Dev Server**: Port 8080

## Deployment

1. Run `npm run build`
2. Deploy the following files:
   - `index.html`
   - `index.css`
   - `dist/bundle.js`
   - `dist/bundle.js.map` (optional, for debugging)

No need to deploy `src/`, `node_modules/`, or source files.
