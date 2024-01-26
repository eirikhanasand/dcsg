import stripAnsi from 'strip-ansi'

export default function regexUcStatus(data: string) {
    const regex = /UPTIME CHALLENGE([\s\S]*?)ubuntu/;
    const ucstatus = stripAnsi(data).match(regex)
    const newline = /\n/;
    let status = ''
    
    if (ucstatus) {
        const lines = ucstatus[1].split(newline)
        lines.forEach((line, index) => {
            if ((index < 4) || index === 8 || index > 15) {
                return
            }
            if (line == 'Report: ') {
                return
            }

            if (line) {
                status += `${line}\n`
            }
        })

        return status.replace('Reward', '\nReward')
    }

    return 'unknown'
}