import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from '../../../.config.js'
import { servers, services } from '../../content/log.js'
import tab from '../../functions/tab.js'
import regexUcStatus from '../../functions/regexUcStatus.js'
import processReport from '../../functions/processReport.js'

let channelID = ''
let messageID = ''

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('boo')
    .setDescription('Monitors server status')

/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message: ChatInputCommandInteraction) {
    await message.reply("Fetching initial status...")
    messageID = message.id
    channelID = message.channelId
    monitor(message)
}

function ping() {
    for (let i = 0; i < servers.length; i++) {
        spawn(i)
    }

    for (let i = 0; i < services.length; i++) {
        spawn(i, true)
    }
}

function spawn(index: number, service?: boolean) {
    const terminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 400,
        rows: 100,
        cwd: process.cwd(),
        env: process.env,
    })

    if (!terminal) {
        console.error("Failed to start virtual terminal.")
    }

    if (service) {
        checkService(index, terminal)
        return
    }

    check(index, terminal)
}

function check(index: number, terminal: pty.IPty) {
    const currentServer = servers[index]
    let statusChecked = false

    if (index) terminal.write(`${config.connect}\r`)
    terminal.write(`${index == 0 ? config.connect : currentServer.name}\r`)
    terminal.write(`systemctl is-active ${currentServer.name}.service\r`)

    terminal.onData((data) => {
        if (!statusChecked && data.includes('inactive')) {
            statusChecked = true
        }
    })

    setTimeout(() => {
        terminal.kill()
        if (statusChecked) {
            if (currentServer.state < 0) {
                currentServer.state = 10
            } else {
                currentServer.state += 10
            }
        } else {
            if (currentServer.state > 0) {
                currentServer.state = -10
            } else {
                currentServer.state -= 10
            }
        }
    }, 8000)
}

function checkService(index: number, terminal: pty.IPty) {
    let log = ''
    const currentServer = services[index]

    terminal.write(`${config.connect}\r`)

    if (currentServer.host != 'manager') {
        terminal.write(`${currentServer.host}\r`)
    }

    terminal.write(`${currentServer.service}\r`)

    terminal.onData((data) => {
        log += data
    })

    setTimeout(() => {
        terminal.kill()
        if (!index) {
            currentServer.state = regexUcStatus(log)
        } else {
            currentServer.state = processReport(log)
        }
        
    }, 5000)
}

async function log(message: ChatInputCommandInteraction) {
    let longest = 0
    let string = '```js\n'

    for (const server of servers) {
        if (server.name.length > longest) longest = server.name.length
    }

    for (const server of servers) {
        if (server.state >= 0) {
            string += `${server.name}:${tab(longest, server.name.length)}✅ UP    ${server.state}s\n`
        } else {
            string += `${server.name}:${tab(longest, server.name.length)}❌ DOWN ${server.state}s\n`
            // for krise
            // message.channel.send("@everyone")
            // for restarts
            // message.channel.send("@here")
        }
    }

    string += '```'

    const embed = new EmbedBuilder()
        .setTitle('Report')
        .setDescription('Status report')
        .setColor("#000000")
        .setTimestamp()
        .addFields(
            {name: "**Status**", value: JSON.stringify(services[0].state), inline: true},
            {name: "**Report**", value: JSON.stringify(services[1].state), inline: true},
            {name: "**Servers**", value: string, inline: false},
        )

    try {
        const lastID = message.channel?.lastMessageId || ''
        const msg = await message.channel?.messages.fetch(lastID)
        msg?.edit({ embeds: [embed]})
    } catch (error) {
        message.channel?.send({ embeds: [embed]})
    }
}

async function monitor(message: ChatInputCommandInteraction) {
    while (true) {
        ping()
        await new Promise((r) => setTimeout(r, 10000))
        log(message)
    }
}
