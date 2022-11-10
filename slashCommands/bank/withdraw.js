const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'withdraw',
    description: "Request a withdrawal from your bank account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to add.',
            required: true,
            type: ApplicationCommandOptionType.Number
        }
    ],
    run: async (client, interaction) => {
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
            .setCustomId('withdraw_modal');

        const ignInput = new TextInputBuilder()
            .setCustomId('ignInput')
            .setPlaceholder('Enter your in-game name here')
            .setStyle(TextInputStyle.Short)
            .setLabel('In-Game Name')
            .setMinLength(1)
            .setMaxLength(16)
            .setRequired(true);

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

        const ignRow = new ActionRowBuilder()
            .addComponents(ignInput);

        const idRow = new ActionRowBuilder()
            .addComponents(idInput);

        const passphraseRow = new ActionRowBuilder()
            .addComponents(passphraseInput);

        loginModal.addComponents(ignRow, idRow, passphraseRow);
        await interaction.showModal(loginModal);

        return module.exports = { amount };
    }
};