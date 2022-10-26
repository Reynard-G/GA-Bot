const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setrate',
    description: "Set the rate to actions will be taxed at.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'deposit',
            description: 'Specify what type & amount to tax deposit requests.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'constant',
                    description: 'Set a constant rate at which to tax deposit requests.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'percentage',
                    description: 'Set a percentage rate at which to tax deposit requests.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                }
            ]
        },
        {
            name: 'withdraw',
            description: 'Specify what type & amount to tax withdraw requests.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'constant',
                    description: 'Set a constant rate at which to tax withdrawal requests.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'percentage',
                    description: 'Set a percentage rate at which to tax withdrawal requests.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                }
            ]
        },
        {
            name: 'interest',
            description: 'Specify what type & amount to calculate interest for bank accounts.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    description: 'Set an interest rate to a specific user.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'constant',
                    description: 'Set a constant rate to interest rates.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'percentage',
                    description: 'Set a percentage rate to interest rates.',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const constant = interaction.options.getNumber('constant') ?? 0;
        const percentage = interaction.options.getNumber('percentage') * 100 ?? 0;

        if (percentage < 0 || percentage > 100) {
            const embed = new EmbedBuilder()
                .setTitle('Invalid Percentage')
                .setDescription(`Percentages must be between 0 & 1. Zero represents 0% while 1 represents 100%.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [embed] });
        }

        if (interaction.options.getSubcommand() === 'deposit') {
            const db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
            await db.set(`${interaction.guild.id}.rate`, { percentage: percentage, constant: constant });

            const setupEmbed = new EmbedBuilder()
                .setTitle('Deposit Rate Setup')
                .setDescription(`Sucessfully set the deposit rate to be **${percentage}%** + **$${constant}**.`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [setupEmbed] });
        } else if (interaction.options.getSubcommand() === 'withdraw') {
            const db = new QuickDB({ filePath: `./data/withdrawInfo.sqlite` });
            await db.set(`${interaction.guild.id}.rate`, { percentage: percentage, constant: constant });

            const setupEmbed = new EmbedBuilder()
                .setTitle('Withdrawal Rate Setup')
                .setDescription(`Sucessfully set the withdrawal rate to be **${percentage}%** + **$${constant}**.`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [setupEmbed] });
        } else if (interaction.options.getSubcommand() === 'interest') {
            const userID = interaction.options.get('user').value;
            const db = new QuickDB({ filePath: `./data/interest.sqlite` });
            await db.set(`${interaction.guild.id}.${userID}.rate`, { percentage: percentage, constant: constant });

            const interestEmbed = new EmbedBuilder()
                .setTitle('Interest Rate Setup')
                .setDescription(`Successfully set <@${userID}>'s interest rate to be **${percentage}%** + **$${constant}**`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [interestEmbed] });
        }
    }
};