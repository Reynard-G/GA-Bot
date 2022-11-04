const { EmbedBuilder } = require('discord.js');
const client = require('..');

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    const command = client.selectMenus.get(interaction.customId);
    if (!command) return;

    try {
        return await command.run(client, interaction);
    } catch (error) {
        console.log(error);
        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle("An error occurred!")
                    .setDescription("An error occurred while running this select menu. Please contact the administrators.")
                    .setColor("Red")
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
            ]
        });
    }
});
