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
        },
        'languages': (language) => {
            return convertLanguages(language)
        },
        'race': (race) => {
            return convertRace(race)
        }
    });
}

function toTitelCase(str) {
    let upper = true
    let newStr = ""
    for (let i = 0, l = str.length; i < l; i++) {
        if (str[i] == " ") {
            upper = true
            newStr += str[i]
            continue
        }
        newStr += upper ? str[i].toUpperCase() : str[i].toLowerCase()
        upper = false
    }
    return newStr
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
    return alignments[a.toLowerCase()] ? toTitelCase(alignments[a.toLowerCase()]) : a;
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

var races = {
    "dragonborn": "Drachenblütiger",
    "dwarf": "Zwerg",
    "hill dwarf": "Hügelzwerg",
    "mountain dwarf": "Gebirgszwerg",
    "elf": "Elf",
    "high elf": "Hochelf",
    "gnome": "Gnom",
    "rock gnome": "Felsengnom",
    "half elf": "Halbelf",
    "half-elf": "Halbelf",
    "halfling": "Halbling",
    "lightfoot halfling": "Leichtfuss-Halbling",
    "half orc": "Halbork",
    "human": "Mensch",
    "variant human": "Mensch Variante",
    "tiefling": "Tiefling"
}

function convertRace(r) {
    return races[r.toLowerCase()] ? races[r.toLowerCase()] : r;
}

var languages = {
    "aarakocra": "Aarakocra",
    "abyssal": "Abyssisch",
    "aquan": "Aqual",
    "auran": "Aural",
    "celestial": "Celestisch",
    "common": "Gemeinsprache",
    "deepspeech": "Tiefensprache",
    "draconic": "Drakonisch",
    "druidic": "Druidisch",
    "druid": "Druidisch",
    "dwarvish": "Zwergisch",
    "dwarven": "Zwergisch",
    "elvish": "Elfisch",
    "elven": "Elfisch",
    "giant": "Riesisch",
    "gith": "Gith",
    "gnoll": "Gnollisch",
    "gnomish": "Gnomisch",
    "goblin": "Goblinisch",
    "halfling": "Halbingisch",
    "ignan": "Ignal",
    "infernal": "Infernalisch",
    "orc": "Orkisch",
    "primordial": "Urtümlich",
    "sylvan": "Sylvanisch",
    "terran": "Terral",
    "thievescant": "Diebessprache",
    "thieves cant": "Diebessprache",
    "thieves' cant": "Diebessprache",
    "thieve's cant": "Diebessprache",
    "undercommon": "Gemeinsprache der Unterreiche",
    "giant eagle": "Riesenadler",
    "giant owl": "Rieseneule",
    "giant elk": "Riesenelch",
    "worg": "Worg",
    "winter wolf": "Winterwolf",
    "sahuagin": "Sahuagin",
    "common and auran": "Gemeinsprache und Aural",
    "understands common, elvish, and sylvan but can't speak them": "versteht Gemeinsprache, Elfisch und Sylvanisch, aber kann sie nicht sprechen",
    "understands infernal but can't speak it": "versteht Infernalisch, kann es aber nicht sprechen",
    "understands draconic but can't speak": "versteht Drakonisch, kann es aber nicht sprechen",
    "understands common but doesn't speak it": "versteht Gemeinsprache, kann sie aber nicht sprechen",
    "understands abyssal but can't speak": "versteht Abbysisch, kann es aber nicht sprechen",
    "understands all languages it knew in life but can't speak": "versteht alle zur Lebzeiten gesprochenen, kann aber nicht sprechen",
    "understands commands given in any language but can't speak": "versteht Befehle in allen Sprachen, kann aber nicht sprechen",
    "(can't speak in rat form)": "(kann in Rattengestalt nicht sprechen)",
    "(can't speak in boar form)": "(kann in Schweinegestalt nicht sprechen)",
    "(can't speak in bear form)": "(kann in Bärengestalt nicht sprechen)",
    "(can't speak in tiger form)": "(kann in Tigergestalt nicht sprechen)",
    "any one language": "eine nach Wahl",
    "any two languages": "zwei nach Wahl",
    "any three languages": "drei nach Wahl",
    "any four languages": "vier nach Wahl",
    "any five languages": "fünf nach Wahl",
    "5 other languages": "5 andere Sprachen",
    "any, usually common": "beliebig, normalerweise Gemeinsprache",
    "one language known by its creator": "eine Sprache des Erschaffers",
    "the languages it knew in life": "jede zu Lebzeiten gesprochene",
    "those it knew in life": "jede zu Lebzeiten gesprochene",
    "all it knew in life": "jede zu Lebzeiten gesprochene",
    "any it knew in life": "jede zu Lebzeiten gesprochene",
    "all, telepathy 120 ft.": "alle, Telepathie 36m (120ft)",
    "telepathy 60 ft.": "Telepathie 18m (60ft)",
    "telepathy 60ft. (works only with creatures that understand abyssal)": "Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)",
    "telepathy 60 ft. (works only with creatures that understand abyssal)": "Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)",
    "telepathy 120 ft.": "Telepathie 36m (120ft)",
    "but can't speak": "aber kann nicht sprechen",
    "but can't speak it": "aber kann es nicht sprechen",
    "choice": "nach Wahl",
    "understands the languages of its creator but can't speak": "versteht die Sprachen des Erschaffers, aber kann nicht sprechen",
    "understands common and giant but can't speak": "versteht Gemeinsprache und Riesisch, aber kann nicht sprechen",
    "cannot speak": "Kann nicht sprechen",
    "cant speak": "Kann nicht sprechen",
    "can't speak": "Kann nicht sprechen"
}

var languages_suffixes = {
    " (usually common)": " (normalerweise Gemeinsprache)",
    " (understands but cannot speak)": " (beherrscht, aber kann nicht sprechen)",
    " (understands but can't speak)": " (beherrscht, aber kann nicht sprechen)",
    " but can't speak them": " aber kann sie nicht sprechen",
    " but cannot speak": " aber kann nicht sprechen",
    " but can't speak": " aber kann nicht sprechen"
}

function convertLanguages(l) {
    // Languages are seperated by semicolons
    var parts = l.split(';');
    var result = [];
    parts.forEach(part => {
        // For each language part
        part = part.trim();

        // First, check simple match against languages
        if (languages[part.toLowerCase()]) {
            part = languages[part.toLowerCase()]
        } else {
            // Check if it has a suffix listed in languages_suffixes,
            // if so, remove suffix and match against languages again
            for (var suffix in languages_suffixes) {
                if (part.toLowerCase().endsWith(suffix)) {
                    var without_suffix = part.substring(0, part.length - suffix.length);
                    if (languages[without_suffix.toLowerCase()]) {
                        part = languages[without_suffix.toLowerCase()];
                        part = part + languages_suffixes[suffix];
                    }
                    break;
                }
            }
        }

        if (part.length > 0) {
            result.push(part);
        }
    })

    return result.join("; ");
}

