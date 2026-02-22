const SHIP_SPRITES = {
    topside: {
        right: ['◣', '██▶', '◤'],
        left: ['  ◢', '◀██', '  ◥'],
        down: ['◥██◤', ' ◥◤'],
        up: [' ◢◣', '◢██◣']
    },
    underside: {
        right: ['◣', '██▶', '◤'],
        left: ['  ◢', '◀██', '  ◥'],
        down: ['◥██◤', ' ◥◤'],
        up: [' ◢◣', '◢██◣']
    },
    side: {
        left: ['◢██', '  ◥'],
        right: ['██◣', '◤'],
        upBellyLeft: [' ◣', '◢██'],
        upBellyRight: [' ◢', '██◣'],
        downBellyRight: ['██◤', ' ◥'],
        downBellyLeft: ['◢██', ' ◤']
    },
    nose: {
        bellyDown: ['◢█v█◣'],
        bellyLeft: [' ◣', '<█', ' ◤'],
        bellyRight: ['◢', '█>', '◥'],
        bellyUp: ['◥█^█◤']
    },
    back: {
        bellyDown: ['◢███◣'],
        bellyLeft: ['◣', '██', '◤'],
        bellyRight: ['◢', '██', '◥'],
        bellyUp: ['◥███◤']
    }
};

function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
}

function pickByHash(options, seed) {
    return options[seed % options.length];
}

export function getCloseRangeSprite(ship) {
    const seedBase = `${ship.name || ''}:${ship.type || ''}`;
    const seed = hashString(seedBase || 'ship');

    const views = ['topside', 'side', 'nose', 'back'];
    const view = pickByHash(views, seed);

    console.log('[ShipSprites] Selecting close-range sprite', {
        shipName: ship.name,
        shipType: ship.type,
        seed,
        selectedView: view
    });

    if (view === 'topside') {
        const facing = pickByHash(['right', 'left', 'down', 'up'], seed >> 2);
        console.log('[ShipSprites] Topside facing selected', { facing });
        const sprite = SHIP_SPRITES.topside[facing].join('\n');
        const lines = sprite.split('\n');
        const spriteHeight = lines.length;
        const spriteWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0);
        console.log('[ShipSprites] Sprite size computed', { spriteWidth, spriteHeight, largerThanOneByOne: spriteWidth > 1 || spriteHeight > 1 });
        return sprite;
    }

    if (view === 'side') {
        const facing = pickByHash(['left', 'right', 'upBellyLeft', 'upBellyRight', 'downBellyRight', 'downBellyLeft'], seed >> 2);
        console.log('[ShipSprites] Side facing selected', { facing });
        const sprite = SHIP_SPRITES.side[facing].join('\n');
        const lines = sprite.split('\n');
        const spriteHeight = lines.length;
        const spriteWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0);
        console.log('[ShipSprites] Sprite size computed', { spriteWidth, spriteHeight, largerThanOneByOne: spriteWidth > 1 || spriteHeight > 1 });
        return sprite;
    }

    if (view === 'nose') {
        const belly = pickByHash(['bellyDown', 'bellyLeft', 'bellyRight', 'bellyUp'], seed >> 2);
        console.log('[ShipSprites] Nose belly orientation selected', { belly });
        const sprite = SHIP_SPRITES.nose[belly].join('\n');
        const lines = sprite.split('\n');
        const spriteHeight = lines.length;
        const spriteWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0);
        console.log('[ShipSprites] Sprite size computed', { spriteWidth, spriteHeight, largerThanOneByOne: spriteWidth > 1 || spriteHeight > 1 });
        return sprite;
    }

    const belly = pickByHash(['bellyDown', 'bellyLeft', 'bellyRight', 'bellyUp'], seed >> 2);
    console.log('[ShipSprites] Back belly orientation selected', { belly });
    const sprite = SHIP_SPRITES.back[belly].join('\n');
    const lines = sprite.split('\n');
    const spriteHeight = lines.length;
    const spriteWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0);
    console.log('[ShipSprites] Sprite size computed', { spriteWidth, spriteHeight, largerThanOneByOne: spriteWidth > 1 || spriteHeight > 1 });
    return sprite;
}
