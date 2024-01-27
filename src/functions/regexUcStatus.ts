import stripAnsi from 'strip-ansi'

export default function regexUcStatus(data: string) {
    const regex = /UPTIME CHALLENGE([\s\S]*?)ubuntu/;
    const ucstatus = stripAnsi(data).match(regex)
    const newline = /\n/;
    let status = ''
    
    if (ucstatus) {
        const lines = ucstatus[1].split(newline)
        lines.forEach((line, index) => {
            if (line.includes('considered up')) {
                const regex = /considered (\w+) and working, increasing 'time_up' to (\d+)/;
                const match = line.match(regex);
                
                if (match) {
                    const site = match[1].toUpperCase()
                    const timeUpValue = match[2];
                    status += `Status: ${site} (${timeUpValue})\n`
                    return
                }
            }

            if (line.includes('Uptime streak '))

            if (line.includes('Balance')) {
                const regex = /Balance: (\d+)\.\d+ KC/;
                const match = line.match(regex);

                if (match) {
                    const wholeNumber = match[1];
                    const outputString = `Balance: ${wholeNumber} KC\n`;
                    status += outputString
                    return
                }
            }

            if (line.includes('images')) {
                const regex = /\d+/;
                const match = line.match(regex)

                if (match) {
                    const number = match[0]
                    status += `Images: ${number}\n`
                    return
                }
            }

            if (line.includes('frontpage')) {
                const regex = /\d+/;
                const match = line.match(regex)

                if (match) {
                    const number = match[0];
                    status += `Users: ${number}\n`
                    return
                }
            }

            if (line.includes('download')) {
                const regex = /\d+/;
                const match = line.match(regex)

                if (match) {
                    const number = match[0];
                    status += `Download time: ${number}\n`
                    return
                }
            }

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