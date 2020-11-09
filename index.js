const Discord = require('discord.js')
const db = require('quick.db')

const client = new Discord.Client()
const token = '' // Your token
const PREFIX = '%' // Your prefix
let chat = '<:chat:775440775332233316>' // Your chat emoji

client.on('ready', () => {
    console.clear()
    console.log(client.user.tag + ' is online!')
})

client.on('message', async message => {

    if (message.author.bot) return;
    if (message.author.id === message.client.user.id) return;
    if (message.channel.type === "dm" || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    db.add(`messages_${message.guild.id}_${message.author.id}`, 1)


    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "messages") {
        let user = message.mentions.users.first() || message.author
        const messages = db.fetch(`messages_${message.guild.id}_${user.id}`)
        message.channel.send({
            embed: {
                title: `${user.username}'s messages`,
                description: `${chat} ${messages} messages!\nGood job! You're well on your way to the leaderboard!`,
                color: 'RANDOM',
            }
        })
    }

    if (command === "leaderboard") {
        let lbMessage = db.all().filter(data => data.ID.startsWith(`messages_${message.guild.id}`)).sort((a, b) => b.data - a.data)
        lbMessage.length = 10;
        var finalLb = ""

        for (var i in lbMessage) {
            finalLb += `**${lbMessage.indexOf(lbMessage[i])+1}. <@${message.client.users.cache.get(lbMessage[i].ID.split('_')[2]) ? message.client.users.cache.get(lbMessage[i].ID.split('_')[2]).id : "Unknown User#0000"}>** • ${chat}  ${lbMessage[i].data}\n`;
        }
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${message.guild.name}'s Message Leaderboard`)
            .setColor("#7289da")
            .setDescription(finalLb)
            .setFooter(message.client.user.username, message.client.user.displayAvatarURL())
            .setTimestamp()
        message.channel.send(embed);
    }

    if (command === "resetmessages") {
        if(!message.member.hasPermission("ADMINISTRATOR")) return
        
        db.all().filter(d => d.ID.startsWith(`messages_${message.guild.id}`)).forEach(d => db.delete(d.ID))
        message.channel.send(':white_check_mark: Cleared all messages!')
    }
})

client.login(token)