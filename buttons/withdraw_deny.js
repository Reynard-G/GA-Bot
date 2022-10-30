const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'withdraw_deny_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, percentage, constant, taxedAmount, amount, userID, id } = require("../modals/withdraw");

		buttons.components[0].setDisabled(true);
		buttons.components[1].setDisabled(true);

		requestEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Request')
			.setDescription(`\`${id}\`'s withdrawal request of **$${amount}** is **DENIED** and was going to be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**.`)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await interaction.update({
			embeds: [requestEmbed],
			components: [buttons]
		});
		await client.users.cache.get(userID).send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Withdrawal Denied')
					.setDescription(`Denied \`${id}\`'s request to withdrawal **$${amount}** taxed to **$${taxedAmount}**.`)
					.setColor('Red')
					.setTimestamp()
					.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() })
			]
		});

		const db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${id}.amount`);
	}
};
