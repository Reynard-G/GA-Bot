const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'deposit_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id, balance } = require('../events/interactionModal');
        let { amount, attachment } = require('../slashCommands/bank/deposit');

        function attachIsImage(msgAttach) {
            return (msgAttach.contentType.startsWith('image/'))
        }

        let db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
        if (await db.has(`${interaction.guild.id}.${id}.amount`)) { // Check if user already has deposit
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Deposit Request')
                        .setDescription(`You already have a deposit request pending! Do \`/cancel deposit\` to cancel your request.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        if (!attachIsImage(attachment)) { // Check if attachment is valid
            return await interaction.reply({
                ephemeral: true,
                content: 'Some or all of the attachments sent are not images. Please send another or multiple images.'
            });
        }

        const userID = interaction.user.id;
        db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
        const channelID = await db.get(`${interaction.guild.id}.channelID.depositChannelID`);
        const percentage = await db.get(`${interaction.guild.id}.rate.percentage`) ?? 0;
        const constant = await db.get(`${interaction.guild.id}.rate.constant`) ?? 0;
        const taxedAmount = +Number(Math.round(parseFloat(((amount * ((100 - percentage) / 100)) - constant) + "e2")) + "e-2");

        requestEmbed = new EmbedBuilder()
            .setTitle('Deposit Request')
            .setDescription(`
            Amount: **$${amount}** \n Taxed Amount (${percentage}% + $${constant}): **$${taxedAmount}** \n Current Balance: **$${balance}**
            `)
            .setImage(attachment.proxyURL)
            .setColor('White')
            .setTimestamp()
            .setFooter({ text: `Gamblers Anonymous`, iconURL: interaction.guild.iconURL() });

        buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Approve')
                    .setStyle('Success')
                    .setEmoji('<:approved:815575466231463956>')
                    .setCustomId('deposit_approve_button'),
                new ButtonBuilder()
                    .setLabel('Deny')
                    .setStyle('Danger')
                    .setEmoji('<:denied:815575438750777344>')
                    .setCustomId('deposit_deny_button')
            );

        const channel = await client.channels.cache.get(channelID) ?? interaction.channel;
        const requestMsg = await channel.send({ embeds: [requestEmbed], components: [buttons] }); // Send deposit request in set channel

        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Deposit Request Sent')
                    .setDescription(`
                    Amount: **$${amount}** \n Taxed Amount (${percentage}% + $${constant}): **$${taxedAmount}** \n Current Balance: **$${balance}**
                    `)
                    .setImage(attachment.proxyURL)
                    .setColor('Green')
                    .setTimestamp()
                    .setFooter({ text: `Gamblers Anonymous`, iconURL: interaction.guild.iconURL() })
            ]
        });

        db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
        await db.set(`${interaction.guild.id}.${id}.amount`, amount);
        await db.set(`${interaction.guild.id}.${id}.requestMsgID`, requestMsg.id);
        await db.set(`${interaction.guild.id}.${id}.channelID`, channelID);

        return module.exports = { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, balance, userID, id };
    }
};