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
        },
        'type': (type) => {
            return convertType(type)
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

var types = {
    "aberration (shapechanger)": "Aberration (Gestaltwandler)",
    "aberration": "Aberration",
    "beast": "Tier",
    "celestial (titan)": "Himmlisches Wesen (Titan)",
    "celestial": "Himmlisches Wesen",
    "construct": "Konstrukt",
    "dragon": "Drache",
    "elemental": "Elementar",
    "fey": "Feenwesen",
    "fiend (demon)": "Unhold (Dämon)",
    "fiend (demon, orc)": "Unhold (Dämon, Ork)",
    "fiend (demon, shapechanger)": "Unhold (Dämon, Gestaltwandler)",
    "fiend (devil)": "Unhold (Teufel)",
    "fiend (devil, shapechanger)": "Unhold (Teufel, Gestaltwandler)",
    "fiend (gnoll)": "Unhold (Gnoll)",
    "fiend (shapechanger)": "Unhold (Gestaltwandler)",
    "fiend (yugoloth)": "Unhold (Yugoloth)",
    "fiend": "Unhold",
    "giant (cloud giant)": "Riese (Wolkenriese)",
    "giant (fire giant)": "Riese (Feuerriese)",
    "giant (frost giant)": "Riese (Frostriese)",
    "giant (hill giant)": "Riese (Hügelriese)",
    "giant (stone giant)": "Riese (Steinriese)",
    "giant (storm giant)": "Riese (Sturmriese)",
    "giant": "Riese",
    "humanoid (aarakocra)": "Humanoider (Aarakocra)",
    "humanoid (any race)": "Humanoider (jedes Volk)",
    "humanoid (bullywug)": "Humanoider (Bullywug)",
    "humanoid (dwarf)": "Humanoider (Zwerg)",
    "humanoid (elf)": "Humanoider (Elf)",
    "humanoid (firenewt)": "Humanoider (Feuermolch)",
    "humanoid (gith)": "Humanoider (Gith)",
    "humanoid (gnoll)": "Humanoider (Gnoll)",
    "humanoid (gnome)": "Humanoider (Gnom)",
    "humanoid (goblinoid)": "Humanoider (Goblinoider)",
    "humanoid (grimlock)": "Humanoider (Grimlock)",
    "humanoid (grung)": "Humanoider (Grung)",
    "humanoid (human)": "Humanoider (Mensch)",
    "humanoid (human, shapechanger)": "Humanoider (Mensch, Gestaltwandler)",
    "humanoid (kenku)": "Humanoider (Kenku)",
    "humanoid (kobold)": "Humanoider (Kobold)",
    "humanoid (kuo-toa)": "Humanoider (Kuo-toa)",
    "humanoid (lizardfolk)": "Humanoider (Echsenmensch)",
    "humanoid (merfolk)": "Humanoider (Meervolk)",
    "humanoid (orc)": "Humanoider (Ork)",
    "humanoid (quaggoth)": "Humanoider (Quaggoth)",
    "humanoid (sahuagin)": "Humanoider (Sahuagin)",
    "humanoid (shapechanger)": "Humanoider (Gestaltwandler)",
    "humanoid (thri-kreen)": "Humanoider (Thri-kreen)",
    "humanoid (troglodyte)": "Humanoider (Troglodyt)",
    "humanoid (xvart)": "Humanoider (Xvart)",
    "humanoid (yuan-ti)": "Humanoider (Yuan-ti)",
    "humanoid": "Humanoider",
    "monstrosity (shapechanger)": "Monstrosität (Gestaltwandler)",
    "monstrosity (shapechanger, yuan-ti)": "Monstrosität (Gestaltwandler, Yuan-ti)",
    "monstrosity (titan)": "Monstrosität (Titan)",
    "monstrosity": "Monstrosität",
    "ooze": "Schlick",
    "plant": "Pflanze",
    "swarm of Tiny beasts": "Schwarm winziger Tier",
    "undead (shapechanger)": "Untoter (Gestaltwandler)",
    "undead": "Untoter"
}

function convertType(t) {
    return types[t.toLowerCase()] ? types[t.toLowerCase()] : t;
}
