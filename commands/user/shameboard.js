const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { User } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('smackboard')
		.setDescription('See the top 3 most smacked!')
		.addStringOption(option => 
			option
				.setName('type')
				.setDescription('Which fish smack to check')
				.setRequired(true)
				.addChoices(
				{name:'Trout', value:'trout'},
				{name:'Minnow', value:'minnow'},
			)),
	async execute(interaction) {
		let fish_option = interaction.options.getString('type');
		let list = await User.findAll({where:{server_id: interaction.guild.id}});
		if(list.length < 3){
			return interaction.reply({content:'Not enough users!',ephemeral:true})
		}
		let userArray =  [];
		await interaction.deferReply();
		for(let i=0;i<list.length;i++){
			try{
				const username = await interaction.guild.members.fetch(list[i].user_id).then(userf => {return userf.displayName});
				let smacks = 0;
				if(fish_option == "trout"){
					smacks = list[i].trout + (100 * list[i].whale);
				}
				else{
					smacks = list[i].minnow;
				}
				userArray.push({'name':username,'smacks':smacks});
			} catch(e){
				console.log('failed to get username');
			}
		}
		userArray.sort(function (a,b){
			return (parseInt(b.smacks) - parseInt(a.smacks));
		});
		let message = `Top 3 Smacked with a ${fish_option}\n`;
		for(let i=0;i<3;i++){
			message += `${i+1}. ${userArray[i].name}: ${userArray[i].smacks}\n`;
		}
		await interaction.editReply({content:codeBlock(`${message}`)});
	},
};
