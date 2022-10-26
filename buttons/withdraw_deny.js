const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'withdraw_deny_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, percentage, constant, taxedAmount, amount, userID } = require("../slashCommands/bank/withdraw");
		let db = new QuickDB({ filePath: `./data/roles.sqlite` });
		const buttonUser = await interaction.guild.members.cache.get(interaction.user.id);
		const bankerRole = await db.get(`${interaction.guild.id}.bankerRole`) ?? null;

		if (!buttonUser.roles.cache.has(bankerRole)) {
			const permEmbed = new EmbedBuilder()
				.setTitle('Insufficient Permissions')
				.setDescription(`You have insufficient permissions due to not having the <@&${bankerRole}> role.`)
				.setColor('Red')
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

			return await interaction.reply({ embeds: [permEmbed], ephemeral: true });
		}

		buttons.components[0].setDisabled(true);
		buttons.components[1].setDisabled(true);

		requestEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Request')
			.setDescription(`<@${userID}>'s withdrawal request of **$${amount}** is **DENIED** and was going to be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**.`)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });

		const denyEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Denied')
			.setDescription(`Denied <@${userID}>'s request to withdrawal **$${amount}** taxed to **$${taxedAmount}**.`)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await client.users.cache.get(userID).send({ embeds: [denyEmbed] });

		db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`);
	}
};
