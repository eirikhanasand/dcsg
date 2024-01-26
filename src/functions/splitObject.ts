export default function splitObject(raw: string, Keys: string[], Values: string[]) {
    const regex = /"([^"]*)":\s*("([^"]*)"|(\d+(\.\d+)?))/g
    let match

    while ((match = regex.exec(raw)) !== null) {
        if (Keys.includes(match[1])) {
            const index = Keys.indexOf(match[1])
            Keys[index] = match[1]
            Values[index] = match[2]
        } else {
            Keys.push(match[1])
            Values.push(match[2])
        }
    }
}
