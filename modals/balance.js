const { EmbedBuilder } = require('discord.js');

module.exports = {
    id: 'balance_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id, balance } = require('../events/interactionModal');

        return await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Balance')
                    .setDescription(`You currently have **$${balance} ≈ ${+Number(Math.round(parseFloat((balance / 100) + "e2")) + "e-2")} shares** in your account!`)
                    .setColor('White')
                    .setTimestamp()
                    .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};