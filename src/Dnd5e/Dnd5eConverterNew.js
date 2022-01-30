import {
    actorDataConverter, actorTokenConverter, convertDistance,
    convertStringFromImperialToMetric, convertText,
    convertValueToMetric, labelConverter, relinkText,
} from "../Utils/ConversionEngineNew.js";
import {loading} from "../Utils/Utils.js";
import {createErrorMessage} from "../Utils/ErrorHandler.js";
import {createNewCompendium, createNewCompendiumMeta, relinkCompendiums, typeSelector} from "./Compendium5eConverter.js";


const itemUpdater = async (item, onlyLabel, onlyUnit) => {
    if (item.getFlag("Foundry-MGL", "converted")) return;
    const itemClone = JSON.parse(JSON.stringify(item));

    if (!onlyLabel) itemClone.data.description.value = convertText(itemClone.data.description.value);
    if (!onlyLabel) itemClone.data.weight = convertValueToMetric(itemClone.data.weight, 'pound');

    itemClone.data.target = convertDistance(itemClone.data.target, onlyUnit);
    itemClone.data.range = convertDistance(itemClone.data.range, onlyUnit);

    if (item.labels.range) item.labels.range = labelConverter(item.labels.range);

    try {
        await item.setFlag("Foundry-MGL", "converted", true);
    } catch (e) {
        createErrorMessage(e, `${itemClone.name}.setFlag()`, item);
    }
    try {
        await item.update(itemClone);
    } catch (e) {
        createErrorMessage(e, `${itemClone.name}.update`, itemClone);
    }
}

const itemsUpdater = async (items, onlyLabel, onlyUnit) => {
    for (const item of items) await itemUpdater(item, onlyLabel, onlyUnit);
}

const actorUpdater = async (actor, onlyLabel, onlyUnit) => {
    const actorClone = JSON.parse(JSON.stringify(actor));

    if (!actor.getFlag("Foundry-MGL", "converted")) {
        actorClone.data = actorDataConverter(actorClone.data);
        actorClone.token = actorTokenConverter(actorClone.token);
    }

    try {
        await actor.update(actorClone);
        await actor.setFlag("Foundry-MGL", "converted", true);
    } catch (e) {
        createErrorMessage(e, 'actor.update', actorClone.data);
    }

    await itemsUpdater(actor.items, onlyLabel, onlyUnit)
}

const journalUpdater = async (journal) => {
    const journalClone = JSON.parse(JSON.stringify(journal));

    journalClone.content = convertText(journalClone.content);
    journalClone.content = await relinkText(journalClone.content)

    try {
        await journal.update(journalClone);
    } catch (e) {
        createErrorMessage(e, journalClone.name, journal);
    }

}

const allScenesUpdater = async () => {
    for (const scene of game.scenes.entities) {
        if (scene._view === true) continue;
        const sceneClone = JSON.parse(JSON.stringify(scene));
        sceneClone.gridDistance = convertValueToMetric(sceneClone.gridDistance, sceneClone.gridUnits);
        sceneClone.gridUnits = convertStringFromImperialToMetric(sceneClone.gridUnits);

        try {
            await scene.update(sceneClone);
        } catch (e) {
            createErrorMessage(e, sceneClone.name, sceneClone);
        }
    }
}

const rollTableUpdater = async (rollTable) => {
    const rollTableClone = JSON.parse(JSON.stringify(rollTable));

    if (rollTableClone.description) rollTableClone.description = convertText(rollTableClone.description);
    rollTableClone.results.forEach((result) => {
        result.text = convertText(result.text)
    })

    try {
        await rollTable.update(rollTableClone);
    } catch (e) {
        createErrorMessage(e, rollTableClone.name, rollTableClone);
    }
}

const compendiumUpdater = (typeSelector) => async (compendium) => {
    try {
        const pack = game.packs.get(compendium.collection || compendium);
        await pack.getIndex();
        const newPack = await pack.duplicateCompendium({
            label: `${pack.metadata.label} Metrified`
        })
        await newPack.getIndex();

        const loadingBar = loading(`Converting compendium ${pack.metadata.label}`)(0)(pack.index.size - 1);
        for (const index of newPack.index) {
            try {
                const entity = await newPack.getDocument(index._id);
                let entityClone = JSON.parse(JSON.stringify(entity.data));

                entityClone = typeSelector(entityClone, entity.constructor.name);

                await entity.update(entityClone);

                loadingBar();
            }
            catch (e) {
                createErrorMessage(e, 'compendiumUpdater', compendium);
            }
        }
    } catch (e) {
        createErrorMessage(e, 'compendiumUpdater', compendium);
    }
}

const batchCompendiumUpdater = (typeSelector, relinkTypeSelector) => (compendiums) =>  async () => {
    for (const compendium of compendiums)
        if (!compendium.includes('metrified')) await compendiumUpdater(typeSelector)(compendium);
    await relinkCompendiums(relinkTypeSelector);
}

export {actorUpdater, itemUpdater, journalUpdater, rollTableUpdater, compendiumUpdater, allScenesUpdater, batchCompendiumUpdater}
