import { SlashCommandBuilder } from 'discord.js';
import checkServers from '../../functions/monitor/checkServers.js';
import checkServices from '../../functions/monitor/checkServices.js';
import post from '../../functions/monitor/post.js';
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
    monitor(message);
}
async function monitor(message) {
    while (true) {
        checkServers(3);
        checkServices();
        await new Promise((r) => setTimeout(r, 30000));
        post(message);
    }
}
