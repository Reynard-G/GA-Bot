const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'deposit_deny_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, userID } = require("../slashCommands/bank/deposit");
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

		buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Approve')
					.setStyle('Success')
					.setEmoji('<:approved:815575466231463956>')
					.setCustomId('deposit_approve_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Deny')
					.setStyle('Danger')
					.setEmoji('<:denied:815575438750777344>')
					.setCustomId('deposit_deny_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Send Image')
					.setStyle('Secondary')
					.setEmoji('<:denied:1029595480734322728>')
					.setCustomId('deposit_deny_image_button')
			);

		requestEmbed = new EmbedBuilder()
			.setTitle('Deposit Request')
			.setDescription(`<@${userID}>'s deposit request of **$${amount}** is **DENIED** and was going to be taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**.`)
			.setImage(attachment)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });
		module.exports = { requestEmbed, buttons, userID };

		const denyEmbed = new EmbedBuilder()
			.setTitle('Deposit Denied')
			.setDescription(`Denied <@${userID}>'s request to deposit **$${amount}** taxed to **$${taxedAmount}**.`)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await client.users.cache.get(userID).send({ embeds: [denyEmbed] });

		db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`);
	}
};