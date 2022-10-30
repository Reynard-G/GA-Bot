const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

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
            .setMinLength(6)
            .setMaxLength(6)
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