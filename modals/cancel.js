const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'cancel_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id } = require('../events/interactionModal');
        let { subcommand } = require(`../slashCommands/bank/cancel`);
        const db = new QuickDB({ filePath: `./data/${subcommand}Requests.sqlite` });
        const requestMsgID = await db.get(`${interaction.guild.id}.${id}.requestMsgID`);
        const channel = client.channels.cache.get(await db.get(`${interaction.guild.id}.${id}.channelID`));

        if (!await db.has(`${interaction.guild.id}.${id}.amount`) && subcommand == 'deposit') {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Deposit Request`)
                        .setDescription(`You don't have a deposit request! Do \`/deposit\` to get started at making a request.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                ]
            });
        } else if (!await db.has(`${interaction.guild.id}.${id}.amount`) && subcommand == 'withdraw') {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Withdrawal Request`)
                        .setDescription(`You don't have a withdrawal request! Do \`/withdraw\` to get started at making a request.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        if (subcommand == 'deposit') {
            if (await db.delete(`${interaction.guild.id}.${id}.amount`)) {
                await channel.messages.delete(`${requestMsgID}`);
                await db.delete(`${interaction.guild.id}.${id}.requestMsgID`);
                await db.delete(`${interaction.guild.id}.${id}.channelID`);
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Cancel Request`)
                            .setDescription(`Your deposit request has successfully been cancelled.`)
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            } else {
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Cancel Request`)
                            .setDescription(`Your deposit request has failed to be cancelled. Please open a ticket to get this resolved.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } else if (subcommand == 'withdraw') {
            if (await db.delete(`${interaction.guild.id}.${id}.amount`)) {
                await channel.messages.delete(`${requestMsgID}`);
                await db.delete(`${interaction.guild.id}.${id}.requestMsgID`);
                await db.delete(`${interaction.guild.id}.${id}.channelID`);
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Cancel Request`)
                            .setDescription(`Your withdrawal request has successfully been cancelled.`)
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            } else {
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Cancel Request`)
                            .setDescription(`Your withdrawal request has failed to be cancelled. Please open a ticket to get this resolved.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        }
    }
};