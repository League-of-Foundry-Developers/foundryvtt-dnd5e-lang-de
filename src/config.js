export default [
    {
        name: 'overrideSkillSortAlpha',
        onlyUntilSystemVersionIncluding: '1.2.4',
        data: {
            name: 'Fertigkeiten alphabetisch sortieren',
            hint: 'Sortiert die Fertigkeitenliste alphabetisch.',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true
        },
    },
    {
        name: 'enableCompendiumTranslation',
        data: {
            name: 'Kompendiuminhalte übersetzen',
            hint: 'Übersetzen der Kompendiuminhalte. Benötigt das Babele-Modul. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    },
    {
        name: 'compendiumSrcTranslateBooks',
        data: {
            name: 'Buchtitel-Abkürzungen für Quellen übersetzen',
            hint: 'Übersetzt die Abkürzungen für Buchtitel in Quellenangaben, z.B. wird aus PHB (Player\'s Handbook) dann SHB (Spielerhandbuch).',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true
        }
    },
    {
        name: 'compendiumSrcKeepOriginal',
        data: {
            name: 'Englische Quellenangabe mit anzeigen',
            hint: 'Englische Quellenangaben/Seitenzahlen werden zusätzlich in Klammern angegeben.',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true
        }
    },
    {
        name: 'increaseSheetWidth',
        data: {
            name: 'Breitere Charakterbögen',
            hint: 'Verbreitet die Charakterbögen. Kann bei abgeschnittenem Text helfen. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: false,
            onChange: () => window.location.reload()
        }
    }
];
