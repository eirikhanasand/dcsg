import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('useful')
    .setDescription('Useful commands');
export async function execute(message) {
    const embed = new EmbedBuilder()
        .setTitle('Useful')
        .setDescription('Useful commands')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({ name: "**status**", value: "uc status", inline: true }, { name: "**report**", value: "uc report", inline: true }, { name: "**htop**", value: "htop", inline: true }, { name: "**coachroach**", value: "cockroach start --insecure --store=/bfdata --listen-addr=0.0.0.0:26257 --http-addr=0.0.0.0:8080 --background --join=localhost:26257 --attrs=ram:16gb --cache=25%", inline: false });
    await message.reply({ embeds: [embed] });
}
