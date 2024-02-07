const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { User } = require('../../dbObjects.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Trout Stats')
		.setType(ApplicationCommandType.User),
	async execute(interaction) {
		const targetUser = interaction.targetUser;
		if(targetUser.bot){
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Check Bots!')
				.setDescription(`Bots don't have stats!`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//gather user
		let target_user = await User.findOne({where:{user_id: targetUser.id, server_id: interaction.guild.id}});
		if(!target_user){
			target_user = await User.create({user_id: targetUser.id, server_id: interaction.guild.id});
		}
		//calculate times
		let minnow_timer = 0;
		if(target_user.last_minnow + 1800000 >= Date.now()){
			let hitAgain = target_user.last_minnow + 1800000 - Date.now();
			let hours = Math.floor((hitAgain % (1000*60*60*24))/(1000*60*60));
			let mins = Math.floor((hitAgain % (1000*60*60))/(1000*60));
			let secs = Math.floor((hitAgain % (1000*60))/(1000));
			minnow_timer = `${hours}:${mins}:${secs}`;
		}
		if(minnow_timer == 0){
			minnow_timer = `Available!`
		}
		
		let trout_timer = 0;
		if(target_user.last_hit + 7200000 >= Date.now()){
			let hitAgain = target_user.last_hit + 7200000 - Date.now();
			let hours = Math.floor((hitAgain % (1000*60*60*24))/(1000*60*60));
			let mins = Math.floor((hitAgain % (1000*60*60))/(1000*60));
			let secs = Math.floor((hitAgain % (1000*60))/(1000));
			trout_timer = `${hours}:${mins}:${secs}`;
		}
		if(trout_timer == 0){
			trout_timer = `Available!`
		}
		
		//alert users
		const troutEmbed = new EmbedBuilder()
			.setColor(0x4e5153)
			.setTitle(`${targetUser.username} Stats`)
			.setDescription(`Can Trout? ${trout_timer}\nCan Minnow? ${minnow_timer}\nMinnow Smacks Given: ${target_user.minnow_given}\nTrout Smacks Given: ${target_user.trout_given}\nMinnow Smacks Received: ${target_user.minnow} (Total: ${target_user.true_minnow})\nTrout Smacks Received: ${target_user.trout} (Total: ${target_user.trout + (100 * target_user.whale)})\nWhale Smacks Received: ${target_user.whale}\nHighest Combo Sustained\nTrout: ${target_user.trout_highest_combo}\nMinnow: ${target_user.minnow_highest_combo}`)
		await interaction.reply({embeds:[troutEmbed]});
	},
};
