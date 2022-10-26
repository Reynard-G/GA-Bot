const { EmbedBuilder, ApplicationCommandType,ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: 'db',
    description: "Administrator Command: Add, Remove, and Check certain Database IDs.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'add',
            description: 'Add data properties using an ID.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    description: "The Database's name you want to modify.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'id',
                    description: 'The ID of the table you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'properties',
                    description: 'The properties of the data you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'value',
                    description: 'The value of the data you want to add.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            description: 'Remove data properties using an ID.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    description: "The Database's name you want to modify.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'id',
                    description: 'The ID of the table you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'properties',
                    description: 'The properties of the data you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'check',
            description: 'Check data properties using an ID.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    description: "The Database's name you want to modify.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'id',
                    description: 'The ID of the table you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'properties',
                    description: 'The properties of the data you want to access.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (interaction.user.id != '399708215534944267') {
            const permEmbed = new EmbedBuilder()
                .setTitle('Insufficient Permissions')
                .setDescription(`You have insufficient permissions due to not having access to databases.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [permEmbed], ephemeral: true });
        }

        const fileName = interaction.options.getString('name');
        let Path = path.join(__dirname, `../../data/${fileName}.sqlite`);

        if (!fs.existsSync(Path)) {
            const notFoundEmbed = new EmbedBuilder()
                .setTitle('Database Not Found')
                .setDescription(`The database **${fileName}.sqlite** was not found.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
        }

        // Set the path as described above.
        const db = new QuickDB({ filePath: Path });
        const tableID = interaction.options.getString('id');
        const tableProperties = interaction.options.getString('properties');

        // Check if ID & properties is valid
        if (!await db.has(`${tableID}`)) {
            const noIDEmbed = new EmbedBuilder()
                .setTitle(`Database: **${fileName}.sqlite**`)
                .setDescription(`The table ID **${tableID}** does not exist.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noIDEmbed], ephemeral: true });
        }

        if (!await db.has(`${tableID}.${tableProperties}`)) {
            const noPropertiesEmbed = new EmbedBuilder()
                .setTitle(`Database: **${fileName}.sqlite**`)
                .setDescription(`The property(s) **${tableProperties}** does not exist.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noPropertiesEmbed], ephemeral: true });
        }

        const value = await db.get(`${tableID}.${tableProperties}`);

        if (interaction.options.getSubcommand() === 'check') { // Count the dots here from 'properties', if 1 dot, the table has 2 properties (guildid.userid.depositrequest)
            const checkEmbed = new EmbedBuilder()
                .setTitle(`Database: ${fileName}.sqlite`)
                .setColor('White')
                .addFields({ name: `${tableProperties}:`, value: JSON.stringify(value), inline: false })
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [checkEmbed] });
        } else if (interaction.options.getSubcommand() === 'add') {
            await db.set(`${tableID}.${tableProperties}`, interaction.options.getString('value'));

            const addEmbed = new EmbedBuilder()
                .setTitle(`Database: ${fileName}.sqlite`)
                .setColor('Green')
                .addFields({ name: `${tableID}.${tableProperties}`, value: `Added value of: ${interaction.options.getString('value')}`, inline: false }) // Fix this shit
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [addEmbed] });
        } else if (interaction.options.getSubcommand() === 'remove') {
            await db.delete(`${tableID}.${tableProperties}`);

            const addEmbed = new EmbedBuilder()
                .setTitle(`Database: ${fileName}.sqlite`)
                .setColor('Red')
                .addFields({ name: `${tableID}.${tableProperties}`, value: `Removed table of: ${tableID}.${tableProperties}`, inline: false }) // Fix this shit
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [addEmbed] });
        }
    }
};
