<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	// const Datastore = require("nedb");
	import * as deTradegoods from '../compendium/dnd5e.tradegoods.json';
// 	import * as Datastore from 'nedb';
// 	const trade = new Datastore({ filename: "../packs/tradegoods.db", timestampData: true });

// 	trade.loadDatabase(err => {
	
// 	if (err) {
// 		console.error(err);
// 	} else {
// 		console.log("Connected to Tradegoods DB");
// 	}
	
// });
// safe input

	function safeAtJson(file, index, entry, value, position) {
		
		
		console.log(entry[position])
		var data = JSON.stringify({ position:value });
		console.log(entry);
		
	}

	// on click set
	const shown = [];

	// const section

	
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	
	<div class="main">
		<h1>
		Foundry VTT DnD5e übersetzung
		</h1>
		<div class="wrapper">

			<div class="en-translation">
				<h2>Englisch</h2>
			
			</div>
			<div class="de-translation">
				<h2>Deutsch</h2>
				{#each deTradegoods.entries as tradegood, i}
				<div class="container">

					<div class="flex">
						<div class="en-div">
							<h3>
								Englisches Original
							</h3>
							<p>
								{tradegood.id}
							</p>
						</div>
						<div class="de-div">
							<h3>
								Deutsche übersetzung
							</h3>
								<input type="text" id="{tradegood.id}" name="dtname" bind:value="{tradegood.name}" disabled={!shown[i]}>
								{#if !shown[i]}
									<button on:click={() => shown[i] = !shown[i]} class="btn">Edit</button>
								{:else}					
									<button on:click={() => {
										console.log(tradegood.name);
										
										safeAtJson(deTradegoods, i, tradegood, tradegood.name, 'name');
										shown[i] = !shown[i];
									}} class="edit">Safe</button>
								{/if}
						</div>
					</div>
						<div class="de-description">
							<h3>Beschreibung</h3>
							{tradegood.description}
						</div>
						<div class="de-source">
							<h3>Seite im Buch</h3>
							{tradegood.source}
						</div>
				</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.main {
		margin: 0 auto;
		width: 960px;
	}

	h1 {
		width: 100%;
	}
	.wrapper {
		display: flex;
	}
	.container {
		border: 1px solid #000;
		border-radius: 5px;
		padding: 10px;
		margin-bottom: 10px;
	}

	.en-translation {
		width: 480px;
	}

	.de-translation {
		width: 480px;
	}

	.de-div {
		flex: 0 260px;
	}

	.de-word {
		display: flex;
		justify-content: space-between;
	}
	.flex {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

</style>
