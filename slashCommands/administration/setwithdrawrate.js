const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setwithdrawrate',
    description: "Set the withdraw rate at which to tax players when submitting a withdrawal.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'rate',
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
        }
    ],
    run: async (client, interaction) => {
        const db = new QuickDB({ filePath: `./data/withdrawInfo.sqlite` });
        const constant = interaction.options.getNumber('constant') ?? 0;
        const percentage = interaction.options.getNumber('percentage') * 100 ?? 0;

        if (percentage < 0 || percentage > 100) {
            const embed = new EmbedBuilder()
                .setTitle('Invalid Percentage')
                .setDescription(`Percentages must be between 0 & 1. Zero represents 0% while 1 represents 100%.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [embed] });
        }

        await db.set(`${interaction.guild.id}.rate`, { percentage: percentage, constant: constant });

        const setupEmbed = new EmbedBuilder()
            .setTitle('Withdrawal Rate Setup')
            .setDescription(`Sucessfully set the withdrawal rate to be **${percentage}%** + **$${constant}**.`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [setupEmbed] });
    }
};