const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'cancel',
    description: "Cancel your current request.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'deposit',
            description: 'Cancel your current deposit request.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'withdraw',
            description: 'Cancel your current withdrawal request.',
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        let { requestMsg } = require(`./${subcommand}`);
        const db = new QuickDB({ filePath: `./data/${subcommand}Requests.sqlite` });

        if (!await db.has(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
            const alreadyRequestedEmbed = new EmbedBuilder()
                .setTitle(`${subcommand} Request`)
                .setDescription(`You don't have a ${subcommand} request! Do \`/${subcommand}\` to get started at making a request.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [alreadyRequestedEmbed], ephemeral: true });
        }

        const cancelSuccessEmbed = new EmbedBuilder()
            .setTitle(`Cancel Request`)
            .setDescription(`Your ${subcommand} request has successfully been cancelled.`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

        const cancelFailedEmbed = new EmbedBuilder()
            .setTitle(`Cancel Request`)
            .setDescription(`Your ${subcommand} request has failed to be cancelled. Please contact a \`staff member\` & \`MilkLegend#5071\`.`)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

        if (subcommand == 'deposit') {
            if (await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
                requestMsg.delete();
                return await interaction.reply({ embeds: [cancelSuccessEmbed] });
            } else {
                return await interaction.reply({ embeds: [cancelFailedEmbed] });
            }
        } else if (subcommand == 'withdraw') {
            if (await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
                requestMsg.delete();
                return await interaction.reply({ embeds: [cancelSuccessEmbed] });
            } else {
                return await interaction.reply({ embeds: [cancelFailedEmbed] });
            }
        }
    }
};