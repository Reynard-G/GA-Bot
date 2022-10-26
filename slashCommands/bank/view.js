const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const Economy = require('discord-economy-super');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'view',
    description: "View the settings of your server or a certain user in your server.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'balance',
            description: "Check a user's balance in your server.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'Specify the user to check their current balance.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'depositchannel',
            description: "Check what the server's deposit channel is set too.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'depositrate',
            description: "Check what the server's deposit rates are set too.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'withdrawchannel',
            description: "Check what the server's withdrawal channel is set too.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'withdrawrate',
            description: "'Check what the server's withdrawal rates are set too.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'interestrate',
            description: 'Check what the interest rate of a specific user is set too.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'Specify the user to check their current interest rate.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'balance') {

            const eco = new Economy({
                storagePath:
                    `./data/eco.json`
            });
            const userID = interaction.options.get('user').value;
            const argumentUser = eco.users.get(userID, interaction.guild.id);
            const balance = argumentUser.balance.get();

            const balanceEmbed = new EmbedBuilder()
                .setTitle('Balance')
                .setDescription(`<@${userID}>'s balance is currently **$${balance}**.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [balanceEmbed] });

        } else if (interaction.options.getSubcommand() === 'depositchannel') {

            const db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
            const depositChannelID = await db.get(`${interaction.guild.id}.channelID.depositChannelID`) ?? null;

            const depositChannelEmbed = new EmbedBuilder()
                .setTitle('Deposit Channel')
                .setDescription(`The current deposit channel for **${interaction.guild.name}** is <#${depositChannelID}>.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [depositChannelEmbed] });

        } else if (interaction.options.getSubcommand() === 'depositrate') {

            const db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
            const depositRateConstant = await db.get(`${interaction.guild.id}.rate.constant`) ?? 0;
            const depositRatePercentage = await db.get(`${interaction.guild.id}.rate.percentage`) ?? 0;

            const depositChannelEmbed = new EmbedBuilder()
                .setTitle('Deposit Rates')
                .setDescription(`The current deposit rates for **${interaction.guild.name}** are **${depositRatePercentage}%** + **$${depositRateConstant}**.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [depositChannelEmbed] });

        } else if (interaction.options.getSubcommand() === 'withdrawchannel') {

            const db = new QuickDB({ filePath: `./data/withdraw.sqlite` });
            const withdrawChannelID = await db.get(`${interaction.guild.id}.channelID.withdrawChannelID`) ?? null;

            const withdrawChannelEmbed = new EmbedBuilder()
                .setTitle('Withdraw Channel')
                .setDescription(`The current withdrawal channel for **${interaction.guild.name}** is <#${withdrawChannelID}>.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [withdrawChannelEmbed] });

        } else if (interaction.options.getSubcommand() === 'withdrawrate') {

            const db = new QuickDB({ filePath: `./data/withdraw.sqlite` });
            const withdrawRateConstant = await db.get(`${interaction.guild.id}.rate.constant`) ?? 0;
            const withdrawRatePercentage = await db.get(`${interaction.guild.id}.rate.percentage`) ?? 0;

            const withdrawChannelEmbed = new EmbedBuilder()
                .setTitle('Withdrawal Rates')
                .setDescription(`The current withdrawal rates for **${interaction.guild.name}** are **${withdrawRatePercentage}%** + **$${withdrawRateConstant}**.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [withdrawChannelEmbed] });

        } else if (interaction.options.getSubcommand() === 'interestrate') {

            const userID = interaction.options.get('user').value;
            const db = new QuickDB({ filePath: `./data/interest.sqlite` });
            const interestRateConstant = await db.get(`${interaction.guild.id}.${userID}.rate.constant`) ?? 0;
            const interestRatePercentage = await db.get(`${interaction.guild.id}.${userID}.rate.percentage`) ?? 0;

            const interestRateEmbed = new EmbedBuilder()
                .setTitle('Interest Rates')
                .setDescription(`The current interest rates for <@${userID}> in **${interaction.guild.name}** are **${interestRatePercentage}%** + **$${interestRateConstant}**.`)
                .setColor('White')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [interestRateEmbed] });

        }
    }
};