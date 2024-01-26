import interestingFields from "../content/interestingFields.js"
import keyFields from "../content/keyFields.js"
import splitObject from "./splitObject.js"

const Keys = [] as string[]
const Values = [] as string[]

export default function processReport(raw: string): string {
    splitObject(raw, Keys, Values)

    let errors = 0
    let connections = 0
    let requests = 0
    let reply_size = 0
    let favorite: FlattenedObject = {}

    Keys.forEach((key: string, index: number) => {
        if (interestingFields.includes(key)) {
            if (keyFields.includes(key)) {
                favorite[key] = Values[index]
            }

            if (key.includes('error') && Number(Values[index]) > 0) {
                favorite[key] = Values[index]
                errors += Number(Values[index])
                favorite.errors = errors
            }

            if (key === 'requests') {
                requests += Number(Values[index])
            }

            if (key === 'connections') {
                connections += Number(Values[index])
            }

            if (key.includes('reply_size')) {
                reply_size += Number(Values[index])
            }

            if (key === 'rate' && Number(Values[index]) < 2) {
                favorite.rate = Values[index]
            }

            if (key === 'bonus_reward' && Number(Values[index]) > 0) {
                favorite.bonus_reward = Values[index]
            }

            if (key === 'result') {
                const fields = Values[index]
                const newLine = fields.replace(/\\n/g, '\n')
                const reward = newLine.replace('Reward', '\nReward')
                const status = reward.replace('Page is', 'Status: Page is')
                const splits = status.split('\n')

                splits.forEach((split) => {
                    const download = split.replace(/time to donwload/g, 'Time to download')
                    const streak = download.replace(/Uptime streak /, 'Bonus: Uptime streak ')
                    const index = streak.indexOf(':');
                    const key = streak.slice(0, index);
                    const value = streak.slice(index + 1);
                    if (key && value) {
                        favorite[key] = value
                    }
                });           
            }
        }
    })

    if (reply_size) {
        favorite.reply_size = reply_size
    }

    if (requests != connections) {
        favorite.unhandledRequests = requests - connections
    }

    const keys = Object.keys(favorite)
    const values = Object.values(favorite)
    let string = ''

    for (let i = 0; i < keys.length; i++) {
        string += `${keys[i]}: ${values[i]}\n`
    }

    return string
}
