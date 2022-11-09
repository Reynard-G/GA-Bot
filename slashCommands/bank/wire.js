const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'wire',
    description: "Send money to another user.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'id',
            description: 'Specify an account id to send money.',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'amount',
            description: 'Specific an amount to send a user.',
            required: true,
            type: ApplicationCommandOptionType.Number
        }
    ],
    run: async (client, interaction) => {
        const receiverID = interaction.options.getString('id');
        const amount = interaction.options.getNumber('amount');

        if (amount % 100 != 0) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Invalid Amount')
                        .setDescription('The amount must be a multiple of **$100** since \`1 share = $100\`.')
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `INVALID AMOUNT`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        const loginModal = new ModalBuilder()
            .setTitle('Login')
            .setCustomId('wire_modal');

        const idInput = new TextInputBuilder()
            .setCustomId('idInput')
            .setPlaceholder('Enter your account ID here')
            .setStyle(TextInputStyle.Short)
            .setLabel('Account ID')
            .setMinLength(12)
            .setMaxLength(12)
            .setRequired(true);

        const passphraseInput = new TextInputBuilder()
            .setCustomId('passphraseInput')
            .setPlaceholder('Enter your account passphrase here')
            .setStyle(TextInputStyle.Short)
            .setLabel('Account Passphrase')
            .setMinLength(0)
            .setMaxLength(255)
            .setRequired(true);

        const idRow = new ActionRowBuilder()
            .addComponents(idInput);

        const passphraseRow = new ActionRowBuilder()
            .addComponents(passphraseInput);

        loginModal.addComponents(idRow, passphraseRow);
        await interaction.showModal(loginModal);

        return module.exports = { receiverID, amount };
    }
};