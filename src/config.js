export default [
    {
        name: 'overrideSkillSortAlpha',
        onlyUntilSystemVersionIncluding: '1.2.4',
        data: {
            name: 'Fertigkeiten alphabetisch sortieren',
            hint: 'Sortiert die Fertigkeitsliste alphabetisch.',
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
    }
];
