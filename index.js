const {Client, GatewayIntentBits, Discord,Collection,EmbedBuilder,ButtonBuilder,ActionRowBuilder} = require('discord.js');
const chalk = require("chalk");
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const fs = require('fs');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
const commands = [
    {
        name: 'help',
        description: `[MEMBER] View all My commands.`,
    },
    {
        name: 'invite',
        description: `[MEMBER] Invite me to your server`,
    },
{
    name: 'set-staff',
    description: `[ADMIN] Set the staff role for this server.`,
    options: [
        {
            name: 'role',
            type: 8,
            description: 'The role to set as the staff role.',
            required: true,
        },
    ],
},
{
    name: 'helpme',
    description: `[MEMBER] Request help from staff`,
    options: [
        {
            name: 'reason',
            type: 3,
            description: 'why you are need help?',
            required: true,
        },
    ],
},
];

const rest = new REST({ version: '9' }).setToken(''); //set your bot token here.

client.once('ready', async () => {
    try {
        console.log(chalk.green(`[LOG] Started refreshing application (/) commands.`));
        console.log(chalk.green(`[LOG] Logged is as ${client.user.username}`));
        const guilds = client.guilds.cache.size;
      
        client.user.setActivity(`${guilds} Servers`, { type: 'WATCHING' });

        setInterval(async () => {
            const guilds = client.guilds.cache.size;
      
            client.user.setActivity(`${guilds} Servers`, { type: 'WATCHING' });

          }, 20000);
            for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        {body: commands},
      );
    }
        console.log(chalk.green(`[LOG] Successfully reloaded application (/) commands.`));
    } catch (error) {
        console.error(error);
    }
});

client.on('guildCreate', async guild => {
    try {
        console.log(chalk.cyan(`[LOG] Joined to a new guild: ${guild.name}(${guild.id})`))
            await rest.put(
      Routes.applicationGuildCommands(client.user.id, guild.id),
      {body: commands},
    );
        console.log(chalk.green(`[LOG] Successfully registered (/) commands for guild: ${guild.name}`));
    } catch (error) {
        console.error(error);
    }
});

client.on(`interactionCreate`, async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: `${client.user.username} | Commands Help`
        })
        .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
        .setFooter({
            text: `${client.user.username}`
        })
        .setDescription(`**__\`/help\`__**\n** - View all \`${client.user.username}\` commands.**\n**__\`/set-staff <@role>\`__**\n** - Sets the staff role of \`${interaction.guild.name}\`**\n**__\`/helpme <reason>\`__**\n** - Request help from staff**\n**__\`/invite\`__**\n** - Add \`${client.user.username}\` to your server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
        await interaction.reply({embeds: [embed]});
    } else if (interaction.commandName === 'invite') {
        const embed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: `${client.user.username} | Invite`
        })
        .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
        .setFooter({
            text: `${client.user.username}`
        })
        .setDescription(`**Click on the button below to invite \`${client.user.username}\` to your server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle('Link')
            .setLabel(`Invite Me`)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`)
        )
        await interaction.reply({embeds: [embed],components: [row]});
    } else if (interaction.commandName === 'set-staff') {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        const role = interaction.options.getRole('role');
        const guildId = interaction.guild.id;
        const jsonFile = require('./staff.json');
        jsonFile[guildId] = { roleId: role.id};
        fs.writeFile('./staff.json', JSON.stringify(jsonFile), err => {
            if (err) {
                console.error(err);
                const errembed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: `${client.user.username} | Set-Staff`
                })
                .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
                .setFooter({
                    text: `${client.user.username}`
                })
                .setDescription(`**An error occurred while setting the staff role: \`\`\`${err}\`\`\`**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
                return interaction.reply({ embeds: [errembed], ephemeral: false });
            }
            const successembed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({
                name: `${client.user.username} | Set-Staff`
            })
            .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
            .setFooter({
                text: `${client.user.username}`
            })
            .setDescription(`**Staff role Settings Updated✅**\n**__User:__**\n${interaction.user}(${interaction.user.tag})\n**__Staff role:__**\n${interaction.options.getRole('role')}(${interaction.options.getRole('role').name})\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
            interaction.reply({ embeds: [successembed], ephemeral: false });
        });
    } else if (interaction.commandName === 'helpme') {
        const jsonFile = require('./staff.json');
        const roleId = jsonFile[interaction.guild.id]?.roleId;
        if (!roleId) {
            const roleerr = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: `${client.user.username} | Helpme`
            })
            .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
            .setFooter({
                text: `${client.user.username}`
            })
            .setDescription(`**The staff role has not been set for this server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
return await interaction.reply({embeds: [roleerr]});
        }
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            const roleerr1 = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: `${client.user.username} | Helpme`
            })
            .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
            .setFooter({
                text: `${client.user.username}`
            })
            .setDescription(`**The staff role no longer exists on this server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
return await interaction.reply({embeds: [roleerr1]});
        }
        const reason = interaction.options.getString('reason');
        const roleping = `<@&${role.id}>`;
        const voicechannel = interaction.member.voice.channel;
        const voiceName = voicechannel ? `\`${voicechannel.name}\` (<#${voicechannel.id}>)` : 'User not in voice';
        const helpmeembed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: `${client.user.username} | Helpme`
        })
        .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
        .setFooter({
            text: `${client.user.username}`
        })
        .setDescription(`**__User:__\n${interaction.user}(${interaction.user.tag})\n\n__Voice:__\n${voiceName}\n\n__Reason:__\n\`${reason}\`**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`)
        const helpmerow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('helpme_claim')
            .setLabel('Claim')
            .setStyle('Success')
        )
        await interaction.reply({content: `${roleping} | ${interaction.user}`, embeds: [helpmeembed], components: [helpmerow]})
    }
});
client.on(`interactionCreate`, async (interaction) => {
    if (interaction.customId === 'helpme_claim') {
      const jsonFile = require('./staff.json');
      const roleId = jsonFile[interaction.guildId]?.roleId;
      if (!roleId) {
        const roleerr = new EmbedBuilder()
          .setColor('Red')
          .setAuthor({
            name: `${interaction.client.user.username} | Claim`
          })
          .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `${interaction.client.user.username}`
          })
          .setDescription(`**The staff role has not been set for this server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`);
  
        return await interaction.reply({ embeds: [roleerr], ephemeral: true });
      }
  
      const role = interaction.guild.roles.cache.get(roleId);
  
      if (!role) {
        const roleerr1 = new EmbedBuilder()
          .setColor('Red')
          .setAuthor({
            name: `${interaction.client.user.username} | Claim`
          })
          .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `${interaction.client.user.username}`
          })
          .setDescription(`**The staff role no longer exists on this server.**\n\n**__Credits:__**\n**__Bot Developer:__**\n<@1115203718024003616>(eyalgreen#0)`);
  
        return await interaction.reply({ embeds: [roleerr1], ephemeral: true });
      }
      if (!interaction.member.roles.cache.has(roleId)) {
        const noRoleErr = new EmbedBuilder()
          .setColor('Red')
          .setAuthor({
            name: `${interaction.client.user.username} | Claim`
          })
          .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `${interaction.client.user.username}`
          })
          .setDescription(`You do not have the required role to claim this helpme`);
  
        return await interaction.reply({ embeds: [noRoleErr], ephemeral: true });
      }
      await interaction.deferUpdate();
      const claimedBy = `Claimed By: ${interaction.user.tag}`;
      const claimedButton = new ButtonBuilder()
        .setCustomId('helpme_claim')
        .setLabel(claimedBy)
        .setStyle('Success')
        .setDisabled(true);
      await interaction.editReply({ components: [new ActionRowBuilder().addComponents(claimedButton)] });
      const claimsFile = require('./claims.json');
      const guildId = interaction.guildId;
      const buttonClickerId = interaction.user.id;
      const claimsAmount = claimsFile[guildId]?.[buttonClickerId] ?? 0;
      claimsFile[guildId] = { ...claimsFile[guildId], [buttonClickerId]: claimsAmount + 1 };
      fs.writeFileSync('./claims.json', JSON.stringify(claimsFile));
  
      await interaction.followUp(`claimed by ${interaction.user.tag}.`);
    }
  });
  client.on('error', console.error);
client.on('warn', console.warn);
process.on('unhandledRejection', console.error);
  

client.login(''); //type your token here.