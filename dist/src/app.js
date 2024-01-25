import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from '../.config.js';
const token = config.token;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
    ] });
client.once(Events.ClientReady, () => {
    // Restarts role listeners after restart
    console.log("Ready!");
});
client.on(Events.InteractionCreate, async (message) => {
    if (!message.isChatInputCommand())
        return;
    const command = client.commands.get(message.commandName);
    if (!command)
        return;
    try {
        await command.execute(message);
    }
    catch (error) {
        // Ignoring error as another process is handling it
        // console.log(error)
    }
});
client.login(token);
export default client;
