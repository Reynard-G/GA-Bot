const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'roulette',
    description: "$100, play a game of roulette.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'bet',
            description: 'Specify a bet.',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'red',
                    value: 'red',
                },
                {
                    name: 'black',
                    value: 'black',
                },
                {
                    name: 'gold',
                    value: 'gold',
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const chose = interaction.options.getString('bet');

        const loginModal = new ModalBuilder()
            .setTitle('Login')
            .setCustomId('roulette_modal');

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

        return module.exports = { chose };
    }
};