<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import * as deTradegoods from '../../../compendium/dnd5e.tradegoods.json'
	// import * as enTradegoods from '../packs/tradegoods.json'
	// console.log('en', enTradegoods);
	let shown = false;
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	
	<div class="main">
		<h1>
		Foundry VTT DnD52 übersetzung
		</h1>
		<div class="wrapper">

			<div class="en-translation">
				<h2>Englisch</h2>
			</div>
			<div class="de-translation">
				<h2>Deutsch</h2>
				{#each deTradegoods.entries as tradegood}
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
							<p>
								{tradegood.name}<button on:click={() => shown = !shown} class="edit">edit</button>
							</p>
							{#if shown}
								<input type="text" id="de.tradegood.name" name="dtname" value="{tradegood.name}">
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
	.flex {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

</style>
