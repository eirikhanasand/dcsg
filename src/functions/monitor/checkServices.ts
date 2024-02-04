import { services } from '../../content/log.js'
import spawn from '../spawn.js'
import pty from 'node-pty'
import regexUcStatus from './regexUcStatus.js'
import processReport from './processReport.js'
import config from '../../../.config.js'

export default async function checkServices() {
    for (let i = 0; i < services.length; i++) {
        const service = services[i]
        const terminal = spawn(service.command) as pty.IPty | null
        
        if (terminal) {
            let post = ''
            terminal.write(config.connect)
            terminal.write(`${service.command}\n`)

            terminal.onData((data) => {
                post += data
            })

            setTimeout(() => {
                switch (service.command) {
                    case 'uc status': {
                        const status = regexUcStatus(post)

                        if (status != 'unknown') {
                            service.state = status
                        }
                        
                        break
                    }
                    
                    case 'uc reports': {
                        const report = processReport(post)
                    
                        if (report) {
                            service.state = report
                        }

                        break
                    }
                }
            }, 5000);
        }
    }
}