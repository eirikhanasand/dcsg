import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import pty from 'node-pty';
import config from '../../../.config.js';
import { servers, services } from '../../content/log.js';
import tab from '../../functions/tab.js';
import regexUcStatus from '../../functions/regexUcStatus.js';
import processReport from '../../functions/processReport.js';
let channelID = '';
let messageID = '';
/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('monitor')
    .setDescription('Monitors server status');
/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    await message.reply("Fetching initial status...");
    messageID = message.id;
    channelID = message.channelId;
    monitor(message);
}
function ping() {
    for (let i = 0; i < servers.length; i++) {
        spawn(i);
    }
    for (let i = 0; i < services.length; i++) {
        spawn(i, true);
    }
}
function spawn(index, service) {
    const terminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 400,
        rows: 100,
        cwd: process.cwd(),
        env: process.env,
    });
    if (!terminal) {
        console.error("Failed to start virtual terminal.");
    }
    if (service) {
        checkService(index, terminal);
        return;
    }
    check(index, terminal);
}
function check(index, terminal) {
    const currentServer = servers[index];
    let statusChecked = false;
    terminal.write(`${config.connect}\r`);
    if (index) {
        terminal.write(`${currentServer.name}\r`);
    }
    else {
        terminal.write(`systemctl is-active ${currentServer.name}.service\r`);
    }
    terminal.onData((data) => {
        if (!statusChecked && data.includes('Welcome to Ubuntu') || data.includes('inactive')) {
            statusChecked = true;
        }
    });
    setTimeout(() => {
        terminal.kill();
        if (statusChecked) {
            if (currentServer.state < 0) {
                currentServer.state = 10;
            }
            else {
                currentServer.state += 10;
            }
        }
        else {
            if (currentServer.state > 0) {
                currentServer.state = -10;
            }
            else {
                currentServer.state -= 10;
            }
        }
    }, 8000);
}
function checkService(index, terminal) {
    let log = '';
    const currentServer = services[index];
    terminal.write(`${config.connect}\r`);
    if (currentServer.host != 'manager') {
        terminal.write(`${currentServer.host}\r`);
    }
    terminal.write(`${currentServer.service}\r`);
    terminal.onData((data) => {
        log += data;
    });
    setTimeout(() => {
        terminal.kill();
        if (!index) {
            const status = regexUcStatus(log);
            if (status != 'unknown') {
                currentServer.state = status;
            }
        }
        else {
            const service = processReport(log);
            if (service.includes('result')) {
                currentServer.state = service;
            }
        }
    }, 5000);
}
async function log(message) {
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
            // for krise
            // message.channel.send("@everyone")
            // for restarts
            // message.channel.send("@here")
        }
    }
    string += '```';
    const status = services[0].state;
    const report = services[1].state;
    const server = allUp();
    const embed = new EmbedBuilder()
        .setTitle(`Status ${overAllStatus() ? '✅' : '❌'}`)
        .setDescription('Weather report')
        .setColor("#000000")
        .setTimestamp()
        .addFields({ name: `**${status.includes('DOWN') ? '❌' : status.length > 4 ? '✅' : '🔁'} Status**`, value: status.length > 4 ? `\`\`\`jsx\n${status}\n\`\`\`` : `\`\`\`jsx\nPending...\n\`\`\``, inline: true }, { name: `**${report.toLowerCase().includes('page is considered down') ? '❌' : report.length > 4 ? '✅' : '🔁'} Report**`, value: report.length > 4 ? `\`\`\`jsx\n${report}\n\`\`\`` : `\`\`\`jsx\nPending...\n\`\`\``, inline: true }, { name: `**${server.upCount === server.total ? '✅' : '❌'} Servers ${server.upCount}/${server.total}**`, value: string, inline: false });
    try {
        const lastID = message.channel?.lastMessageId || '';
        const msg = await message.channel?.messages.fetch(lastID);
        msg?.edit({ content: '', embeds: [embed] });
    }
    catch (error) {
        message.channel?.send({ content: '', embeds: [embed] });
    }
}
async function monitor(message) {
    while (true) {
        ping();
        await new Promise((r) => setTimeout(r, 10000));
        log(message);
    }
}
function allUp() {
    let upCount = 0;
    for (let i = 0; i < servers.length; i++) {
        if (servers[i].state > 0) {
            upCount++;
        }
    }
    return { total: servers.length, upCount };
}
function overAllStatus() {
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
