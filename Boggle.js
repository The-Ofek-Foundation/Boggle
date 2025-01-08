let docWidth, docHeight;

let dimensions, tileShape;

const canvas = getElemId('board');
let canvasWidth, canvasHeight, tileSize, minWordLength;
const brush = canvas.getContext('2d');

let letters;
let gameSolution;

function pageReady() {
	newGame();
	setTimeout(resizeSettingsTable, 0);
}

function newGame() {
    getSettings();
    populateSettingsForm(gameSettings.getSettings());
    resizeCanvas();
    const numLetters = dimensions[0] * dimensions[1];
    const numWordsInGoodGame = Math.round(numLetters * 20);
    const numLongWordsInGoodGame = Math.round(numLetters);
    gameSolution = new GameSolution(minWordLength);
    getRandomLetters();
    while (true) {
        solveGame();
        console.log(gameSolution.getWordCount() + ' words');
        console.log(gameSolution.getWordsOfLength(minWordLength + 4).length + ' long words');
        if (gameSolution.getWordCount() >= numWordsInGoodGame && gameSolution.getWordsOfLength(minWordLength + 2).length >= numLongWordsInGoodGame)
            break;
        break;
        setRandomLetters();
        gameSolution.reset();
    };

    gameSolution.printWords();
    
    drawCanvas();
}

function getRandomLetters() {
    letters = [];
    for (let i = 0; i < dimensions[0]; ++i) {
        letters.push([]);
        for (let j = 0; j < dimensions[1]; ++j)
            letters[i].push(getRandomLetter());
    }
}

// more efficient, assumes that the dimensions are the same
function setRandomLetters() {
    for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; ++j)
            letters[i][j] = getRandomLetter();
    }
}

function resizeCanvas() {
    docWidth = getElemWidth(contentWrapper);
	docHeight = getElemHeight(contentWrapper);

    let aspectRatio = docWidth / docHeight;
    let desiredAspectRatio = dimensions[0] / dimensions[1];

    canvasWidth = aspectRatio > desiredAspectRatio ? docHeight * desiredAspectRatio : docWidth;
    canvasHeight = aspectRatio > desiredAspectRatio ? docHeight : docWidth / desiredAspectRatio;
    tileSize = canvasWidth / dimensions[0];

    setElemWidth(canvas, canvasWidth);
    setElemHeight(canvas, canvasHeight);
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    setElemStyle(canvas, 'left', (docWidth - canvasWidth) / 2 + 'px');
    setElemStyle(canvas, 'top', (docHeight - canvasHeight) / 2 + 'px');

    resizeSettingsTable();
}

function onResize() {
	resizeCanvas();
	drawCanvas();
}

function drawCanvas() {
    brush.clearRect(0, 0, canvasWidth, canvasHeight);

    drawGrid();
    drawLetters();
}

function drawLetters() {
    brush.font = tileSize / 2 + 'px Arial';
    brush.textAlign = 'center';
    brush.textBaseline = 'middle';
    brush.fillStyle = 'black';

    for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; ++j) {
            let x = i * tileSize + tileSize / 2;
            let y = j * tileSize + tileSize / 2;
            brush.fillText(letters[i][j], x, y);
        }
    }
}

function drawGrid() {
    brush.strokeStyle = 'black';
    brush.lineWidth = 1;
    brush.beginPath();
    for (let i = 1; i < dimensions[0]; ++i) {
        brush.moveTo(i * tileSize, 0);
        brush.lineTo(i * tileSize, canvasHeight);
    }

    for (let i = 1; i < dimensions[1]; ++i) {
        brush.moveTo(0, i * tileSize);
        brush.lineTo(canvasWidth, i * tileSize);
    }
    brush.stroke();
    brush.closePath();
}

function getSettings() {
	dimensions = gameSettings.getOrSet('dimensions', [5, 5]);
	minWordLength = gameSettings.getOrSet('min_word_length', 4);
    tileShape = gameSettings.getOrSet('tile_shape', 'square');
}

const weightedAlphabet = new Map([
    ['E', 150],
    ['A', 104],
    ['I', 91],
    ['O', 77],
    ['N', 78],
    ['R', 78],
    ['T', 75],
    ['L', 52],
    ['D', 52],
    ['S', 82],
    ['U', 39],
    ['G', 39],
    ['B', 25],
    ['C', 26],
    ['M', 26],
    ['P', 26],
    ['F', 26],
    ['H', 16],
    ['V', 26],
    ['W', 26],
    ['Y', 26],
    ['K', 13],
    ['J', 3],
    ['X', 13],
    ['Q', 3],
    ['Z', 13],
]);

let totalWeight = Array.from(weightedAlphabet.values()).reduce((a, b) => a + b, 0);

function getRandomLetter() {
    let random = Math.random() * totalWeight;
    for (let [letter, weight] of weightedAlphabet) {
        random -= weight;
        if (random <= 0) return letter;
    }
}

const longestWordLength = 15;
// const wordScore = [0, 0, 0, 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
//                 0  1  2  3  4  5  6  7  8   9  10  11  12  13   14   15   16

class GameSolution {
    constructor(minWordLength) {
        this.minWordLength = minWordLength;
        this.wordScore = new Array(longestWordLength + 1).fill(0);
        this.wordScore[minWordLength] = 1;
        this.wordScore[minWordLength + 1] = 2;
        for (let i = minWordLength + 2; i <= longestWordLength; ++i)
            this.wordScore[i] = this.wordScore[i - 1] + this.wordScore[i - 2];
        this.reset();
    }

    addWord(word) {
        this.wordsOfLength[word.length].push(word);
        this.wordCount++;
        this.maxScore += this.wordScore[word.length];
    }

    getGameScore() {
        const numLetters = dimensions[0] * dimensions[1];
        // return 
    }

    getWordCount() {
        return this.wordCount;
    }

    getMaxScore() {
        return this.maxScore;
    }

    getWordsOfLength(length) {
        return this.wordsOfLength[length];
    }

    reset() {
        this.wordsOfLength = [];
        for (let i = 0; i <= longestWordLength; ++i)
            this.wordsOfLength.push([]);
        this.wordCount = 0;
        this.maxScore = 0;
    }

    printWords() {
        for (let i = this.minWordLength; i < this.wordsOfLength.length; ++i) {
            if (this.wordsOfLength[i].length === 0) continue;

            console.log(`${i} letter words (${this.wordsOfLength[i].length}):`);
            for (let j = 0; j < this.wordsOfLength[i].length; ++j)
                console.log(`${j + 1}. `.padStart(5) + this.wordsOfLength[i][j]);
        }
    }

    showModal() {
        let lines = [];

        for (let i = this.wordsOfLength.length - 1; i >= this.minWordLength; --i) {
            if (this.wordsOfLength[i].length === 0) continue;

            lines.push(`${i} letter words (${this.wordsOfLength[i].length}):`);
            for (let j = 0; j < this.wordsOfLength[i].length; ++j)
                lines.push(`${j + 1}. &emsp;` + this.wordsOfLength[i][j]);

            if (i !== this.minWordLength) lines.push('');
        }

        showInfoModal('Solutions', ...lines);
    }
}

function solveGame() {
    const startingLetters = getStartingLetterMap();
    gameSolution.reset();
    const visited = getVisitedArray();

    for (let word of words) {
        if (word.length < minWordLength) continue;
        if (!startingLetters.has(word[0])) continue;

        for (let [i, j] of startingLetters.get(word[0]))
            if (containsWord(word, i, j, word, visited)) {
                gameSolution.addWord(word);
                break;
            }
    }
}

const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [ 0, -1],          [ 0, 1],
    [ 1, -1], [ 1, 0], [ 1, 1],
];

function containsWord(word, i, j, index, visited) {
    if (word[index] === 'Q') {
        ++index;
        if (word[index] !== 'U') return false;
        if (index === word.length - 1) return true;
    }

    visited[i][j] = true;

    for (const [di, dj] of directions) {
        const newI = i + di;
        const newJ = j + dj;
        if (newI < 0 || newI >= dimensions[0] || newJ < 0 || newJ >= dimensions[1]) continue;
        if (letters[newI][newJ] !== word[index + 1]) continue;
        if (visited[newI][newJ]) continue;

        if (index + 1 === word.length - 1) {
            visited[i][j] = false;
            return true;
        }

        if (containsWord(word, newI, newJ, index + 1, visited)) {
            visited[i][j] = false;
            return true;
        }
    }
    visited[i][j] = false;
    return false;
}

function getStartingLetterMap() {
    const startingLetters = new Map();
    for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; ++j) {
            const letter = letters[i][j];
            if (!startingLetters.has(letter)) startingLetters.set(letter, []);
            startingLetters.get(letter).push([i, j]);
        }
    }
    return startingLetters;
}

function getVisitedArray() {
    const visited = [];
    for (let i = 0; i < dimensions[0]; ++i) {
        visited.push([]);
        for (let j = 0; j < dimensions[1]; ++j)
            visited[i].push(false);
    }
    return visited;
}

function runSimulation() {
    gameSolution.reset();
    setRandomLetters();
    solveGame();
}

function simulateAverageScore() {
    let totalScore = 0;
    let numSimulations = 0;
    const startTime = Date.now();
    let timesConsecutive = 0;

    for (let i = 0; i < 10; ++i, ++numSimulations) {
        runSimulation();
        totalScore += gameSolution.getWordCount();
    }

    let averageScore = Math.round(totalScore / numSimulations);

    while (true)
    {
        console.log(`Average score: ${averageScore} (${numSimulations} simulations) (${Date.now() - startTime} ms)`);
        for (let i = 0; i < 10; ++i, ++numSimulations) {
            runSimulation();
            totalScore += gameSolution.getWordCount();
        }

        let newAverageScore = Math.round(totalScore / numSimulations);
        if (newAverageScore === averageScore) timesConsecutive++;
        else timesConsecutive = 0;

        if (timesConsecutive >= 5) break;
        averageScore = newAverageScore;
    }

    console.log(`Final average score: ${averageScore} (${numSimulations} simulations) (${Date.now() - startTime} ms)`);

    return averageScore;
}

function findBestAlphabetWeight(precision = 10) {
    totalWeight = Array.from(weightedAlphabet.values()).reduce((a, b) => a + b, 0);

    getRandomLetters(); // initialize letters array
    gameSolution = new GameSolution(minWordLength);

    let averageScore = simulateAverageScore();
    console.log('Baseline score: ' + averageScore);

    const allLetterEntriesShuffled = Array.from(weightedAlphabet.entries()).sort(() => Math.random() - 0.5);

    for (let [letter, weight] of allLetterEntriesShuffled) {
        console.log('Testing letter ' + letter);

        // try increasing the weight until the score decreases
        let increased = false;
        while (true) {
            if (weight + precision > 200) break; // don't go above 200
            console.log(`Increasing weight of ${letter} to ${weight + precision}`);
            weightedAlphabet.set(letter, weight + precision);
            totalWeight += precision;
            let newAverageScore = simulateAverageScore();

            if (newAverageScore < averageScore) {
                weightedAlphabet.set(letter, weight);
                totalWeight -= precision;
                break;
            }
            averageScore = newAverageScore;
            weight = weightedAlphabet.get(letter);
            increased = true;
        }

        // try decreasing the weight until the score decreases
        if (!increased)
            while (true) {
                if (weight <= precision) break; // don't go below 0
                console.log(`Decreasing weight of ${letter} to ${weight - precision}`);
                weightedAlphabet.set(letter, weight - precision);
                totalWeight -= precision;
                let newAverageScore = simulateAverageScore();
                if (newAverageScore < averageScore) {
                    weightedAlphabet.set(letter, weight);
                    totalWeight += precision;
                    break;
                }
                averageScore = newAverageScore;
                weight = weightedAlphabet.get(letter);
            }

        console.log(`Final weight of ${letter}: ${weight}`);
    }
}

function getNewSettings() {
    return {
        dimensions: [getInputValue('numRows'), getInputValue('numCols')],
    }
}

function populateSettingsForm() {
    setInputValue('numRows', dimensions[0]);
    setInputValue('numCols', dimensions[1]);
}

document.addEventListener('keypress', function (event) {
	switch (event.key) {
        case 's':
            // show solutions in a model
            gameSolution.showModal();
    }
});
