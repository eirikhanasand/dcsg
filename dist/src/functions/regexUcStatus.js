export default function regexUcStatus(data) {
    const regex = /144\n([\s\S]*?)ubuntu/;
    const ucstatus = data.match(regex);
    const newline = /\n/;
    let status = '';
    let down = false;
    console.log("ucstatus", ucstatus);
    if (ucstatus) {
        const lines = ucstatus[1].split(newline);
        lines.forEach((line) => {
            if (line == 'Report: ') {
                return;
            }
            if (line.includes('Page') && line.includes('down')) {
                down = true;
            }
            if (line) {
                status += `${line}\n`;
            }
        });
        return { status: status, down };
    }
    return { status: 'unknown', down: false };
}
