import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

export default async function log(message: ChatInputCommandInteraction, embed: EmbedBuilder, activeIncident?: boolean) {
    const guild = message.guild
    const logChannel = guild?.channels.cache.get('1199865847301288006') as any

    if (logChannel) {
        try {
            if (activeIncident) {
                const lastID = logChannel?.lastMessageId || ''
                const msg = await logChannel?.messages.fetch(lastID)
                msg?.edit({embeds: [embed]})
            } else {
                logChannel.send({embeds: [embed]})
            }
        } catch (error) {
            logChannel.send({embeds: [embed]})
        }
    }
}