const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setchannel',
    description: "Set which channel to direct actions.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'deposit',
            description: 'Specify which channel will deposit requests go.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Specify which channel will deposit requests go.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'withdraw',
            description: 'Specify which channel will withdrawal requests go.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Specify which channel will withdrawal requests go.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'interest',
            description: 'Set the interest channel to be notified when interest is applied to accounts.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Specify which channel interest notifications will go.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const channel = interaction.options.getChannel('channel');

        if (channel.type != '0' && channel.type != '6') {
            const invalidChannelEmbed = new EmbedBuilder()
                .setTitle('Invalid Channel')
                .setDescription(`You must specify a text channel!`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'deposit') {
            const db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
            await db.set(`${interaction.guild.id}.channelID`, { depositChannelID: `${channel.id}` });
    
            const setupEmbed = new EmbedBuilder()
                .setTitle('Deposit Channel Setup')
                .setDescription(`Sucessfully set the deposit requests channel in **${interaction.guild.name}** to be ${channel}`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });
    
            return await interaction.reply({ embeds: [setupEmbed] });
        } else if (interaction.options.getSubcommand() === 'withdraw') {
            const db = new QuickDB({ filePath: `./data/withdrawInfo.sqlite` });
            await db.set(`${interaction.guild.id}.channelID`, { withdrawChannelID: `${channel.id}` });
    
            const setupEmbed = new EmbedBuilder()
                .setTitle('Withdrawal Channel Setup')
                .setDescription(`Sucessfully set the withdraw requests channel in **${interaction.guild.name}** to be ${channel}`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });
    
            return await interaction.reply({ embeds: [setupEmbed] });
        } else if (interaction.options.getSubcommand() === 'interest') {
            const db = new QuickDB({ filePath: `./data/interest.sqlite` });
            await db.set(`${interaction.guild.id}.channelID`, { interestChannelID: `${channel.id}` });
    
            const setupEmbed = new EmbedBuilder()
                .setTitle('Interest Channel Setup')
                .setDescription(`Sucessfully set interest notifications channel in **${interaction.guild.name}** to be ${channel}`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });
    
            return await interaction.reply({ embeds: [setupEmbed] });
        }
    }
};