import {getMultiplier, getSetting} from "../Settings.js";
import {numberSelector, numberToWords} from "./WordsToNumbers.js";

const imperialToMetricMap = {
    "shortened": {
        "inch": "cm",
        "ft.": "m.",
        "ft": "m",
        "feet": "meters",
        "Feet": "Meters",
        "foot": "meter",
        "Foot": "Meter",
        "mile": "km",
        "miles": "km",
        "yards": "meters",
        "lb": "kg",
        "lb.": "kg.",
        "lbs.": "kg.",
        "pounds": "kg",
        "pound": "kg",
        "gallon": "l",
        "gallons": "l",
        "Gallon": "l",
        "Gallons": "l",
    },
    "unshortened": {
        "inch": "centimeters",
        "ft.": "m.",
        "ft": "m",
        "feet": "meters",
        "Feet": "Meters",
        "foot": "meter",
        "Foot": "Meter",
        "mile": "kilometres",
        "miles": "kilometres",
        "yards": "meters",
        "lb": "kg",
        "lb.": "kg.",
        "lbs.": "kg.",
        "pounds": "kilograms",
        "pound": "kilogram",
        "gallon": "liter",
        "gallons": "liters",
        "Gallon": "Liter",
        "Gallons": "Liters",
    }

};

const typesOfUnitsMap = {
    "ft.": "feet",
    "ft": "feet",
    "feet": "feet",
    "Feet": "feet",
    "foot": "feet",
    "Foot": "feet",
    'inch': 'inch',
    "mile": "mile",
    "Mile": "mile",
    "Miles": "mile",
    "miles": "mile",
    "lb": "pound",
    "pound": "pound",
    "lb.": "pound",
    'lbs': 'pound',
    "lbs.": "pound",
    "pounds": "pound",
    "gallon": "gallon",
    "gallons": "gallon",
    "Gallon": "gallon",
    "Gallons": "gallon",

};


const roundUp = (nr) => Math.round((nr + Number.EPSILON) * 100) / 100;

const cleanCommas = (text) => text?.replace(",", "");

const convertStringToNumber = (toConvert) => {
    const numberToReturn = Number(cleanCommas(toConvert));
    return isNaN(numberToReturn) ? -1 : numberToReturn;
}

const convertUsingMultiplier = (toBeConverted, multiplier) => {
    if (!toBeConverted) return;
    const toConvert = typeof toBeConverted === 'number' ? toBeConverted : convertStringToNumber(toBeConverted);

    return roundUp(toConvert * multiplier);
}

const isMetric = (checkString) => !!imperialToMetricMap['unshortened'][checkString];

const convertWeightFromPoundsToKilograms = (weightString) => convertUsingMultiplier(weightString, getMultiplier('pound'));

const convertDistanceFromInchToCentimeters = (distance) => convertUsingMultiplier(distance, getMultiplier('inch'));

const convertDistanceFromFeetToMeters = (distance) => convertUsingMultiplier(distance, getMultiplier('feet'));

const convertDistanceFromMilesToKilometers = (distance) => convertUsingMultiplier(distance, getMultiplier('mile'));

const convertUnitStringToStandard = (unit) => typesOfUnitsMap[unit];

const shouldShortenUnitNames = () => getSetting('forceShortening') ? 'shortened' : 'unshortened';

const convertStringFromImperialToMetric = (imperialString) => imperialToMetricMap[shouldShortenUnitNames()][imperialString] || imperialString;

const convertDistanceFromImperialToMetric = (distance, unit) => {
    const convertedToStandard = convertUnitStringToStandard(unit);
    switch (convertedToStandard) {
        case "feet":
            return convertDistanceFromFeetToMeters(distance);
        case "mile":
            return convertDistanceFromMilesToKilometers(distance);
        case 'inch':
            return convertDistanceFromInchToCentimeters(distance);
        default:
            return distance;
    }
}

const convertVolumeFromImperialToMetric = (volume) => convertUsingMultiplier(volume, getMultiplier('gallon'));

const convertValueToMetric = (value, unit) => {
    const convertedToStandard = convertUnitStringToStandard(unit);
    switch (convertedToStandard) {
        case 'pound':
            return convertWeightFromPoundsToKilograms(value);
        case 'gallon':
            return convertVolumeFromImperialToMetric(value);
        default:
            return convertDistanceFromImperialToMetric(value, unit);
    }
}

const convertText = (text) => {
    return text?.replace(/(\b[^\d\W]+\b )?(\b[^\d\W]+\b)([ -])(feet|foot|Foot|gallons|gallon)/gi, (_0, wordNumber1, wordNumber2, separator, unit) => {
        const capitalized = wordNumber1 !== wordNumber1?.toLowerCase();
        const selectedNumber = numberSelector(wordNumber1 ? wordNumber1?.toLowerCase().trim() : '', wordNumber2?.toLowerCase());
        if (selectedNumber.number) {
            const convertedValue = convertValueToMetric(selectedNumber.number, unit);
            const returnText = `${selectedNumber.text}${numberToWords(Math.ceil(Number(convertedValue)))}${separator}${convertStringFromImperialToMetric(unit)}`;
            return capitalized ? `${returnText.charAt(0).toUpperCase()}${returnText.slice(1)}` : returnText;
        }
        return `${selectedNumber.text}${separator}${unit}`;
    })?.replace(/([0-9]+) (to|and) ([0-9]+) (feet|inch|foot|ft\.|gallons|gallon)/gi, (_0, number1, separatorWord, number2, units) => {
        return `${convertValueToMetric(number1, units)} ${separatorWord} ${convertValueToMetric(number2, units)} ${convertStringFromImperialToMetric(units)}`
    })?.replace(/([0-9]{1,3}(,[0-9]{3})+)([ -])(feet|foot|pounds|gallons|gallon)/gi, (_0, number, _1, separator, label) => {
        return `${convertValueToMetric(number, label)}${separator}${convertStringFromImperialToMetric(label)}`;
    })?.replace(/([0-9]+)\/([0-9]+) (feet|inch|foot|ft\.)/g, (_0, firstNumber, secondNumber, label) => {
        return `${convertValueToMetric(firstNumber, label)}/${convertValueToMetric(secondNumber, label)} ${convertStringFromImperialToMetric(label)}`;
    })?.replace(/([0-9]+)(\W|&nbsp;| cubic |-){1,2}(feet|inch|foot|ft\.|pounds|lbs\.|pound|lbs|lb|ft|Foot|gallons|gallon)/gi, (_0, number, separator, label) => {
        return `${convertValueToMetric(number, label)}${separator}${convertStringFromImperialToMetric(label)}`;
    })?.replace(/(several \w+ )(feet|yards|gallons|gallon)/gi, (_0, several, unit) => {
        return `${several}${convertStringFromImperialToMetric(unit)}`;
    })
}

const movementConverter = (speed) => {
    if (!isMetric(speed.units)) return speed;

    const units = speed.units;
    Object.keys(speed).forEach((key) => {
        if (key === 'units' || key === 'hover') return;

        speed[key] = convertValueToMetric(speed[key], units) || 0;
    })
    speed.units = convertStringFromImperialToMetric(speed.units);

    return speed;
}

const sensesConverter = (senses) => {
    if (!isMetric(senses.units)) return senses;

    const units = senses.units;
    Object.keys(senses).forEach((key) => {
        if (key === 'units') return;

        else if (key === 'special') senses[key] = convertText(senses[key]);
        else senses[key] = convertValueToMetric(senses[key], units) || 0;
    })

    senses.units = convertStringFromImperialToMetric(senses.units);

    return senses;
}

const convertDistance = (distance) => {
    if (!distance) return distance;
    distance.value = convertValueToMetric(distance.value, distance.units);
    distance.long = convertValueToMetric(distance.long, distance.units);
    distance.units = convertStringFromImperialToMetric(distance.units);
    return distance;
}

const speedConverter = (speed) => {
    speed.value = convertText(speed.value || '');
    speed.special = convertText(speed.special || '');
    return speed;
}

const detailsConverter = (details) => {
    details.biography.value = convertText(details.biography.value);
    if (details.appearance) details.appearance = convertText(details.appearance);
    if (details.bond) details.bond = convertText(details.bond);
    if (details.flaw) details.flaw = convertText(details.flaw);
    if (details.ideal) details.ideal = convertText(details.ideal);
    if (details.trait) details.trait = convertText(details.trait);
    return details;
}

const actorDataConverter = (data) => {
    if (data.attributes.movement) data.attributes.movement = movementConverter(data.attributes.movement);
    if (data.attributes.speed) data.attributes.speed = speedConverter(data.attributes.speed);
    if (data.attributes.senses) data.attributes.senses = sensesConverter(data.attributes.senses);
    //data.traits.senses = imperialReplacer(data.traits.senses || '', /(?<value>[0-9]+ ?)(?<unit>[\w]+)/g)
    data.details = detailsConverter(data.details);

    return data;
}

const actorTokenConverter = (token) => {
    token.brightLight = convertValueToMetric(token.brightLight, 'feet');
    token.brightSight = convertValueToMetric(token.brightSight, 'feet');
    token.dimLight = convertValueToMetric(token.dimLight, 'feet');
    token.dimSight = convertValueToMetric(token.dimSight, 'feet');
    return token;
}

const labelConverter = (label) => {
    return label.replace(/(([0-9]+) \/ )?([0-9]+) ([\w]+)/, (_0, _1, optionalValue, mainValue, unit) => {
        if (optionalValue)
            return convertValueToMetric(optionalValue, unit) + '/' + convertValueToMetric(mainValue, unit) + ' ' + convertStringFromImperialToMetric(unit);
        return convertValueToMetric(mainValue, unit) + ' ' + convertStringFromImperialToMetric(unit);
    })
}

const findMetrifiedItemId = async (source, itemId, target, cache) => {
    const compendiumSource = game.packs.get(source);
    const compendiumTarget = game.packs.get(target);
    if (compendiumSource && compendiumTarget) {
        await cache(compendiumSource, source);
        await cache(compendiumTarget, target);
        const entry = compendiumSource.index.find(e => e._id === itemId || e.name === itemId);
        if (!entry) return itemId;
        const newEntity = compendiumTarget.index.find(e => e.name === entry.name);

        itemId = newEntity._id;
    }

    return itemId
}

const relinkText = async (text, cache) => {
    const matched = [...text.matchAll(/@Compendium\[([A-Za-z0-9\-]+)\.([A-Za-z0-9\-]+)\.(\w+)\]/g)];
    for (const match of matched) {
        const source = `${match[1]}.${match[2]}`;
        try {
            const target = `world.${game.packs.get(source).metadata.label.slugify({strict: true})}-metrified`;
            if (source.includes('metrified') || !game.packs.get(target)) continue;
            //const newId = await findMetrifiedItemId(source, match[3], target, cache);
            text = text.replace(`${source}.${match[3]}`, `${target}.${match[3]}`);
        } catch (e) {
            console.log('failed at proccesing: ', source, matched);
        }
    }
    return text;
}

export {
    convertValueToMetric,
    convertStringFromImperialToMetric,
    isMetric,
    convertText,
    actorDataConverter,
    actorTokenConverter,
    convertDistance,
    labelConverter,
    relinkText
}
