
const createErrorMessage = (error, source, workingParameters) => {
    console.error(`The following error has occurred while working on ${source}, with the following parameters ${workingParameters}`);
    console.error(error);
}

export {createErrorMessage}