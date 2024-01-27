import interestingFields from "../content/interestingFields.js";
import keyFields from "../content/keyFields.js";
import splitObject from "./splitObject.js";
const Keys = [];
const Values = [];
export default function processReport(raw) {
    splitObject(raw, Keys, Values);
    let errors = 0;
    let connections = 0;
    let requests = 0;
    let reply_size = 0;
    let favorite = {};
    Keys.forEach((key, index) => {
        if (key.includes('image')) {
            return;
        }
        if (interestingFields.includes(key)) {
            if (keyFields.includes(key)) {
                favorite[key] = numify(Values[index]);
                return;
            }
            if (key === 'bonus_reward' && Number(Values[index]) > 0) {
                favorite.Bonus = numify(Values[index]);
                return;
            }
            if (key === 'connections') {
                connections = Number(Values[index]) || 0;
                return;
            }
            if (key.includes('error') && Number(Values[index]) > 0) {
                favorite[key] = Values[index];
                errors += Number(Values[index]);
                favorite.errors = errors;
                return;
            }
            if (key === 'requests') {
                requests = Number(Values[index]) || 0;
                return;
            }
            if (key.includes('reply_size')) {
                reply_size += Number(Values[index]);
                return;
            }
            if (key === 'rate' && Number(Values[index]) < 2) {
                favorite.Rate = numify(Values[index]);
                return;
            }
            if (key === 'reply_size_total' && Number(Values[index]) < 50000) {
                favorite['Reply size'] = Number(Values[index]);
                return;
            }
            if (key === 'reply_time_transfer' && Number(Values[index]) < 8000) {
                favorite['Reply time'] = Number(Values[index]);
                return;
            }
            if (key === 'time_in_production_percentage') {
                favorite.Production = `${numify(Values[index])}%`;
                return;
            }
            if (key === 'time_to_download') {
                favorite['Download time'] = Values[index];
                return;
            }
            if (key === 'page_ok') {
                favorite.Status = Number(Values[index]) ? 'UP' : 'DOWN';
                return;
            }
            if (key === 'time_up_percentage') {
                favorite.Uptime = `${Values[index]}%`;
                return;
            }
            if (key.includes('images')) {
                return;
            }
            if (key === 'cpu_time_system_percent') {
                favorite['System CPU'] = `${Values[index]}%`;
                return;
            }
            if (key === 'cpu_time_system_seconds') {
                favorite['CPU seconds'] = `${Values[index]}s`;
                return;
            }
            if (key === 'cpu_time_user_seconds') {
                favorite['CPU seconds / user'] = `${Values[index]}s`;
                return;
            }
            if (key === 'cpu_time_user_percent') {
                favorite['CPU / user'] = `${Values[index]}%`;
                return;
            }
            if (key === 'time_since_last_fail') {
                favorite['Last fail'] = `${Values[index]}s`;
                return;
            }
            if (key === 'result') {
                const fields = Values[index];
                const newLine = fields.replace(/\\n/g, '\n');
                const reward = newLine.replace('Reward', '\nReward');
                const status = reward.replace('Page is', 'Status: Page is');
                const splits = status.split('\n');
                splits.forEach((split) => {
                    const download = split.replace(/time to download/g, 'Time to download');
                    const streak = download.replace(/Uptime streak /, 'Bonus: Uptime streak ');
                    const index = streak.indexOf(':');
                    const key = streak.slice(0, index);
                    const value = streak.slice(index + 1);
                    if (key === 'Bonus')
                        return;
                    if (key === 'streak_bonus') {
                        favorite.Streak = numify(value);
                    }
                    if (key === 'frontpage_count') {
                        favorite.Users = numify(value);
                    }
                    if (key.includes('frontpage')) {
                        return;
                    }
                    if (value.includes('considered up')) {
                        const regex = /considered (\w+) and working, increasing 'time_up' to (\d+)/;
                        const match = value.match(regex);
                        if (match) {
                            const status = match[1].toUpperCase();
                            const timeUpValue = match[2];
                            favorite.Status = `${status} (${timeUpValue})`;
                        }
                        return;
                    }
                    if (key && value) {
                        favorite[key] = numify(value);
                    }
                });
            }
        }
    });
    if (reply_size) {
        favorite.reply_size = reply_size;
    }
    if (requests != connections) {
        favorite.unhandledRequests = Number(requests) - Number(connections);
    }
    const keys = Object.keys(favorite);
    const values = Object.values(favorite);
    let string = '';
    for (let i = 0; i < keys.length; i++) {
        string += `${keys[i]}: ${numify(values[i])}\n`;
    }
    return string;
}
function numify(value) {
    let temp = value;
    if (typeof temp === 'boolean') {
        return temp ? 1 : 0;
    }
    const numericValue = parseFloat(String(temp));
    if (!isNaN(numericValue)) {
        if (numericValue > 10) {
            temp = numericValue.toFixed(0);
        }
        else {
            temp = numericValue.toFixed(2);
        }
    }
    return temp;
}
