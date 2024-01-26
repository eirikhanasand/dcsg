import interestingFields from "../content/interestingFields.js";
import keyFields from "../content/keyFields.js";
import flattenObject from "./flatten.js";
export default function processReport(raw) {
    const data = regexUcReport(raw);
    const obj = { ...flattenObject(data.Reports[0]), ...flattenObject(data.Reports[1]), ...flattenObject(data.Reports[2]) };
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    let errors = 0;
    let connections = 0;
    let requests = 0;
    let reply_size = 0;
    let favorite = {};
    keys.forEach((key, index) => {
        if (interestingFields.includes(key)) {
            if (keyFields.includes(key)) {
                favorite[key] = values[index];
            }
            if (key.includes('error') && Number(values[index]) > 0) {
                favorite[key] = values[index];
                errors += Number(values[index]);
                favorite.errors = errors;
            }
            if (key === 'requests') {
                requests += Number(values[index]);
            }
            if (key === 'connections') {
                connections += Number(values[index]);
            }
            if (key.includes('reply_size')) {
                reply_size += Number(values[index]);
            }
            if (key === 'rate' && Number(values[index]) < 2) {
                favorite.rate = values[index];
            }
        }
    });
    favorite.reply_size = reply_size;
    favorite.unhandledRequests = requests - connections;
    return favorite;
}
function regexUcReport(data) {
    const regex = /uc reports\n{"([\s\S]*?)ubuntu/;
    const ucreports = data.match(regex);
    if (ucreports) {
        console.log(ucreports[1]);
    }
    // const regex = /144\n([\s\S]*?)ubuntu/;
    // const newline = /\n/;
    // if (ucstatus) {
    //     const lines = ucstatus[1].split(newline)
    //     lines.forEach((line) => {
    //         if (line == 'Report: ') return
    //         if (line.includes('Page') && line.includes('down')) {
    //             console.log("WE ARE DOWN")
    //         }
    //         if (line) {
    //             console.log(line)
    //         }
    //     })
    //     const nestedObject = {}
    //     console.log(data)
    //     return nestedObject   
    // }
    return data;
}
