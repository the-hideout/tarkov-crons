const AVAILABLE_TYPES = [
    'ammo-box',
    'ammo',
    'armor',
    'backpack',
    'barter',
    'container',
    'disabled',
    'glasses',
    'grenade',
    'gun',
    'headphones',
    'helmet',
    'injectors',
    'keys',
    'marked-only',
    'meds',
    'mods',
    'no-flea',
    'pistol-grip',
    'provisions',
    'rig',
    'suppressor',
    'wearable',
];

const CUSTOM_HANDLERS = [
    'all',
    'missing-image',
    'no-wiki'
];

const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};