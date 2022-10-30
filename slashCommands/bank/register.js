const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'register',
    description: "Register a User to the Banking System",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        function generateID(length) {
            let result = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        const user = generateID(12);

        let passwordList = [];
        const allFileContents = await fs.readFileSync('./passwordList.txt', 'utf-8');
        allFileContents.split(/\r?\n/).forEach(line => {
            passwordList.push(`${line}`);
        });
        const passphrase = passwordList[Math.floor(Math.random() * passwordList.length)];

        const conn = await client.pool.getConnection();
        conn.query(`INSERT INTO eco (id, passphrase, balance) VALUES ('${user}', '${passphrase}', '0');`);
        conn.release();

        const userID = interaction.user.id;
        await client.users.cache.get(userID).send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Registered')
                    .setDescription(`Your account ID is **${user}** and your account passphrase is **${passphrase}**. Please keep these safe as they are the only way to access your account.`)
                    .setColor('White')
                    .setTimestamp()
                    .setFooter({ text: `${user} `, iconURL: interaction.guild.iconURL() })
            ]
        });

        return await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('User Registered')
                    .setDescription(`You have been successfully registered! Your credentials have been sent to your DMs.`)
                    .setColor('White')
                    .setTimestamp()
                    .setFooter({ text: `${user} `, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};