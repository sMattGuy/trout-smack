const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { User } = require('../../dbObjects.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Trout Smack')
		.setType(ApplicationCommandType.User),
	async execute(interaction) {
		const targetUser = interaction.targetUser;
		let whaled = false;
		if(targetUser.bot){
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Trout Bots!')
				.setDescription(`Bots cannot be hit with Trout!`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//check if same user
		if(interaction.user.id == targetUser.id){
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Trout Yourself!')
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
		//check if user trouted someone recently
		if(original_user.last_hit + 7200000 >= Date.now()){
			let hitAgain = original_user.last_hit + 7200000 - Date.now();
			let hours = Math.floor((hitAgain % (1000*60*60*24))/(1000*60*60));
			let mins = Math.floor((hitAgain % (1000*60*60))/(1000*60));
			let secs = Math.floor((hitAgain % (1000*60))/(1000));
			
			const errorEmbed = new EmbedBuilder()
				.setColor(0xeb3434)
				.setTitle('Can\'t Trout yet!')
				.setDescription(`You're on Trout cooldown! You can Trout again in ${hours}:${mins}:${secs}`)
			return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
		}
		//check if user attacking same person twice
		if(original_user.last_user == target_user.id){
			if(original_user.last_hit + 172800000 >= Date.now()){
				const errorEmbed = new EmbedBuilder()
					.setColor(0xeb3434)
					.setTitle('Can\'t attack twice!')
					.setDescription(`You previously Trouted this person! You cannot Trout the same person twice in a row!`)
				return await interaction.reply({embeds:[errorEmbed],ephemeral:true});
			}
		}
		//commence the troutening
		//update users
		target_user.trout++
		original_user.trout_given++;
		original_user.last_hit = Date.now();
		original_user.last_user = target_user.id;
		//calculate if current smack is a combo smack
		let combo_alert = "";
		if(Date.now() - target_user.last_trout_wacked <= 30000){
			//it is considered a combo if they were smacked within 30 seconds of the last smack
			target_user.trout_combo++;
			combo_alert = `Combo Smack! x${target_user.trout_combo}!`;
		}
		else{
			target_user.trout_combo = 1;
		}
		if(target_user.trout_highest_combo < target_user.trout_combo){
			target_user.trout_highest_combo = target_user.trout_combo;
		}
		//alert users
		let troutImage = 'https://i.imgur.com/Wpxy5Qy.png';
		let troutDesc = `${interaction.user.username} has hit ${targetUser.username} with a Wet Trout!`;
		let troutTitle = `Smacked with a Wet Trout! ${combo_alert}`; 
		if(Math.random() >= .95){	
			troutImage = 'https://i.imgur.com/HCIp5Hk.png';
			troutDesc = `${interaction.user.username} has hit ${targetUser.username} with a Rainbow Trout! It packs 10 Trouts in one!`;
			troutTitle = `Smacked with a Rainbow Trout! ${combo_alert}`
			target_user.trout += 9;
			original_user.trout_given += 9;
		}
		// whaled is possible
		if(target_user.trout >= 100){
			//theyre getting whale
			target_user.trout -= 100;
			target_user.whale++;
			whaled = true;
		}
		//record new last time they got wacked
		target_user.last_trout_wacked = Date.now();
		target_user.save();
		original_user.save();
		//send embeds
		const troutEmbed = new EmbedBuilder()
			.setColor(0x4e5153)
			.setTitle(troutTitle)
			.setDescription(troutDesc)
			.setImage(troutImage)
		await interaction.reply({embeds:[troutEmbed]});
		if(whaled){
			const whaleEmbed = new EmbedBuilder()
				.setColor(0x053047)
				.setTitle(`A Whale Decends!`)
				.setDescription(`All these Trouts have attracted something larger, ${targetUser.username}! ${interaction.user.username} calls upon a Whale to Smash You!`)
				.setImage('https://i.imgur.com/V5Gqyu0.png')
			await interaction.followUp({embeds:[whaleEmbed]});
		}
	},
};
