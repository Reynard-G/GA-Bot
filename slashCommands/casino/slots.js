const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'slots',
    description: "$100, play a game of slots.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const loginModal = new ModalBuilder()
            .setTitle('Login')
            .setCustomId('slots_modal');

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
        return await interaction.showModal(loginModal);
    }
};