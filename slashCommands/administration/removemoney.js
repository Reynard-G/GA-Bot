const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'removemoney',
    description: "Administrator Command, removes money to a specified account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to remove.',
            required: true,
            type: ApplicationCommandOptionType.Number
        },
        {
            name: 'id',
            description: 'Specify an account to remove funds too.',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async (client, interaction) => {
        const amount = interaction.options.getNumber('amount');
        const id = interaction.options.getString('id');

        // Check if ID exists in database then continue
        let conn = await client.pool.getConnection();
        const checkID = await conn.query(`SELECT * FROM eco WHERE id='${id}'`);
        conn.release();

        if (checkID.length < 1) {
            return await interaction.reply({
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
        }

        conn = await client.pool.getConnection();
        await conn.query(`UPDATE eco SET balance=balance - ${amount} WHERE id='${id}'`);
        conn.release();

        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Money Removed')
                    .setDescription(`Sucessfully removed **$${amount}** to \`${id}\`'s balance.`)
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() })
            ]
        });
    }
};