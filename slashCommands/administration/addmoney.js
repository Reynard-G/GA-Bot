const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'addmoney',
    description: "Administrator Command, adds money to a specified account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to add.',
            required: true,
            type: ApplicationCommandOptionType.Number
        },
        {
            name: 'id',
            description: 'Specify an account to add funds too.',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async (client, interaction) => {
        const amount = interaction.options.getNumber('amount');
        const id = interaction.options.getString('id');

        // Check if ID exists in database then continue
        const checkID = await conn.query(`SELECT * FROM eco WHERE id='${id}'`);
        if (checkID.length < 1) return await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Invalid ID')
                    .setDescription(`The ID that you have entered does not exist. Please try again.`)
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: `INVALID ID`, iconURL: interaction.guild.iconURL() })
            ]
        });

        const conn = await client.pool.getConnection();
        await conn.query(`UPDATE eco SET balance=balance + ${amount} WHERE id='${id}'`);
        conn.release();

        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Money Added')
                    .setDescription(`Sucessfully added **$${amount}** to \`${id}\`'s balance.`)
                    .setColor('Green')
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() })
            ]
        });
    }
};