export class Skill {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

export const PILOTING = new Skill(
    'Piloting',
    'Each level reduces travel time by 5%'
);

export const COMBAT = new Skill(
    'Combat',
    'Each level increases weapon damage by 5%'
);

export const ENGINEERING = new Skill(
    'Engineering',
    'Each level repairs 1 hull per day while traveling'
);

export const BARTER = new Skill(
    'Barter',
    'Each level reduces market fees by 5%'
);

export const SKILLS = {
    piloting: PILOTING,
    combat: COMBAT,
    engineering: ENGINEERING,
    barter: BARTER
};

export const SKILL_NAMES = ['piloting', 'combat', 'engineering', 'barter'];
export const MAX_SKILL_LEVEL = 10;
