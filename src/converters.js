export default function registerConverters(module_id) {
    if (typeof Babele === 'undefined' ||
        !game.settings.get(module_id, 'enableCompendiumTranslation')) {
        return
    }

    Babele.get().registerConverters({
        'alignment': (alignment) => {
            return convertAlignment(alignment)
        }
    });
}

// Alignments

var alignments = {
    'chaotic evil': 'chaotisch böse',
    'chaotic neutral': 'chaotisch neutral',
    'chaotic good': 'chaotisch gut',
    'neutral evil': 'chaotisch neutral',
    'true neutral': 'neutral',
    'neutral': 'meutral',
    'neutral good': 'neutral gut',
    'lawful evil': 'rechtschaffen böse',
    'lawful neutral': 'rechtschaffen neutral',
    'lawful good': 'rechtschaffen gut',
    'chaotic good evil': 'chaotisch gut/böse',
    'lawful chaotic evil': 'rechtschaffen/chaotisch böse',
    'unaligned': 'gesinnungslos',
    'any non-lawful': 'jede nicht-rechtschaffende',
    'any': 'jede',
};

function convertAlignment(alignment) {
    return alignments[alignment.toLowerCase()];
}
