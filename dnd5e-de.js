
import Actor from '../../systems/dnd5e/module/actor/sheets/character.js';
import NPC from '../../systems/dnd5e/module/actor/sheets/npc.js';
import config from './src/config.js';

const module_id = 'FoundryVTT-dnd5e-DE';

Hooks.once('init', () => {
    // Create settings
    config.forEach((cfg) => {
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
            module: 'FoundryVTT-dnd5e-DE',
            lang: 'de',
            dir: 'compendium'
        });
    }

    // Sort skills alphabetically
    // Thanks to Elvis Pereira for the polish translation
    // Fixed in upstream 1.3.0 (https://gitlab.com/foundrynet/dnd5e/-/issues/1070)
    if (!isNewerVersion(game.system.data.version, '1.2.4')) {
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
            if (game.i18n.lang === 'de' &&
                game.system.id === 'dnd5e' &&
                game.settings.get(module_id, 'overrideSkillSortAlpha')) {
                sortSkillsAlpha();
            }
        });
    }
});

export class ActorSheet5eCharacter extends Actor {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['dnd5e', 'sheet', 'actor', 'character'],
      width: 800
    });
  }
}

export class ActorSheet5eNPC extends NPC {
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['dnd5e', 'sheet', 'actor', 'npc'],
      width: 700
    });
  }
}

Hooks.once('ready', function () {
    if (game.i18n.lang === 'de' &&
        game.system.id === 'dnd5e' &&
        game.settings.get(module_id, 'increaseSheetWidth')) {
        Actors.registerSheet('dnd5e', ActorSheet5eCharacter, {
            types: ['character'],
            makeDefault: false
        });

        Actors.registerSheet('dnd5e', ActorSheet5eNPC, {
            types: ['npc'],
            makeDefault: false
        });
    }
});
