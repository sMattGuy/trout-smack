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
		target_user.minnow++
		original_user.minnow_given++;
		original_user.last_minnow = Date.now();
		
		let minnowImage = 'https://i.imgur.com/cFJo4Px.png';
		let minnowDesc = `${interaction.user} has hit ${targetUser} with a Tiny Minnow!`;
		let minnowTitle = 'Smacked with a Tiny Minnow!'; 
		
		if(Math.random() >= .95){
			minnowImage = 'https://i.imgur.com/ONrwn51.png';
			minnowDesc = `${interaction.user} has hit ${targetUser} with a Golden Minnow! It's worth 5 Minnows!`;
			minnowTitle = 'Smacked with a Golden Minnow!';
			target_user.minnow += 4;
			original_user.minnow_given += 4;
		}
		//alert users
		const troutEmbed = new EmbedBuilder()
			.setColor(0xffe4c1)
			.setTitle(minnowTitle)
			.setDescription(minnowDesc)
			.setImage(minnowImage)
		await interaction.reply({embeds:[troutEmbed]});
		target_user.save();
		original_user.save();
	},
};
