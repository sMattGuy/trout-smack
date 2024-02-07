const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { User } = require('../../dbObjects.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Minnow Smack')
		.setType(ApplicationCommandType.User),
	async execute(interaction) {
		const targetUser = interaction.targetUser;
		if(targetUser.bot){
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Minnow Bots!')
				.setDescription(`Bots cannot be hit with a Minnow!`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//check if same user
		if(interaction.user.id == targetUser.id){
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Minnow Yourself!')
				.setDescription(`You can't hit yourself!`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//gather both users
		let original_user = await User.findOne({where:{user_id: interaction.user.id, server_id: interaction.guild.id}});
		if(!original_user){
			original_user = await User.create({user_id: interaction.user.id, server_id: interaction.guild.id});
		}
		let target_user = await User.findOne({where:{user_id: targetUser.id, server_id: interaction.guild.id}});
		if(!target_user){
			target_user = await User.create({user_id: targetUser.id, server_id: interaction.guild.id});
		}
		//check if user minnowd someone recently
		if(original_user.last_minnow + 1800000 >= Date.now()){
			let hitAgain = original_user.last_minnow + 1800000 - Date.now();
			let hours = Math.floor((hitAgain % (1000*60*60*24))/(1000*60*60));
			let mins = Math.floor((hitAgain % (1000*60*60))/(1000*60));
			let secs = Math.floor((hitAgain % (1000*60))/(1000));
			
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Minnow yet!')
				.setDescription(`You're on Minnow cooldown! You can Minnow again in ${hours}:${mins}:${secs}`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//commence the troutening
		//update users
		//calculate if current smack is a combo smack
		let combo_alert = "";
		if(Date.now() - target_user.last_minnow_wacked <= 10000){
			//it is considered a combo if they were smacked within 10 seconds of the last smack
			target_user.minnow_combo++;
			combo_alert = `Combo Smack! x${target_user.minnow_combo}!`;
		}
		else{
			target_user.minnow_combo = 1;
		}
		if(target_user.minnow_highest_combo < target_user.minnow_combo){
			target_user.minnow_highest_combo = target_user.minnow_combo;
		}
		target_user.minnow++;
		target_user.true_minnow++;
		original_user.minnow_given++;
		original_user.last_minnow = Date.now();
		
		let minnowImage = 'https://i.imgur.com/cFJo4Px.png';
		let minnowDesc = `${interaction.user} has hit ${targetUser} with a Tiny Minnow!`;
		let minnowTitle = `Smacked with a Tiny Minnow! ${combo_alert}`; 
		
		if(Math.random() >= .95){
			minnowImage = 'https://i.imgur.com/ONrwn51.png';
			minnowDesc = `${interaction.user} has hit ${targetUser} with a Golden Minnow! It's worth 5 Minnows!`;
			minnowTitle = `Smacked with a Golden Minnow! ${combo_alert}`;
			target_user.minnow += 4;
			target_user.true_minnow += 4;
			original_user.minnow_given += 4;
		}
		//alert users
		const troutEmbed = new EmbedBuilder()
			.setColor(0xffe4c1)
			.setTitle(minnowTitle)
			.setDescription(minnowDesc)
			.setImage(minnowImage)
		await interaction.reply({embeds:[troutEmbed]});
		target_user.last_minnow_wacked = Date.now();
		//check if 10 minnows accumulated, then convert it into a trout
		if(target_user.minnow >= 10){
			target_user.minnow -= 10;
			target_user.trout++;
			target_user.last_trout_wacked = Date.now();
			const troutEmbed = new EmbedBuilder()
				.setColor(0xffe4c1)
				.setTitle('A Trout Appears!')
				.setDescription('All these little minnow have attracted a trout!')
				.setImage('https://i.imgur.com/Wpxy5Qy.png')
			await interaction.followUp({embeds:[troutEmbed]});
		}
		target_user.save();
		original_user.save();
	},
};
