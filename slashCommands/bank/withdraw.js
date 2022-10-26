const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ComponentType, ApplicationCommandOptionType } = require('discord.js');
const Economy = require('discord-economy-super');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'withdraw',
    description: "Request a withdrawal from your bank account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to add.',
            required: true,
            type: ApplicationCommandOptionType.Number
        }
    ],
    run: async (client, interaction) => {
        let db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });

        if (await db.has(`${interaction.guild.id}.${interaction.user.id}.amount`)) {
            const alreadyRequestedEmbed = new EmbedBuilder()
                .setTitle('Withdrawal Request')
                .setDescription(`You already have a withdrawal request pending! Do \`/cancelwithdraw\` to cancel your request.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [alreadyRequestedEmbed], ephemeral: true });
        }

        db = new QuickDB({ filePath: `./data/withdrawInfo.sqlite` });

        const eco = new Economy({
            storagePath:
                `./data/eco.json`
        });
        const amount = interaction.options.get('amount').value;
        const userID = interaction.user.id;
        const argumentUser = eco.users.get(interaction.user.id, interaction.guild.id);
        const balance = argumentUser.balance.get();

        function decimalCount(money) {
            if (money.toString().includes('.')) {
                return money.toString().split('.')[1].length;
            }
            return 0;
        }

        if (decimalCount(amount) > 2) {
            const decimalEmbed = new EmbedBuilder()
                .setTitle('Invalid Amount')
                .setDescription(`Withdraw amounts may only be up to the 100th's place (.01).`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [decimalEmbed], ephemeral: true });
        }

        const channelID = await db.get(`${interaction.guild.id}.channelID.withdrawChannelID`);
        const percentage = await db.get(`${interaction.guild.id}.rate.percentage`) ?? 0;
        const constant = await db.get(`${interaction.guild.id}.rate.constant`) ?? 0;
        const taxedAmount = +(Math.round(((amount * ((100 - percentage) / 100)) - constant) + "e+2") + "e-2");

        requestEmbed = new EmbedBuilder()
            .setTitle('Withdrawal Request')
            .setDescription(`<@${interaction.user.id}> is requesting a withdrawal of **$${amount}** that will be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n They have a current balance of **$${balance}**.`)
            .setColor('White')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Approve')
                    .setStyle('Success')
                    .setEmoji('<:approved:815575466231463956>')
                    .setCustomId('withdraw_approve_button'),
                new ButtonBuilder()
                    .setLabel('Deny')
                    .setStyle('Danger')
                    .setEmoji('<:denied:815575438750777344>')
                    .setCustomId('withdraw_deny_button')
            );

        const channel = await client.channels.cache.get(channelID) ?? interaction.channel;
        const requestMsg = await channel.send({ embeds: [requestEmbed], components: [buttons] }); // Send withdrawal request in set channel

        const responseEmbed = new EmbedBuilder()
            .setTitle('Withdrawal Request Sent')
            .setDescription(`Your withdrawal of **$${amount}** will be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**.`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [responseEmbed] });

        db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });
        await db.set(`${interaction.guild.id}.${interaction.user.id}`, { amount: amount });

        return module.exports = { requestEmbed, buttons, percentage, constant, taxedAmount, amount, balance, argumentUser, userID, requestMsg };
    }
};