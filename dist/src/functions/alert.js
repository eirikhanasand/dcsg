export default async function alert(message, embed) {
    const guild = message.guild;
    const logChannel = guild?.channels.cache.get('1199865408770015302');
    if (logChannel) {
        try {
            // logChannel.send({content: '<@&1200463498598166559>', embeds: [embed]})
        }
        catch (error) {
            console.log("Failed to alert", error);
        }
    }
}
