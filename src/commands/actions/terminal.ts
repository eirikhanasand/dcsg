import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from '../../../.config.js'
import stripAnsi from 'strip-ansi'

let input = ''
/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('terminal')
    .setDescription('Allows you to use the command line on the underlying machine')

/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message: ChatInputCommandInteraction) {
    await message.reply("Starting...")

    // Spawns the virtual terminal
    spawn(message)
}

function spawn(message: ChatInputCommandInteraction) {
    const virtualTerminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 2000,
        rows: 100,
        cwd: process.cwd(),
        env: process.env
    })

    if (!virtualTerminal) {
        message.editReply("Failed to start virtual terminal.")
    }

    virtualTerminal.write(config.connect + '\r')

    virtualTerminal.onData((data) => {
        const cleanData = stripAnsiEscapeCodes(data)
        if (cleanData.trim().length && cleanData != input) {
            message.channel?.send(cleanData)
        }

        if (data === input) input = ''
    });

    const filter = (response: Message) => !response.author.bot

    const collector = message.channel?.createMessageCollector({ filter })

    if (collector) {
        collector.on('collect', (message) => {
            if (message.content) {
                input = message.content
                virtualTerminal.write(`${message.content}\r`);
            }
        });
    } else {
        console.log("Unable to setup message collector in terminal.ts")
    }
}

function stripAnsiEscapeCodes(text: string) {
    text = stripAnsi(text)
    text = text.replace(/(https)/g, '[$1]');
    text = text.replace(/^;(.+?):[ ]~\x07(.+?)$/g, '$2');
    text = text.replace(/#/g, '//')
    text = text.replace(/\|/g, 'l')
    text = text.replace(/;eirikhanasand@corax: ~\/Desktop\/dcsgeirikhanasand@corax:~\/Desktop\/dcsg\$ ssh ubuntu@10\.212\.171\.201/g, 'ubuntu@manager:~$')
    text = text.replace(/;(\w+)@(\w+): ~(\w+)@(\w+):~\$/g, 'ubuntu@manager:~$')
    return text
}