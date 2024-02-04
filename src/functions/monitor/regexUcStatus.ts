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

            if (line.includes('Kyrrecoins')) {
                const regex = /(\d+(\.\d+)?)/;
                const match = line.match(regex);

                if (match) {
                    const integerValue = match[1];
                    status += `Earned: ${parseFloat(integerValue).toFixed(2)} KC\n`
                    return
                }
            }

            if (line.includes('KC')) {
                const regex = /(\d+)/;
                const match = line.match(regex);

                if (match) {
                    const integerValue = match[1];
                    status += `Balance: ${integerValue} KC\n`
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

            if (line.includes('since last check')) {
                const regex = /\d+/;
                const match = line.match(regex)

                if (match) {
                    const number = match[0];
                    status += `Last check: ${number}s\n`
                    return
                }
            }

            if (line.includes('max bonus')) {
                const regex = /(\d+(\.\d+)?)/;
                const match = line.match(regex)
            
                if (match) {
                    const number = match[0];
                    status += `Bonus: ${parseFloat(number).toFixed(2)}\n`
                    return
                }
            }

            if (line.includes('last check')) return
            if ((index < 4) || index === 8 || index > 15)  return
            if (line == 'Report: ') return

            if (line) {
                status += `${line}\n`
            }
        })

        return status.replace('Reward', '\nReward')
    }

    return 'unknown'
}
