import {getSetting, registerSettings} from "./Settings.js";
import {
    onCompendiumRender,
    onRenderActorSheet,
    onRenderItemSheet,
    onRenderJurnalSheet,
    onRenderRollTable,
    onRenderSideBar
} from "./MetricModule.js";
import {consoleLog} from "./Utils/Utils.js";
import {addNewSizes, convertI18NObject} from "./Pf2e/Pf2eConverter.js";

Hooks.on('init', () => {
    if (game.system.id === 'dnd5e') {
        consoleLog("Changing labels 'Feet' and 'Miles' to 'Meters' and 'Kilometers'.")
        CONFIG.DND5E.distanceUnits["m"] = game.i18n.localize("metricsystem.meters");
        CONFIG.DND5E.distanceUnits["km"] = game.i18n.localize("metricsystem.kilometers");
        consoleLog("Changing encumbrance calculation.")
        CONFIG.DND5E.encumbrance["currencyPerWeight"].imperial = 100;
        CONFIG.DND5E.encumbrance["strMultiplier"].imperial = 7.5;
    }

    registerSettings();
});

Hooks.on('ready', () => {
    consoleLog("Changing label 'lbs.' to 'kg'.");
    if (game.system.id === 'dnd5e') game.i18n.translations.DND5E["AbbreviationLbs"] = 'kg';

    //if (game.system.id === 'pf2e') game.i18n.translations.PF2E = pf2ePack;
    if (game.system.id === 'pf2e') {
        game.i18n.translations.PF2EM = {};
        convertI18NObject(game.i18n.translations.PF2E);
        addNewSizes();
    }
});

Hooks.on('createScene', (scene) => {
    const gridDist = getSetting("sceneGridDistance");
    const gridUnits = getSetting("sceneGridUnits");
    if (!getSetting("sceneConversion")) return;
    consoleLog(`New Scene: changing gridUnits to '${gridUnits}' and gridDistance to '${gridDist}'.`);
    const sceneClone = JSON.parse(JSON.stringify(scene));

    sceneClone.gridDistance = gridDist;
    sceneClone.gridUnits = gridUnits;
    scene.update(sceneClone)
})

Hooks.on('renderActorSheet', onRenderActorSheet);

Hooks.on('renderItemSheet', onRenderItemSheet);

Hooks.on('renderJournalSheet', onRenderJurnalSheet);

Hooks.on("renderSidebarTab", onRenderSideBar);

Hooks.on('renderRollTableConfig', onRenderRollTable);

Hooks.on('renderCompendium', onCompendiumRender)
