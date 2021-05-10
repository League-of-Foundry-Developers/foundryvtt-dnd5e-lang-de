Hooks.once('init', () => {
  // Abort if not 5E
  if (game.system.id !== "dnd5e") {
    return;
  }
  
    // Register Babele compendium translations if module is present
    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'FoundryVTT-dnd5e-DE',
            lang: 'de',
            dir: 'compendium'
        });
    }

    // Sort skills alphabetically
    // Thanks to Elvis Pereira for the polish translation
    // Fixed in upstream 1.3.0 (https://gitlab.com/foundrynet/dnd5e/-/issues/1070)
    if (!isNewerVersion(game.system.data.version, "1.2.4")) {
        async function sortSkillsAlpha() {
            const lists = document.getElementsByClassName("skills-list");
            for (let list of lists) {
                const competences = list.childNodes;
                let complist = [];
                for (let sk of competences) {
                    if (sk.innerText && sk.tagName == "LI") {
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

        Hooks.on("renderActorSheet", async function () {
            sortSkillsAlpha();
        });
    }
});
