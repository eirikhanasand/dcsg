import { Client, Events, GatewayIntentBits } from 'discord.js'
import config from '../.config.js'
import { ClientWithCommands } from '../interfaces.js'
import getCommands from './commands.js'
const token = config.token
// Set to false when not in prod
globalThis.prod = false

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

await getCommands(client)

client.on(Events.InteractionCreate, async message => {
	if (!message.isChatInputCommand()) return
    
	const command = client.commands.get(message.commandName) as any

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
