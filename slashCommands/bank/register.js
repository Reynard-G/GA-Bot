const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const fetch = require('node-fetch');

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

        function getRandomPassphrase(arr, n) {
            var result = new Array(n),
                len = arr.length,
                taken = new Array(len);
            if (n > len)
                throw new RangeError("getRandom: more elements taken than available");
            while (n--) {
                var x = Math.floor(Math.random() * len);
                result[n] = arr[x in taken ? taken[x] : x];
                taken[x] = --len in taken ? taken[len] : len;
            }
            return result;
        }

        const user = generateID(12);

        let passwordList = [];
        const allFileContents = await fetch('https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt').then(response => response.text());
        allFileContents.split(/\r?\n/).forEach(line => {
            passwordList.push(`${line}`);
        });
        const passphrase = getRandomPassphrase(passwordList, 6).join(' ');

        const conn = await client.pool.getConnection();
        conn.query(`INSERT INTO eco (id, passphrase, balance) VALUES ('${user}', '${passphrase}', '0');`);
        conn.release();

        const userID = interaction.user.id;
        await client.users.cache.get(userID).send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Registered')
                    .setDescription(`
                    Please keep this information safe and secure. If you lose this information or leak it, we will not be able to help you recover your account/funds.
                    
                    **Account ID:** \`${user}\`
                    **Passphrase:** \`${passphrase}\`
                    `)
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