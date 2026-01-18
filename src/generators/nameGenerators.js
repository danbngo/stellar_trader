const namePrefix = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Omega', 'Nova', 'Proxima', 'Kepler', 'Vega', 'Rigel', 'Sirius', 'Altair'];
const nameSuffix = ['Prime', 'Centauri', 'Major', 'Minor', 'Sector', 'Outpost', 'Station', 'System', 'Nexus', 'Haven'];
const singleNames = ['Terra', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Pluto', 'Mercury', 'Venus', 'Titan', 'Europa', 'Ganymede', 'Io', 'Callisto', 'Triton', 'Enceladus'];

export function generateStarSystemName() {
    const roll = Math.random();
    if (roll < 0.3) {
        return singleNames[Math.floor(Math.random() * singleNames.length)];
    } else if (roll < 0.7) {
        const prefix = namePrefix[Math.floor(Math.random() * namePrefix.length)];
        const suffix = nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
        return `${prefix} ${suffix}`;
    } else {
        const prefix = namePrefix[Math.floor(Math.random() * namePrefix.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        return `${prefix}-${number}`;
    }
}
