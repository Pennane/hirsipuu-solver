import fs from 'fs/promises'

let _words: string[]

const getWords = async () => {
    if (_words) {
        return _words
    }

    const file = await fs.readFile('./words.txt', 'utf8')
    _words = file.split('\n')
    return _words
}

async function main(argv: string[]) {
    const args = argv.slice(2)

    if (!args[0]) return console.log('hirsibuu <state> [invalid]')

    const words = await getWords()

    const [solveState, invalidCharacters = ''] = args
    const notPossibleString = [...new Set(solveState.replaceAll('?', '').concat(invalidCharacters).split(''))].join('')

    const regexp = new RegExp(`^${solveState.replaceAll('?', `[^${notPossibleString}]`)}$`)
    const matches = words.filter((w) => regexp.test(w))

    for (const [index, word] of matches.entries()) {
        console.log(index, ':', word)
    }
}

main(process.argv)
