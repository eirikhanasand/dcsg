import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import config from '../config.json' assert { type: "json" }

const token = config.token

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration
] })

client.commands = new Collection()
const foldersPath = join(__dirname, 'commands')
const commandFolders = readdirSync(foldersPath)

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder)
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file)
        const command = await import(filePath)
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}

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
