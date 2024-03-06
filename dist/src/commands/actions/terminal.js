import { SlashCommandBuilder } from 'discord.js';
import pty from 'node-pty';
import config from '../../../.config.js';
import stripAnsi from 'strip-ansi';
import os from 'os';
let input = '';
/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('terminal')
    .setDescription('Allows you to use the command line on the underlying machine');
/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    await message.reply("Starting...");
    // Spawns the virtual terminal
    spawn(message);
}
function spawn(message) {
    try {
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const virtualTerminal = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 2000,
            rows: 100,
            cwd: process.cwd(),
            env: process.env
        });
        if (!virtualTerminal) {
            message.editReply("Failed to start virtual terminal.");
        }
        if (!prod) {
            virtualTerminal.write(config.connect + '\r');
        }
        virtualTerminal.onData((data) => {
            const cleanData = stripAnsiEscapeCodes(data);
            if (cleanData.trim().length && cleanData != input) {
                message.channel?.send(cleanData.slice(0, 2000));
            }
            if (data === input)
                input = '';
        });
        const filter = (response) => !response.author.bot;
        const collector = message.channel?.createMessageCollector({ filter });
        if (collector) {
            collector.on('collect', (message) => {
                if (message.content) {
                    input = message.content;
                    virtualTerminal.write(`${message.content}\r`);
                }
            });
        }
        else {
            console.log("Unable to setup message collector in terminal.ts");
        }
    }
    catch (error) {
        try {
            message.channel?.send("Failed to start virtual terminal.");
        }
        catch (innerError) {
            console.log("Unable to start terminal.");
        }
    }
}
function stripAnsiEscapeCodes(text) {
    text = stripAnsi(text);
    text = text.replace(/(https)/g, '[$1]');
    text = text.replace(/^;(.+?):[ ]~\x07(.+?)$/g, '$2');
    text = text.replace(/#/g, '//');
    text = text.replace(/\|/g, 'l');
    text = text.replace(/;eirikhanasand@corax: ~\/Desktop\/dcsgeirikhanasand@corax:~\/Desktop\/dcsg\$ ssh ubuntu@10\.212\.171\.201/g, 'ubuntu@manager:~$');
    text = text.replace(/;(\w+)@(\w+): ~(\w+)@(\w+):~\$/g, 'ubuntu@manager:~$');
    return text;
}
