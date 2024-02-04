import { servers } from "../../content/log.js"

export default function allUp() {
    let upCount = 0
    for (let i = 0; i < servers.length; i++) {
        if (servers[i].state >= 0) {
            upCount++
        }
    }

    return { total: servers.length, upCount }
}
