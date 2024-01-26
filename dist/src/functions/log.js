export default async function log(message, embed, activeIncident) {
    const guild = message.guild;
    const logChannel = guild?.channels.cache.get('1199865847301288006');
    if (logChannel) {
        try {
            if (activeIncident) {
                const lastID = logChannel?.lastMessageId || '';
                const msg = await logChannel?.messages.fetch(lastID);
                msg?.edit({ embeds: [embed] });
            }
            else {
                logChannel.send({ embeds: [embed] });
            }
        }
        catch (error) {
            logChannel.send({ embeds: [embed] });
        }
    }
}
