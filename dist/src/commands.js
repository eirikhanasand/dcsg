import { dirname, join } from "path";
import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
export default async function getCommands(client) {
    client.commands = new Collection();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const foldersPath = join(__dirname, 'commands');
    const commandFolders = readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = await import(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
            else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}
