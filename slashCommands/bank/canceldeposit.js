const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'canceldeposit',
    description: "Cancel your current deposit request.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        let { requestMsg } = require("./deposit");
        const db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });

        if (!await db.has(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
            const alreadyRequestedEmbed = new EmbedBuilder()
                .setTitle('Deposit Request')
                .setDescription(`You don't have a deposit request! Do \`/deposit\` to get started at making a request.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [alreadyRequestedEmbed], ephemeral: true });
        }

        if (await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
            requestMsg.delete();

            const cancelSuccessEmbed = new EmbedBuilder()
                .setTitle('Deposit Request')
                .setDescription(`Your deposit request has successfully been cancelled.`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [cancelSuccessEmbed] });
        } else {
            const cancelFailedEmbed = new EmbedBuilder()
                .setTitle('Deposit Request')
                .setDescription(`Your deposit request has failed to be cancelled. Please contact a \`staff member\` & \`MilkLegend#5071\`.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [cancelFailedEmbed] });
        }
    }
};