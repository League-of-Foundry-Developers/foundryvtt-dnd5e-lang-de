const digits = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9
}

const tens = {
    'ten': 10,
    'twenty': 20,
    'thirty': 30,
    'forty': 40,
    'fifty': 50,
    'sixty': 60,
    'seventy': 70,
    'eighty': 80,
    'ninety': 90
}

const irregulars = {
    'eleven': 11,
    'twelve': 12,
    'thirteen': 13,
    'fourteen': 14,
    'fifteen': 15,
    'sixteen': 16,
    'seventeen': 17,
    'eighteen': 18,
    'nineteen': 19,
}

const bigTens = {
    'hundred': 100,
    'thousand': 1000,
}

const compositions = () => {
    const composites = {};
    for (const ten in tens) for (const digit in digits) composites[`${ten} ${digit}`] = tens[ten] + digits[digit];
    for (const bigTen in bigTens) for (const digit in digits) composites[`${digit} ${bigTen}`] = digits[digit] * bigTens[bigTen];
    return composites;
}

const allTheNumbers = {};

const numbersMerger = () => {
    Object.assign(allTheNumbers, digits, tens, irregulars, bigTens);
    Object.assign(allTheNumbers, compositions());
}

const isKeyWord = (word) => {
    if (word === 'several') return true;
    return false;
}

const constructLeftOverText = (currentText, word) => {
    if (allTheNumbers[word]) {
        return [currentText + `${word} `, '']
    }
    return [currentText, `${word} `];
}


const constructFinalText = (word1, word2) => {
    const leftoverConstruct = constructLeftOverText('', word1);
    const text1 = leftoverConstruct[0];
    const leftOver1 = leftoverConstruct[1];

    const finalLeftOverConstruct = constructLeftOverText(text1, word2);
    const finalText = finalLeftOverConstruct[0].trim();
    const finalLeftOver = leftOver1 + finalLeftOverConstruct[1];

    return [finalText, finalLeftOver];
}
/**
 * Constructs an object that contains a string that doesn't contain numbers (called leftOver in the variables)
 * And a number that represents the extracted number from the text
 *
 * @param word1
 * @param word2
 */
const numberSelector = (word1, word2) => {
    numbersMerger();
    let outObject = {
        text: `${word1} ${word2}`,
        number: null
    }
    if (isKeyWord(word1)) return outObject;

    const final = constructFinalText(word1, word2);

    for (const numbers in allTheNumbers) if (final[0] === numbers) {
        outObject.text = final[1];
        outObject.number = allTheNumbers[numbers];
        return outObject;
    }
    return outObject;
}

const numberToWords = (number) => {
    numbersMerger();
    for (const numbers in allTheNumbers) if (allTheNumbers[numbers] === number) return numbers;
    return number;
}

export {numberSelector, numberToWords};