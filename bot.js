require('dotenv').config()
const Eris = require('eris')
const bot = new Eris(process.env.TOKEN)

const fs = require('fs')
const commands = []
const commandsAliases = {}

const membersMap = new Map()

bot.on('ready', () => {
    fs.readdirSync('./commands').forEach(command => {
        const cmd = require(`./commands/${command}`)

        commands.push(cmd.name)
        if (cmd.aliases) { cmd.aliases.forEach(alias => { commandsAliases[alias] = cmd.name }) }
    })
    console.log(`Loaded ${commands.length} commands\nReady!`)
})

bot.on('messageCreate', message => {
    if (message.author.bot) return
    if (message.channel.type === 1) return
    if (!message.content.startsWith(process.env.PREFIX)) return

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    let cmd

    if (commands.includes(command)) cmd = require(`./commands/${command}`)
    else {
        for (const alias in commandsAliases) {
            if (alias.includes(command)) {
                cmd = require(`./commands/${commandsAliases[alias]}`)
            }
        }
    }

    try {
        if (cmd) {
            const perms = message.channel.permissionsOf(message.author.id)
            let argsMsg = `You did not provide the required arguments.`

            if (cmd.args && args.length != cmd.args) {
                if (cmd.usage) argsMsg+= `\nUsage: \`${cmd.usage}\``
                return message.channel.createMessage(argsMsg)
            }
            if (cmd.permission && !perms.has(cmd.permission)) 
                return message.channel.createMessage('You do not have permission.')
            if (membersMap.get(message.author.id) === cmd.name) 
                return message.channel.createMessage('Please wait before executing this command again.')
        
            if (cmd.cooldown && !perms.has('administrator')) {
                membersMap.set(message.author.id, cmd.name)
                setTimeout(() => { membersMap.delete(message.author.id) }, cmd.cooldown * 1000)
            }
        
            cmd.execute(message, args)
        }
    } catch (e) {
        console.error(e)
        message.channel.createMessage('There was an error trying to execute this command.')
    }
})

bot.connect()
