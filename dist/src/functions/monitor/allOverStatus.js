import { services } from "../../content/log.js";
import allUp from "./allUp.js";
export default function overAllStatus() {
    const status = services[0].state;
    const report = JSON.stringify(services[1].state);
    const server = allUp();
    if (status.includes('DOWN'))
        return false;
    if (report.toLowerCase().includes('page is considered down'))
        return false;
    if (server.upCount < server.total)
        return false;
    return true;
}
