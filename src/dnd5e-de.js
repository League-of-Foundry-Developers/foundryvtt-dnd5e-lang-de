Hooks.once('init', () => {
    const module_id = 'FoundryVTT-dnd5e-DE';

    // Settings
    game.settings.register(module_id, 'overrideSkillSortAlpha', {
        name: 'Fertigkeiten alphabetisch sortieren',
        hint: 'Sortiert die Fertigkeitsliste alphabetisch.',
        scope: 'client',
        type: Boolean,
        config: true,
        default: true
    });

    game.settings.register(module_id, 'enableCompendiumTranslation', {
        name: 'Kompendiuminhalte übersetzen',
        hint: 'Übersetzen der Kompendiuminhalte. Benötigt das Babele-Modul.',
        scope: 'client',
        type: Boolean,
        config: true,
        default: true
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
