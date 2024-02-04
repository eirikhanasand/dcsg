import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

export default async function alert(message: ChatInputCommandInteraction, embed: EmbedBuilder) {
    const guild = message.guild
    const logChannel = guild?.channels.cache.get('1199865408770015302') as any

    if (logChannel) {
        try {
            logChannel.send({content: '<@&1200463498598166559>', embeds: [embed]})
        } catch (error) {
            console.log("Failed to alert", error)
        }
    }
}
