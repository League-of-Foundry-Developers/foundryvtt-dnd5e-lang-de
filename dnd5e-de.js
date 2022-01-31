
// Foundry
import Actor from '../../systems/dnd5e/module/actor/sheets/character.js';
import NPC from '../../systems/dnd5e/module/actor/sheets/npc.js';

// Module
import Config from './src/config.js';
import Converters from './src/converters.js';
import Dialog from './src/window_popup.js';

// meter import
import {getSetting, registerSettings} from "./src/Settings.js";
import {
    onCompendiumRender,
    onRenderActorSheet,
    onRenderItemSheet,
    onRenderJurnalSheet,
    onRenderRollTable,
    onRenderSideBar
} from "./src/MetricModule.js";
import {consoleLog} from "./src/Utils/Utils.js";

const module_id = 'FoundryVTT-dnd5e-DE';
const module_lang = 'de';
const module_sys = 'dnd5e';

Hooks.once('init', () => {
    // Create settings
    Config.forEach((cfg) => {
        // Skip settings not applicable for this system version
        if ('onlyUntilSystemVersionIncluding' in cfg &&
            isNewerVersion(game.system.data.version,
                cfg.onlyUntilSystemVersionIncluding)) {
            return;
        }
        game.settings.register(module_id, cfg.name, cfg.data);
    });

    // Register Babele compendium translations if module is present
    if (typeof Babele !== 'undefined' &&
        game.settings.get(module_id, 'enableCompendiumTranslation')) {
        Babele.get().register({
            module: module_id,
            lang: module_lang,
            dir: 'compendium'
        });
        Converters(module_id);
    }

    // Sort skills alphabetically
    // Thanks to Elvis Pereira for the polish translation
    // Fixed in upstream 1.3.0 (https://gitlab.com/foundrynet/dnd5e/-/issues/1070)
    if (game.i18n.lang === module_lang &&
        game.system.id === module_sys &&
        (!isNewerVersion(game.system.data.version, '1.2.4') ||
        game.modules.get('5e-ogl-character-sheet')?.active)) {
        // Activate sorting if correct system and language AND
        // either using a system version <= 1.2.4, where sorting wasn't
        // done correctly in translations OR if using the OGL sheet

        async function sortSkillsAlpha() {
            const lists = document.getElementsByClassName('skills-list');
            for (let list of lists) {
                const competences = list.childNodes;
                let complist = [];
                for (let sk of competences) {
                    if (sk.innerText && sk.tagName == 'LI') {
                        complist.push(sk);
                    }
                }
                complist.sort(function (a, b) {
                    return a.innerText.localeCompare(b.innerText);
                });
                for (let sk of complist) {
                    list.appendChild(sk);
                }
            }
        }

        Hooks.on('renderActorSheet', async function () {
            if (game.i18n.lang === module_lang &&
                game.system.id === module_sys &&
                (game.modules.get('5e-ogl-character-sheet')?.active &&
                 game.settings.get(module_id, 'oglOverrideSkillSortAlpha'))) {
                sortSkillsAlpha();
            }
        });

        // load settings for meter, gram, liter
        if (game.system.id === 'dnd5e') {
            consoleLog("Changing labels 'Feet' and 'Miles' to 'Meters' and 'Kilometers'.")
            CONFIG.DND5E.distanceUnits["m"] = game.i18n.localize("metricsystem.meters");
            CONFIG.DND5E.distanceUnits["km"] = game.i18n.localize("metricsystem.kilometers");
            consoleLog("Changing encumbrance calculation.")
            CONFIG.DND5E.encumbrance["currencyPerWeight"].imperial = 100;
            CONFIG.DND5E.encumbrance["strMultiplier"].imperial = 7.5;
        }
    
        registerSettings();
    }
});

// Option to increase sheet width

export class ActorSheet5eCharacter extends Actor {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: [module_sys, 'sheet', 'actor', 'character'],
      width: 800
    });
  }
}

export class ActorSheet5eNPC extends NPC {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: [module_sys, 'sheet', 'actor', 'npc'],
      width: 700
    });
  }
}

Hooks.once('ready', function () {
    if (game.i18n.lang === module_lang &&
        game.system.id === module_sys &&
        game.settings.get(module_id, 'increaseSheetWidth')) {
        Actors.registerSheet(module_sys, ActorSheet5eCharacter, {
            types: ['character'],
            makeDefault: false
        });

        Actors.registerSheet(module_sys, ActorSheet5eNPC, {
            types: ['npc'],
            makeDefault: false
        });
    }

    if (game.i18n.lang === module_lang &&
        game.system.id === module_sys &&
        game.settings.get(module_id, 'translationDialog')){
            Dialog();
        }

    // module meter, gram, liter
    consoleLog("Changing label 'lbs.' to 'kg'.");
    if (game.system.id === 'dnd5e') game.i18n.translations.DND5E["AbbreviationLbs"] = 'kg';
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
