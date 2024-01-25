import { SlashCommandBuilder } from 'discord.js';
import pty from 'node-pty';
import config from '../../../.config.js';
import { servers } from '../../content/log.js';
// import client
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
    messageID = message.channel?.lastMessageId || '';
    console.log("here", message.channel);
    monitor(message.channel);
}
function ping() {
    for (let i = 0; i < servers.length; i++) {
        spawn(i);
    }
}
function spawn(index) {
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
    check(index, terminal);
}
function check(index, terminal) {
    const currentServer = servers[index];
    let statusChecked = false;
    if (index)
        terminal.write(`${config.connect}\r`);
    terminal.write(`${index == 0 ? config.connect : currentServer.name}\r`);
    terminal.write(`systemctl is-active ${currentServer.name}.service\r`);
    terminal.onData((data) => {
        if (!statusChecked && data.includes('inactive')) {
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
async function log(channel) {
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
    try {
        // channel.edit(string)
        // console.log(channel.fetch, messageID)
        // const message = await channel.fetch(messageID)
        // console.log(messageID)
        // await message.edit({ content: string })
    }
    catch (error) {
        console.log(error);
        channel.send({ content: string });
        if (channel?.lastMessageId) {
            messageID = channel.lastMessageId;
        }
    }
}
function tab(longest, length) {
    let string = '';
    const tabs = (longest - length) / 4;
    if (!tabs)
        string = '\t';
    for (let i = 0; i < tabs; i++) {
        string += '\t';
    }
    for (let i = 0; i < (longest - length) % 4; i++) {
        string += ' ';
    }
    return string;
}
async function monitor(channel) {
    while (true) {
        ping();
        await new Promise((r) => setTimeout(r, 10000));
        log(channel);
    }
}
