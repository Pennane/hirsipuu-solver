import fs from 'fs/promises'

let _words: string[]

const getWords = async () => {
    if (_words) {
        return _words
    }

    const file = await fs.readFile('/Users/arttupennanen/Desktop/projects/word/words.txt', 'utf8')
    _words = file.split('\n')
    return _words
}

async function main(argv: string[]) {
    const args = argv.slice(2)
    if (!args[0]) return console.log('hirsibuu <state> [invalid]')

    const words = await getWords()
    const [solveState, invalidCharacters = ''] = args

    const prior = [...new Set(solveState.replace(/[\?\-\_\.\,\s]/g, '').split(''))].join('')

    const invalid = [
        ...new Set(
            solveState
                .replace(/[\?\-\_\.\,\s]/g, '')
                .concat(invalidCharacters)
                .split('')
        )
    ].join('')

    const regexp = new RegExp(`^${solveState.replace(/[\?\-\_\.\,\s]/g, `[^${invalid}]`)}$`)

    const matches = words.filter((w) => regexp.test(w))
    const quantities: { [char: string]: number } = {}

    for (const [index, word] of matches.entries()) {
        const unlisted = new Set(word.replace(new RegExp(`[${prior}]`, 'g'), '').split(''))

        unlisted.forEach((c) => (c in quantities ? quantities[c]++ : (quantities[c] = 1)))

        if (index < 5) {
            console.log(index, ':', word)
        }
    }

    console.log('')

    const mostOccuring = Object.entries(quantities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    for (const [char, amount] of mostOccuring) {
        console.log(char, 'in', amount, 'of', matches.length, 'words')
    }
}

main(process.argv)
