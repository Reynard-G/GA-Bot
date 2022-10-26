const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setdepositrate',
    description: "Set the deposit rate at which to tax players when submitting a deposit.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'rate',
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
        }
    ],
    run: async (client, interaction) => {
        const db = new QuickDB({ filePath: `./data/depositInfo.sqlite` });
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

        await db.set(`${interaction.guild.id}.rate`, { percentage: percentage, constant: constant });

        const setupEmbed = new EmbedBuilder()
            .setTitle('Deposit Rate Setup')
            .setDescription(`Sucessfully set the deposit rate to be **${percentage}%** + **$${constant}**.`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [setupEmbed] });
    }
};