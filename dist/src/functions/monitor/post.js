import { servers, services } from '../../content/log.js';
import tab from '../tab.js';
import allUp from './allUp.js';
import overAllStatus from './allOverStatus.js';
import { EmbedBuilder } from 'discord.js';
import log from '../log.js';
import alert from './alert.js';
let activeIncident = false;
export default async function post(message) {
    let longest = 0;
    let string = '```js\n';
    for (const server of servers) {
        if (server.name.length > longest)
            longest = server.name.length;
    }
    for (const server of servers) {
        if (server.state >= 0) {
            string += `${server.name}:${tab(longest, server.name.length)}✅ UP    ${server.state}s\n`;
        }
        else {
            string += `${server.name}:${tab(longest, server.name.length)}❌ DOWN ${server.state}s\n`;
        }
    }
    string += '```';
    const status = services[0].state;
    const report = services[1].state;
    const server = allUp();
    const overall = overAllStatus();
    const embedStatus = status.length > 4 ? `\`\`\`jsx\n${status}\n\`\`\`` : `\`\`\`jsx\nPending...\n\`\`\``;
    const reportStatus = report.length > 4 ? `\`\`\`jsx\n${report}\n\`\`\`` : `\`\`\`jsx\nPending...\n\`\`\``;
    const statusName = `**${status.includes('DOWN') ? '❌' : status.length > 4 ? '✅' : '🔁'} Status**`;
    const reportName = `**${report.includes('DOWN') || report.includes('down,') ? '❌' : report.length > 4 ? '✅' : '🔁'} Report**`;
    const serverName = `**${server.upCount === server.total ? '✅' : '❌'} Servers ${server.upCount}/${server.total}**`;
    const embed = new EmbedBuilder()
        .setTitle(`Status ${overall ? '✅' : '❌'}`)
        .setDescription('Weather report')
        .setColor("#000000")
        .setTimestamp()
        .addFields({ name: statusName, value: embedStatus, inline: true }, { name: reportName, value: reportStatus, inline: true }, { name: serverName, value: string, inline: false });
    if (!overall) {
        log(message, embed, activeIncident);
        if (!activeIncident) {
            alert(message, embed);
        }
        activeIncident = true;
    }
    else {
        activeIncident = false;
    }
    try {
        const lastID = message.channel?.lastMessageId || '';
        const msg = await message.channel?.messages.fetch(lastID);
        msg?.edit({ content: '', embeds: [embed] });
    }
    catch (error) {
        message.channel?.send({ content: '', embeds: [embed] });
    }
}
