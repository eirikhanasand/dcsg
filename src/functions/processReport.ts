import interestingFields from "../content/interestingFields.js"
import keyFields from "../content/keyFields.js"

export default function processReport(raw: string) {
    const {keys, values} = regexUcReport(raw)

    let errors = 0
    let connections = 0
    let requests = 0
    let reply_size = 0
    let favorite: FlattenedObject = {}

    keys.forEach((key: string, index: number) => {
        if (interestingFields.includes(key)) {
            if (keyFields.includes(key)) {
                favorite[key] = values[index]
            }

            if (key.includes('error') && Number(values[index]) > 0) {
                favorite[key] = values[index]
                errors += Number(values[index])
                favorite.errors = errors
            }

            if (key === 'requests') {
                requests += Number(values[index])
            }

            if (key === 'connections') {
                connections += Number(values[index])
            }

            if (key.includes('reply_size')) {
                reply_size += Number(values[index])
            }

            if (key === 'rate' && Number(values[index]) < 2) {
                favorite.rate = values[index]
            }
        }
    })

    favorite.reply_size = reply_size
    favorite.unhandledRequests = requests - connections

    console.log("fav", favorite)
    return favorite
}

function regexUcReport(data: string): NestedObject {
    const keys = []
    const values = []
    const regex = /"([^"]*)": "([^"]*)"/g
    let match

    while ((match = regex.exec(data)) !== null) {
        keys.push(match[1])
        values.push(match[2])
    }

    return { keys, values }
}