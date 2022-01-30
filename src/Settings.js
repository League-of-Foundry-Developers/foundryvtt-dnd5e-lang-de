import {moduleName} from './Utils/Utils.js'
import settingsLists from "./settingsLists.js";

const registerSetting = (key, data) => {
    game.settings.register('Foundry-MGL', key, data);
}

const getSetting = (key) => {
    return game.settings.get('Foundry-MGL', key);
}

const setSetting = (key, data) => {
    return game.settings.set(moduleName, key, data);
}

const getMultipliers = () => {
    const setting = getSetting("conversionMultipliers");
    try {
        return JSON.parse(setting);
    } catch (error) {
        return {}
    }
}

const registerSettings = () => {
    settingsLists.SETTINGS.forEach((setting) => {
        registerSetting(setting.key, setting.data);
    });
}


/**
 * Returns the multiplier for converting a unit
 *
 * @param unit
 */
const getMultiplier = (unit) => {
    return getSetting(`${unit}ConversionMultiplier`)
}

/**
 * Sets a units multiplier
 *
 * @param unit - unit
 * @param value - multiplier
 */
const setMultiplier = (unit, value) => {
    let multipliers = getMultipliers();
    multipliers[unit] = value;
    setSetting("conversionMultipliers", JSON.stringify(multipliers));
}

export {registerSettings, getMultiplier, setMultiplier, getSetting, setSetting}