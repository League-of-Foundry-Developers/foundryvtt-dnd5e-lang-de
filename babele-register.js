Hooks.once('init', () => {

	if(typeof Babele !== 'undefined') {

		Babele.get().register({
			module: 'FoundryVTT-dnd5e-DE',
			lang: 'de',
			dir: 'compendium'
		});		
	}
});