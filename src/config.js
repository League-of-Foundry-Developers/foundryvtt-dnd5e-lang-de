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
        name: 'oglOverrideSkillSortAlpha',
        data: {
            name: 'Fertigkeiten alphabetisch sortieren (5e OGL Character Sheet)',
            hint: 'Sortiert die Fertigkeitenliste alphabetisch.',
            scope: 'client',
            type: Boolean,
            config: true,
            default: false
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
        name: 'enableRangeTranslation',
        data: {
            name: 'Reichweite übersetzen',
            hint: 'Die Reichweite von Gegenständen und Zaubern wird in Meter (m) bzw. Kilometer (km) umgerechnet. Für Gewichtseinheiten existiert eine Systemeinstellung. (Bei Änderung wird Foundry neu geladen.)',
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
            hint: 'Übersetzt die Abkürzungen für Buchtitel in Quellenangaben, z.B. wird aus PHB (Player\'s Handbook) dann SHB (Spielerhandbuch). (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    },
    {
        name: 'compendiumSrcKeepOriginal',
        data: {
            name: 'Englische Quellenangabe mit anzeigen',
            hint: 'Englische Quellenangaben/Seitenzahlen werden zusätzlich in Klammern angegeben. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
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
    },
    {
        name: 'translationDialog',
        data: {
            name: 'Dialog Fenster anzeigen',
            hint: 'Aktiviere oder Deaktiviere den Begrüßungs Dialog',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    }
];
