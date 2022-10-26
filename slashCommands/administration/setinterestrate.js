const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setinterestrate',
    description: "Set the interest rate of a specific user.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'rate',
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
        const db = new QuickDB({ filePath: `./data/interest.sqlite` });
        const userID = interaction.options.get('user').value;
        const constant = interaction.options.getNumber('constant') ?? 0;
        const percentage = interaction.options.getNumber('percentage') * 100 ?? 0;

        await db.set(`${interaction.guild.id}.${userID}.rate`, { percentage: percentage, constant: constant });

        const interestEmbed = new EmbedBuilder()
            .setTitle('Interest Rate Setup')
            .setDescription(`Successfully set <@${userID}>'s interest rate to be **${percentage}%** + **$${constant}**`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [interestEmbed] });
    }
};