import { servers } from '../../content/log.js'
import spawn from '../spawn.js'
import pty from 'node-pty'
import config from '../../../.config.js'

export default function checkServers(count: number) {
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i]
        const terminal = spawn(server.name) as pty.IPty | null
        let serverIsUp = false

        if (terminal) {
            setTimeout(() => {
                if (serverIsUp) {
                    if (server.state < 0) {
                        server.state = 30
                    } else {
                        server.state += 30
                    }
                } else {
                    if (server.state > 0) {
                        server.state = 0
                    } else {
                        server.state -= 30
                    }
                }
            }, 19000);

            terminal.write(config.connect)
            terminal.write(`ping -c ${count} ${server.ip}\n`)

            terminal.onData((data) => {
                if (data.includes('received')) {
                    const regexPattern = /(\d+) received/;
                
                    const match = regexPattern.exec(data);
                
                    if (match && Number(match[1]) > 0) {
                        serverIsUp = true
                    }
                }
            })
        }
    }
}