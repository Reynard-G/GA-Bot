const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'nay_button',
    permissions: [],
    run: async (client, interaction) => {
        const loginModal = new ModalBuilder()
            .setTitle('Login')
            .setCustomId('nay_modal');

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
    }
};