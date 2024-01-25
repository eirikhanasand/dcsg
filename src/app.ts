import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import config from '../.config.js'
import { ClientWithCommands } from '../interfaces.js'

const token = config.token

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
] }) as ClientWithCommands

client.once(Events.ClientReady, () => {
    // Restarts role listeners after restart

    console.log("Ready!")
})

client.on(Events.InteractionCreate, async message => {
	if (!message.isChatInputCommand()) return

	const command = client.commands.get(message.commandName)

	if (!command) return

	try {
		await command.execute(message)
	} catch (error) {
        // Ignoring error as another process is handling it
        // console.log(error)
	}
})

client.login(token)

export default client
