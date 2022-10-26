const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');
const Economy = require('discord-economy-super');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'deposit',
    description: "Request a deposit by sending a screenshot",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to add.',
            required: true,
            type: ApplicationCommandOptionType.Number
        },
        {
            name: 'screenshot',
            description: 'Send proof of payment',
            required: true,
            type: ApplicationCommandOptionType.Attachment
        }
    ],
    run: async (client, interaction) => {
        let db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });

        if (await db.has(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
            const alreadyRequestedEmbed = new EmbedBuilder()
                .setTitle('Deposit Request')
                .setDescription(`You already have a deposit request pending! Do \`/canceldeposit\` to cancel your request.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [alreadyRequestedEmbed], ephemeral: true });
        }

        db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });

        const eco = new Economy({
            storagePath:
                `./data/eco.json`
        });
        const amount = interaction.options.get('amount').value;
        const attachment = interaction.options.getAttachment('screenshot').proxyURL;
        const userID = interaction.user.id;
        const argumentUser = eco.users.get(userID, interaction.guild.id);
        const balance = argumentUser.balance.get();

        function decimalCount(money) {
            if (money.toString().includes('.')) {
                return money.toString().split('.')[1].length;
            }
            return 0;
        }

        function attachIsImage(msgAttach) {
            const type = msgAttach.contentType;
            return (type.startsWith('image/'));
        }

        if (decimalCount(amount) > 2) {
            const decimalEmbed = new EmbedBuilder()
                .setTitle('Invalid Amount')
                .setDescription(`Deposit amounts may only be up to the 100th's place (.01).`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [decimalEmbed], ephemeral: true });
        }

        if (!attachIsImage(interaction.options.getAttachment('screenshot'))) {
            return await interaction.reply({ content: 'Some or all of the attachments sent are not images. Please send another or multiple images.', ephemeral: true });
        }

        const channelID = await db.get(`${interaction.guild.id}.channelID.depositChannelID`);
        const percentage = await db.get(`${interaction.guild.id}.rate.percentage`) ?? 0;
        const constant = await db.get(`${interaction.guild.id}.rate.constant`) ?? 0;
        const taxedAmount = +(Math.round(((amount * ((100 - percentage) / 100)) - constant) + "e+2") + "e-2");

        requestEmbed = new EmbedBuilder()
            .setTitle('Deposit Request')
            .setDescription(`<@${interaction.user.id}> is requesting a deposit of **$${amount}** that will be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n They have a current balance of **$${balance}**.`)
            .setImage(attachment)
            .setColor('White')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

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

        const responseEmbed = new EmbedBuilder()
            .setTitle('Deposit Request Sent')
            .setDescription(`Your deposit of **$${amount}** will be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**.`)
            .setImage(attachment)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [responseEmbed] });

        db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
        await db.set(`${interaction.guild.id}.${interaction.user.id}`, { amount: amount });

        return module.exports = { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, balance, argumentUser, userID, requestMsg };
    }
};