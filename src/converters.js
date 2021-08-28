import { default as MonsterData } from '../data/monsters.js'
import { default as ItemData } from '../data/items.js'
import { default as MagicItemData } from '../data/magicitems.js'
import { default as SpellData } from '../data/spells.js'

var module_id = '';

export default function registerConverters(id) {
    module_id = id;

    if (typeof Babele === 'undefined' ||
        !game.settings.get(module_id, 'enableCompendiumTranslation')) {
        return
    }

    Babele.get().registerConverters({
        'alignment': convertAlignment,
        'rarity': convertRarity,
        'type': convertType,
        'languages': convertLanguages,
        'race': convertRace,
        'monstername': convertMonsterName,
        'monstersource': convertMonsterSource,
        'monsterenvironment': convertMonsterEnvironment,
        'monstertoken': convertMonsterToken,
        'itemname': convertItemName,
        'spellname': convertSpellName,
        'spellsource': convertSpellSource,
        'range': convertRange,
        'weight': convertWeight,
    });
}

// Alignments

var alignments = {
    'chaotic evil': 'Chaotisch Böse',
    'chaotic neutral': 'Chaotisch Neutral',
    'chaotic good': 'Chaotisch Gut',
    'neutral evil': 'Neutral Böse',
    'true neutral': 'Neutral',
    'neutral': 'Neutral',
    'neutral good': 'Neutral Gut',
    'lawful evil': 'Rechtschaffen Böse',
    'lawful neutral': 'Rechtschaffen Neutral',
    'lawful good': 'Rechtschaffen Gut',
    'chaotic good evil': 'Chaotisch Gut/Böse',
    'lawful chaotic evil': 'Rechtschaffen/Chaotisch Böse',
    'unaligned': 'Gesinnungslos',
    'any non evil': 'Jede nicht böse Gesinnung',
    'any non neutral': 'Jede nicht neutrale Gesinnung',
    'any non good': 'Jede nicht gute Gesinnung',
    'any non chaotic': 'Jede nicht chaotische Gesinnung',
    'any non lawful': 'Jede nicht rechtschaffende Gesinnung',
    'any': 'Jede Gesinnung',
};

function convertAlignment(a) {
    var id = a.toString().toLowerCase().replace('-', ' ');
    return alignments[id] ? alignments[id] : a;
}

// Rarity

var rarity = {
	'common': 'Gewöhnlich',
	'uncommon': 'Ungewöhnlich',
	'rare': 'Selten',
	'very rare': 'Sehr selten',
    'legendary': 'Legendär',
    'artifact': 'Artefakt',
    'unique': 'Einzigartig'
};

function convertRarity(r) {
    return rarity[r.toString().toLowerCase()] ? rarity[r.toString().toLowerCase()] : r;
}

var types = {
    'aberration (shapechanger)': 'Aberration (Gestaltwandler)',
    'aberration': 'Aberration',
    'beast': 'Tier',
    'celestial (titan)': 'Himmlisches Wesen (Titan)',
    'celestial': 'Himmlisches Wesen',
    'construct': 'Konstrukt',
    'dragon': 'Drache',
    'elemental': 'Elementar',
    'fey': 'Feenwesen',
    'fiend (demon)': 'Unhold (Dämon)',
    'fiend (demon, orc)': 'Unhold (Dämon, Ork)',
    'fiend (demon, shapechanger)': 'Unhold (Dämon, Gestaltwandler)',
    'fiend (devil)': 'Unhold (Teufel)',
    'fiend (devil, shapechanger)': 'Unhold (Teufel, Gestaltwandler)',
    'fiend (gnoll)': 'Unhold (Gnoll)',
    'fiend (shapechanger)': 'Unhold (Gestaltwandler)',
    'fiend (yugoloth)': 'Unhold (Yugoloth)',
    'fiend': 'Unhold',
    'giant (cloud giant)': 'Riese (Wolkenriese)',
    'giant (fire giant)': 'Riese (Feuerriese)',
    'giant (frost giant)': 'Riese (Frostriese)',
    'giant (hill giant)': 'Riese (Hügelriese)',
    'giant (stone giant)': 'Riese (Steinriese)',
    'giant (storm giant)': 'Riese (Sturmriese)',
    'giant': 'Riese',
    'humanoid (aarakocra)': 'Humanoider (Aarakocra)',
    'humanoid (any race)': 'Humanoider (jedes Volk)',
    'humanoid (bullywug)': 'Humanoider (Bullywug)',
    'humanoid (dwarf)': 'Humanoider (Zwerg)',
    'humanoid (elf)': 'Humanoider (Elf)',
    'humanoid (firenewt)': 'Humanoider (Feuermolch)',
    'humanoid (gith)': 'Humanoider (Gith)',
    'humanoid (gnoll)': 'Humanoider (Gnoll)',
    'humanoid (gnome)': 'Humanoider (Gnom)',
    'humanoid (goblinoid)': 'Humanoider (Goblinoider)',
    'humanoid (grimlock)': 'Humanoider (Grimlock)',
    'humanoid (grung)': 'Humanoider (Grung)',
    'humanoid (human)': 'Humanoider (Mensch)',
    'humanoid (human, shapechanger)': 'Humanoider (Mensch, Gestaltwandler)',
    'humanoid (kenku)': 'Humanoider (Kenku)',
    'humanoid (kobold)': 'Humanoider (Kobold)',
    'humanoid (kuo-toa)': 'Humanoider (Kuo-toa)',
    'humanoid (lizardfolk)': 'Humanoider (Echsenmensch)',
    'humanoid (merfolk)': 'Humanoider (Meervolk)',
    'humanoid (orc)': 'Humanoider (Ork)',
    'humanoid (quaggoth)': 'Humanoider (Quaggoth)',
    'humanoid (sahuagin)': 'Humanoider (Sahuagin)',
    'humanoid (shapechanger)': 'Humanoider (Gestaltwandler)',
    'humanoid (thri-kreen)': 'Humanoider (Thri-kreen)',
    'humanoid (troglodyte)': 'Humanoider (Troglodyt)',
    'humanoid (xvart)': 'Humanoider (Xvart)',
    'humanoid (yuan-ti)': 'Humanoider (Yuan-ti)',
    'humanoid': 'Humanoider',
    'monstrosity (shapechanger)': 'Monstrosität (Gestaltwandler)',
    'monstrosity (shapechanger, yuan-ti)': 'Monstrosität (Gestaltwandler, Yuan-ti)',
    'monstrosity (titan)': 'Monstrosität (Titan)',
    'monstrosity': 'Monstrosität',
    'ooze': 'Schlick',
    'plant': 'Pflanze',
    'swarm of Tiny beasts': 'Schwarm winziger Tier',
    'undead (shapechanger)': 'Untoter (Gestaltwandler)',
    'undead': 'Untoter'
}

function convertType(t) {
    if (!t) {
        return t;
    }
    return types[t.toString().toLowerCase()] ? types[t.toString().toLowerCase()] : t;
}

var races = {
    'dragonborn': 'Drachenblütiger',
    'dwarf': 'Zwerg',
    'hill dwarf': 'Hügelzwerg',
    'mountain dwarf': 'Gebirgszwerg',
    'elf': 'Elf',
    'high elf': 'Hochelf',
    'gnome': 'Gnom',
    'rock gnome': 'Felsengnom',
    'half elf': 'Halbelf',
    'half-elf': 'Halbelf',
    'halfling': 'Halbling',
    'lightfoot halfling': 'Leichtfuss-Halbling',
    'half orc': 'Halbork',
    'human': 'Mensch',
    'variant human': 'Mensch Variante',
    'tiefling': 'Tiefling'
}

function convertRace(r) {
    return races[r.toString().toLowerCase()] ? races[r.toString().toLowerCase()] : r;
}

var languages = {
    'aarakocra': 'Aarakocra',
    'abyssal': 'Abyssisch',
    'aquan': 'Aqual',
    'auran': 'Aural',
    'celestial': 'Celestisch',
    'common': 'Gemeinsprache',
    'deepspeech': 'Tiefensprache',
    'draconic': 'Drakonisch',
    'druidic': 'Druidisch',
    'druid': 'Druidisch',
    'dwarvish': 'Zwergisch',
    'dwarven': 'Zwergisch',
    'elvish': 'Elfisch',
    'elven': 'Elfisch',
    'giant': 'Riesisch',
    'gith': 'Gith',
    'gnoll': 'Gnollisch',
    'gnomish': 'Gnomisch',
    'goblin': 'Goblinisch',
    'halfling': 'Halbingisch',
    'ignan': 'Ignal',
    'infernal': 'Infernalisch',
    'orc': 'Orkisch',
    'primordial': 'Urtümlich',
    'sylvan': 'Sylvanisch',
    'terran': 'Terral',
    'thievescant': 'Diebessprache',
    'thieves cant': 'Diebessprache',
    'thieves\' cant': 'Diebessprache',
    'thieve\'s cant': 'Diebessprache',
    'undercommon': 'Gemeinsprache der Unterreiche',
    'giant eagle': 'Riesenadler',
    'giant owl': 'Rieseneule',
    'giant elk': 'Riesenelch',
    'worg': 'Worg',
    'winter wolf': 'Winterwolf',
    'sahuagin': 'Sahuagin',
    'common and auran': 'Gemeinsprache und Aural',
    'understands common, elvish, and sylvan but can\'t speak them': 'versteht Gemeinsprache, Elfisch und Sylvanisch, aber kann sie nicht sprechen',
    'understands infernal but can\'t speak it': 'versteht Infernalisch, kann es aber nicht sprechen',
    'understands draconic but can\'t speak': 'versteht Drakonisch, kann es aber nicht sprechen',
    'understands common but doesn\'t speak it': 'versteht Gemeinsprache, kann sie aber nicht sprechen',
    'understands abyssal but can\'t speak': 'versteht Abbysisch, kann es aber nicht sprechen',
    'understands all languages it knew in life but can\'t speak': 'versteht alle zur Lebzeiten gesprochenen, kann aber nicht sprechen',
    'understands commands given in any language but can\'t speak': 'versteht Befehle in allen Sprachen, kann aber nicht sprechen',
    '(can\'t speak in rat form)': '(kann in Rattengestalt nicht sprechen)',
    '(can\'t speak in boar form)': '(kann in Schweinegestalt nicht sprechen)',
    '(can\'t speak in bear form)': '(kann in Bärengestalt nicht sprechen)',
    '(can\'t speak in tiger form)': '(kann in Tigergestalt nicht sprechen)',
    'any one language': 'eine nach Wahl',
    'any two languages': 'zwei nach Wahl',
    'any three languages': 'drei nach Wahl',
    'any four languages': 'vier nach Wahl',
    'any five languages': 'fünf nach Wahl',
    '5 other languages': '5 andere Sprachen',
    'any, usually common': 'beliebig, normalerweise Gemeinsprache',
    'one language known by its creator': 'eine Sprache des Erschaffers',
    'the languages it knew in life': 'jede zu Lebzeiten gesprochene',
    'those it knew in life': 'jede zu Lebzeiten gesprochene',
    'all it knew in life': 'jede zu Lebzeiten gesprochene',
    'any it knew in life': 'jede zu Lebzeiten gesprochene',
    'all, telepathy 120 ft.': 'alle, Telepathie 36m (120ft)',
    'telepathy 60 ft.': 'Telepathie 18m (60ft)',
    'telepathy 60ft. (works only with creatures that understand abyssal)': 'Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)',
    'telepathy 60 ft. (works only with creatures that understand abyssal)': 'Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)',
    'telepathy 120 ft.': 'Telepathie 36m (120ft)',
    'but can\'t speak': 'aber kann nicht sprechen',
    'but can\'t speak it': 'aber kann es nicht sprechen',
    'choice': 'nach Wahl',
    'understands the languages of its creator but can\'t speak': 'versteht die Sprachen des Erschaffers, aber kann nicht sprechen',
    'understands common and giant but can\'t speak': 'versteht Gemeinsprache und Riesisch, aber kann nicht sprechen',
    'cannot speak': 'Kann nicht sprechen',
    'cant speak': 'Kann nicht sprechen',
    'can\'t speak': 'Kann nicht sprechen'
}

var languages_suffixes = {
    ' (usually common)': ' (normalerweise Gemeinsprache)',
    ' (understands but cannot speak)': ' (beherrscht, aber kann nicht sprechen)',
    ' (understands but can\'t speak)': ' (beherrscht, aber kann nicht sprechen)',
    ' but can\'t speak them': ' aber kann sie nicht sprechen',
    ' but cannot speak': ' aber kann nicht sprechen',
    ' but can\'t speak': ' aber kann nicht sprechen'
}

function convertLanguages(l) {
    // Languages are seperated by semicolons
    var parts = l.split(';');
    var result = [];
    parts.forEach(part => {
        // For each language part
        part = part.trim();

        // First, check simple match against languages
        if (languages[part.toString().toLowerCase()]) {
            part = languages[part.toString().toLowerCase()]
        } else {
            // Check if it has a suffix listed in languages_suffixes,
            // if so, remove suffix and match against languages again
            for (var suffix in languages_suffixes) {
                if (part.toString().toLowerCase().endsWith(suffix)) {
                    var without_suffix = part.substring(0, part.length - suffix.length);
                    if (languages[without_suffix.toString().toLowerCase()]) {
                        part = languages[without_suffix.toString().toLowerCase()];
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

    return result.join('; ');
}

var monster_name_replacements = {
    'will-o\'-wisp': 'Will-o-wisp',
    'succubus/incubus': 'Succubus',
    'horned devil': 'Horned Devil (Malebranche)',
    'giant rat (diseased)': 'Giant Rat',
    'chain devil': 'Chain Devil (Kyton)',
    'deep gnome': 'Deep Gnome (Svirfneblin)'
}

function getMonsterID(id) {
    if (monster_name_replacements[id.toString().toLowerCase()]) {
        id = monster_name_replacements[id.toString().toLowerCase()];
    }
    return id
}

var monster_name_additional = {
    'succubus/incubus': 'Sukkubus/Inkubus',
    'horned devil': 'Hornteufel',
    'giant rat (diseased)': 'Riesenratte (Erkrankt)',
    'chain devil': 'Kettenteufel',
    'avatar of death': 'Avatar des Todes',
    'deep gnome': 'Tiefen-Gnom'
}

function convertMonsterName(m, translation, data) {
    if (monster_name_additional[m.toString().toLowerCase()]) {
        return monster_name_additional[m.toString().toLowerCase()];
    }

    var id = getMonsterID(m);

    return MonsterData.data[id] ? MonsterData.data[id].name : m;
}

function convertMonsterToken(m, translation, data) {
    m.name = convertMonsterName(m.name);
    return m;
}

var source_book_replacements = {
    'MM': 'MHB',
    'PHB': 'SHB',
    'DMG': 'SLHB',
    'VGM': 'VAM'
}

function convertMonsterSource(m, translation, data) {
    if (!MonsterData.data[data.name]) {
        return m;
    }

    var new_src = MonsterData.data[data.name].src + ' S. ' + MonsterData.data[data.name].src_pg;
    new_src = new_src.replace(', SRD', '');
    new_src = new_src.replace('SRD', '');

    if (game.settings.get(module_id, 'compendiumSrcTranslateBooks')) {
        for (var book in source_book_replacements) {
            new_src = new_src.replace(book, source_book_replacements[book]);
        }
    }

    if (game.settings.get(module_id, 'compendiumSrcKeepOriginal')) {
        new_src = new_src + ' (' + m.replace('pg.', 'S.') + ')';
    }

    return new_src
}

function convertMonsterEnvironment(m, translation, data) {
    if (!MonsterData.data[data.name]) {
        return m;
    }

    return MonsterData.data[data.name].env;
}


function convertItemName(m, translation, data) {
    if (ItemData.data[m]) {
        return ItemData.data[m].name;
    }

    if (MagicItemData.data[m]) {
        return MagicItemData.data[m].name;
    }

    var mod = getMagicalItemModifier(m);
    if (mod.length > 0) {
        var basename = m.substring(0, m.length - mod.length).trim()
        if (ItemData.data[basename]) {
            return ItemData.data[basename].name + " " + mod;
        }

        if (MagicItemData.data[basename]) {
            return MagicItemData.data[basename].name + " " + mod;
        }
    }

    return m;
}

function getMagicalItemModifier(string)
{
    var match = string.match(/[\+\-][0-9]$/);
    return match ? match[0] : '';
}

function convertSpellName(name) {
    if (SpellData.data[name]) {
        return SpellData.data[name].name;
    }

    return name;
}

function convertSpellSource(m, translation, data) {
    if (!SpellData.data[data.name]) {
        return m;
    }

    var new_src = SpellData.data[data.name].src + ' S. ' + SpellData.data[data.name].src_pg;
    new_src = new_src.replace(', SRD', '');
    new_src = new_src.replace('SRD', '');

    if (game.settings.get(module_id, 'compendiumSrcTranslateBooks')) {
        for (var book in source_book_replacements) {
            new_src = new_src.replace(book, source_book_replacements[book]);
        }
    }

    if (game.settings.get(module_id, 'compendiumSrcKeepOriginal')) {
        new_src = new_src + ' (' + m.replace('pg.', 'S.') + ')';
    }

    return new_src
}

// Range

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function footsToMeters(ft) {
	return round(parseInt(ft) * 0.3);
}

function milesToKilometers(mi) {
	return round(parseInt(mi) * 1.5);
}

function convertRange(range) {
    if (!game.settings.get(module_id, 'enableRangeTranslation')) {
        return range;
    }

    if (range.units === 'ft') {
        if (range.long) {
            range = mergeObject(range, { long: footsToMeters(range.long) });
        }
        return mergeObject(range, { value: footsToMeters(range.value), units: 'm' });
    }

    if(range.units === 'mi') {
        if(range.long) {
            range = mergeObject(range, { long: milesToKilometers(range.long) });
        }
        return mergeObject(range, { value: milesToKilometers(range.value), units: 'km' });
    }

    return range;
}

// Weight

function lbToKg(lb) {
	return parseInt(lb)/2;
}

function convertWeight(value) {
    if (!game.settings.get(module_id, 'enableWeightTranslation')) {
        return value;
    }

    return lbToKg(value);
}
