<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
import { onMount } from "svelte";


	export let file;
	let items = [];
	let filename = [];

	// safe input
	const handelClick = (index, name) => {
		if (shown[name][index]) safeAtJson(items[index]);	
		shown[name][index] = !shown[name][index];
	}

	async function safeAtJson(entry) {	
		entry.file = file;
		var data = JSON.stringify(entry);
		// ToDo Try Catcher
		const result = await fetch(`/api.json`, {method:'POST', body: data});

	}

	// on click set
	const shown = {
		desc : [],
		name: [],
		source: [],
	};
	// const section

onMount(async () => {
	const response = await fetch('/api.json?file=' + file);
	const json = await response.json();
	console.log(json.label);
	filename = json.label
	items = Object.entries(json.entries)
		.map(([key, value]) => {
			return Object.assign(value, {id: key})
		});	
});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>

	
	<div class="main">
		<h1>
		Foundry VTT DnD5e übersetzung
		</h1>
		<h2>{filename}</h2>
		<div class="wrapper">

			<div class="en-translation">
				<h2>Englisch</h2>
			
			</div>
			<div class="de-translation">
				<h2>Deutsch</h2>
				{#each items as item, i}

				<div class="container">

					<div class="flex">
						<div class="en-div">
							<h3>
								Englisches Original
							</h3>
							<p>
							{item.id}
							</p>
						</div>
						<div class="de-div">
							<h3>
								Deutsche übersetzung
							</h3>
								<input type="text" id="{item.id}" name="dtname" bind:value="{item.name}" disabled={!shown.name[i]}>
								<button on:click={() => handelClick(i, 'name')} class="btn">
									{shown.name[i] ?'safe' : 'Edit'}
								</button>
						</div>
					</div>
						<div class="de-description">
							<h3>Beschreibung</h3>
							<textarea type="text" id="{file + '.description.' + [i]}" bind:value="{item.description}" cols="50" rows="10" disabled={!shown.desc[i]}></textarea>
							<button on:click={() => handelClick(i, 'desc')} class="btn" id="{file + '.description.' + [i]}">
								{shown.desc[i] ? 'safe' : 'Edit'}
							</button>
						</div>
						<div class="de-source">
							<h3>Seite im Buch</h3>
							<input type="text" id="{'source ' + [i]}" name="dtsource" bind:value="{item.source}" disabled={!shown.source[i]}>
							<button on:click={() => handelClick(i, 'source')} class="btn">
								{shown.source[i] ?'safe' : 'Edit'}
							</button>					
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
