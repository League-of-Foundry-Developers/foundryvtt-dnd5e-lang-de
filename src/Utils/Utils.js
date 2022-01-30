const moduleName = 'foundry-mgl';
const moduleTitle = 'Foundry Meters, Grams & Liters';

const consoleLog = (output) => {
    console.log(
        `%c${moduleTitle} %c|`,
        'background: #222; color: #bada55',
        'color: #fff',
        output
    );
}

const consoleTrace = (output) => {
    console.groupCollapsed(
        `%c${moduleTitle} %c|`,
        'background: #222; color: #bada55',
        'color: #fff',
        output
    );
    console.trace();
    console.groupEnd();
}

const getRandomItemFromList = (list) => {
    return typeof list !== "undefined" && list?.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
}

const loading = (context) => {
    const $loading = $('#loading');
    const $loadingBar = $loading.find('#loading-bar');
    const $context = $loadingBar.find('#context');
    const $progress = $loadingBar.find('#progress');
    $context.text(context || '');

    return (min) => (max) => () => {
        if (min >= max) {
            $loading.fadeOut();
            return;
        }

        const percentage = Math.min(Math.floor(min * 100 / max), 100);
        $loading.fadeIn();
        $progress.text(`${percentage}%`);
        $loadingBar.css('width', `${percentage}%`);

        ++min;
    }
}

const cache = () => {
    let cacheVar = new Map();
    return async (compendiumObject, compendiumId) => {
        cacheVar[compendiumId] = cacheVar[compendiumId] || await compendiumObject.getIndex();
        return cacheVar;
    }
}

const copyObject = (object) => JSON.parse(JSON.stringify(object));

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export {cache, getRandomItemFromList, loading, consoleLog, moduleName, moduleTitle, copyObject, capitalize};
