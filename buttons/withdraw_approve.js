const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'withdraw_approve_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, percentage, constant, taxedAmount, amount, balance, userID, id } = require("../modals/withdraw");
		const conn = await client.pool.getConnection();
		balance = (await conn.query(`SELECT balance FROM eco WHERE id = '${id}';`))[0].balance; // Get balance again to update it
		const currBalance = +Number(Math.round(parseFloat((balance - amount) + "e2")) + "e-2");
		await conn.query(`UPDATE eco SET balance=${currBalance} WHERE id='${id}';`);

		buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Approve')
					.setStyle('Success')
					.setEmoji('<:approved:815575466231463956>')
					.setCustomId('withdraw_approve_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Deny')
					.setStyle('Danger')
					.setEmoji('<:denied:815575438750777344>')
					.setCustomId('withdraw_deny_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Send Image')
					.setStyle('Secondary')
					.setEmoji('<:denied:1029595480734322728>')
					.setCustomId('withdraw_approve_image_button')
			);

		requestEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Request')
			.setDescription(`\`${id}\`'s withdrawal request of **$${amount}** is **ACCEPTED** and was taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n Balance: **$${balance}**  ➡️  **$${currBalance}**.`)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });
		module.exports = { requestEmbed, buttons, userID, id };
		await client.users.cache.get(userID).send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Withdrawal Approved')
					.setDescription(`Approved \`${id}\`'s request to withdrawal **$${amount}** taxed to **$${taxedAmount}**.`)
					.setColor('Green')
					.setTimestamp()
					.setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
			]
		});

		const db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${id}.amount`);
	}
};
