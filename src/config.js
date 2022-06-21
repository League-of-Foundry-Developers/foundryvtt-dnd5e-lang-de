export default {
    SETTINGS:[
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
    ],
    CONVERTER: [
        {
            key: "conversionMultipliers",
            data: {
                type: String,
                default: "{\"inch\": 2.5, \"feet\": 0.3, \"mile\": 1.6, \"pound\": 0.5, \"gallon\": 3.5}",
                scope: "world",
                config: false,
                restricted: true,
            },
        },
        {
            key: "inchConversionMultiplier",
            data: {
                name: "Inch Umwandlungsmultiplikator: ",
                hint: "1 inch = so viele Zentimeter",
                type: Number,
                default: 2.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "feetConversionMultiplier",
            data: {
                name: "Feet Umwandlungsmultiplikator: ",
                hint: "1 feet = so viele Meter",
                type: Number,
                default: 0.3,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "mileConversionMultiplier",
            data: {
                name: "Meile Umwandlungsmultiplikator: ",
                hint: "1 mile = so viele Kilometer",
                type: Number,
                default: 1.6,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "poundConversionMultiplier",
            data: {
                name: "Pfund-Umrechnungsmultiplikator: ",
                hint: "1 Pfund = so viele Kilogramm",
                type: Number,
                default: 0.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "gallonConversionMultiplier",
            data: {
                name: "Gallonen-Umwandlungsmultiplikator: ",
                hint: "1 Gallone = so viele Liter",
                type: Number,
                default: 3.5,
                scope: "world",
                config: true,
                restricted: true,
            },
        },
        {
            key: "sceneConversion",
            data: {
                name: "Aktivieren Sie die Szenenkonvertierung: ",
                hint: "Diese Einstellung ermöglicht die automatische Konvertierung von Szeneneinstellungen.",
                type: Boolean,
                default: true,
                scope: "world",
                config: true,
                restricted: true,
            }
        },
        {
            key: "sceneGridDistance",
            data: {
                name: "Szenenrasterabstand: ",
                hint: "Konvertierte Größe für ein einzelnes Quadrat. Warnung: Dies wirkt sich nicht auf die Konvertierung auf dem Blatt aus",
                type: Number,
                default: 1.5,
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: "sceneGridUnits",
            data: {
                name: "Szenenrastereinheiten: ",
                hint: "Warnung: Dies wirkt sich nicht auf die Konvertierung auf dem Blatt aus",
                type: String,
                default: "m",
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: "forceShortening",
            data: {
                name: "Einheitenverkürzung erzwingen?",
                hint: "Abgekürzte Einheiten erzwingen (Pfund -> kg)",
                type: Boolean,
                default: false,
                scope: "world",
                config: true,
                restricted: true,
            }

        },
        {
            key: 'buttonHidden',
            data: {
                name: 'Metrify-Schaltfläche ausblenden',
                hint: 'Aktivieren Sie dieses Kontrollkästchen, wenn Sie möchten, dass die Metrify-Schaltfläche ausgeblendet wird',
                type: Boolean,
                default: false,
                scope: 'client',
                config: true
            }
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
            name: 'Zeige Updatedialog',
            hint: 'Zeigt den Changelog / Update-Dialog.',
            scope: 'world',
            type: Boolean,
            config: true,
            default: true
        }
    }
];

}
