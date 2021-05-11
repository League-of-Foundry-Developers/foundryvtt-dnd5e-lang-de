export default function registerConverters(module_id) {
    if (typeof Babele === 'undefined' ||
        !game.settings.get(module_id, 'enableCompendiumTranslation')) {
        return
    }

    Babele.get().registerConverters({
        'alignment': (alignment) => {
            return convertAlignment(alignment)
        },
        'rarity': (rarity) => {
            return convertRarity(rarity)
        }
    });
}

// Alignments

var alignments = {
    'chaotic evil': 'chaotisch böse',
    'chaotic neutral': 'chaotisch neutral',
    'chaotic good': 'chaotisch gut',
    'neutral evil': 'neutral böse',
    'true neutral': 'neutral',
    'neutral': 'neutral',
    'neutral good': 'neutral gut',
    'lawful evil': 'rechtschaffen böse',
    'lawful neutral': 'rechtschaffen neutral',
    'lawful good': 'rechtschaffen gut',
    'chaotic good evil': 'chaotisch gut/böse',
    'lawful chaotic evil': 'rechtschaffen/chaotisch böse',
    'unaligned': 'gesinnungslos',
    'any non-lawful': 'jede nicht rechtschaffende Gesinnung',
    'any': 'jede Gesinnung',
};

function convertAlignment(a) {
    return alignments[a.toLowerCase()] ? alignments[a.toLowerCase()] : a;
}

// Rarity

var rarity = {
	"common": "Gewöhnlich",
	"uncommon": "Ungewöhnlich",
	"rare": "Selten",
	"very rare": "Sehr selten",
    "legendary": "Legendär",
    "artifact": "Artefakt",
    "unique": "Einzigartig"
};

function convertRarity(r) {
    return rarity[r.toLowerCase()] ? rarity[r.toLowerCase()] : r;
}
