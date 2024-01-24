import { SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from '../../../config.json' assert { type: "json" }

const servers = [
    { name: 'manager', state: 0 }, 
    { name: 'db1', state: 0 }, 
    { name: 'ww1', state: 0 }, 
    { name: 'ww2', state: 0 }, 
    { name: 'balancer', state: 0 }
]

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('monitor')
    .setDescription('Monitors server status')

/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    await message.reply({content: "Starting...", ephemeral: true})

    monitor(message)
}

function ping() {
    for (let i = 0; i < servers.length; i++) {
        spawn(i)
    }
}

function spawn(index) {
    const terminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 2000,
        rows: 100,
        cwd: process.cwd(),
        env: process.env,
    })

    if (!terminal) {
        console.error("Failed to start virtual terminal.")
    }

    check(index, terminal)
}

function check(index, terminal) {
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
    }, 5000)
}

function log(message) {
    let longest = 0
    for (const server of servers) {
        if (server.name.length > longest) longest = server.name.length
    }

    for (const server of servers) {
        if (server.state >= 0) {
            message.channel.send(`${server.name}:${tab(longest, server.name.length)}UP    ${server.state}s`)
        } else {
            message.channel.send(`${server.name}:${tab(longest, server.name.length)}DOWN ${server.state}s @spam`)
        }
    }
}

function tab(longest, length) {
    let string = ''
    const tabs = (longest - length) / 4

    if (!tabs) string = '\t'

    for (let i = 0; i < tabs; i++) {
        string += '\t'
    }

    return string
}

async function monitor(message) {
    while (true) {
        ping()
        await new Promise((r) => setTimeout(r, 10000))
        log(message)
    }
}