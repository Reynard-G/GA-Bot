const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setwithdraw',
    description: "Set the withdrawal channel to approve/deny withdrawals.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'channel',
            description: 'Specify which channel will withdrawal requests go.',
            required: true,
            type: ApplicationCommandOptionType.Channel
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

        const db = new QuickDB({ filePath: `./data/withdrawInfo.sqlite` });
        await db.set(`${interaction.guild.id}.channelID`, { withdrawChannelID: `${channel.id}` });

        const setupEmbed = new EmbedBuilder()
            .setTitle('Withdrawal Channel Setup')
            .setDescription(`Sucessfully set the withdraw requests channel in **${interaction.guild.name}** to be ${channel}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [setupEmbed] });
    }
};