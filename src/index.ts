import fs from 'fs/promises'
import path from 'path'

const occuranceInString = (character: string, word: string): number => {
    return word.split(character).length - 1
}

export const worth = {
    a: 1,
    k: 2,
    o: 1,
    n: 2,
    e: 1,
    s: 2,
    l: 2,
    i: 1,
    t: 2,
    u: 1,
    j: 2,
    ä: 1,
    r: 2,
    y: 3,
    m: 2,
    h: 2,
    p: 2,
    g: 5,
    v: 2,
    d: 5,
    ö: 1,
    b: 5,
    c: 5,
    f: 5,
    z: 5,
    w: 5,
    q: 5,
    x: 5
}

let _words: string[]

const getWords = async () => {
    if (_words) {
        return _words
    }

    const file = await fs.readFile(path.join(__dirname, '../assets/words.txt'), 'utf8')
    _words = file.split('\n')
    return _words
}

async function main(argv: string[]) {
    const args = argv.slice(2)
    if (!args[0]) return console.log('hirsibuu <state> [invalid]')

    const words = await getWords()
    const [wordState, knownInvalid = ''] = args

    const appeared = [...new Set(wordState.replace(/[\?\-\_\.\,\s]/g, '').split(''))].join('')

    const invalid = [
        ...new Set(
            wordState
                .replace(/[\?\-\_\.\,\s]/g, '')
                .concat(knownInvalid)
                .split('')
        )
    ].join('')

    const regexp = new RegExp(`^${wordState.replace(/[\?\-\_\.\,\s]/g, `[^${invalid}]`)}$`)

    const matches = words.filter((w) => regexp.test(w))
    const occurrances: { [char: string]: number } = {}
    const quantities: { [char: string]: number } = {}

    for (const [index, word] of matches.entries()) {
        const unlisted = new Set(word.replace(new RegExp(`[${appeared}]`, 'g'), '').split(''))

        unlisted.forEach((c) => {
            if (c in occurrances) {
                occurrances[c]++
                quantities[c] += occuranceInString(c, word)
            } else {
                occurrances[c] = 1
                quantities[c] = occuranceInString(c, word)
            }
        })

        if (index < 5) {
            console.log(index, ':', word)
        }
    }

    console.log('')

    const mostOccuring = Object.entries(occurrances)
        .sort((a, b) => {
            if (a[1] === b[1]) {
                return (
                    (worth[b[0] as keyof typeof worth] * quantities[b[0]]) / b[1] -
                    (worth[a[0] as keyof typeof worth] * quantities[a[0]]) / a[1]
                )
            }

            return b[1] - a[1]
        })
        .slice(0, 5)

    for (const [c, a] of mostOccuring) {
        const k = c as keyof typeof worth
        console.log(
            c,
            'in',
            a,
            'of',
            matches.length,
            'words',
            `(≈ ${(quantities[c] / a).toFixed(2)} pc or ≈ ${Math.round(
                (quantities[c] / a) * (worth.hasOwnProperty(k) ? worth[k] : 1)
            )} points)`
        )
    }
}

main(process.argv)
