export default [
  {
    name: 'overrideSkillSortAlpha',
    data: {
        name: 'Fertigkeiten alphabetisch sortieren',
        hint: 'Sortiert die Fertigkeitsliste alphabetisch.',
        scope: 'client',
        type: Boolean,
        config: true,
        default: true
    },
    name: 'enableCompendiumTranslation',
    data: {
        name: 'Kompendiuminhalte übersetzen',
        hint: 'Übersetzen der Kompendiuminhalte. Benötigt das Babele-Modul.',
        scope: 'client',
        type: Boolean,
        config: true,
        default: true
    }
  },
];
