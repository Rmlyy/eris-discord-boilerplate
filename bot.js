const config = require('./config')
const Eris = require('eris')
const bot = new Eris(config.token, {
  intents: ['all'],
})

const fs = require('fs')
const commands = []
const commandsAliases = {}

const membersMap = new Map()

fs.readdirSync('./commands').forEach((command) => {
  const cmd = require(`./commands/${command}`)

  commands.push(cmd.name)

  if (cmd.aliases) {
    cmd.aliases.forEach((alias) => {
      commandsAliases[alias] = cmd.name
    })
  }
})
console.log(`Loaded ${commands.length} commands`)
console.log(`Loaded ${Object.keys(commandsAliases).length} command aliases`)

bot.on('ready', () => {
  console.log('Ready')
})

bot.on('error', (error) => {
  console.error(error)
})

bot.on('messageCreate', (message) => {
  if (message.author.bot) return
  if (message.channel.type === 1) return
  if (!message.content.startsWith(config.prefix)) return

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  let cmd

  if (commands.includes(command)) cmd = require(`./commands/${command}`)
  else if (commandsAliases[command]) {
    cmd = require(`./commands/${commandsAliases[command]}`)
  } else return

  if (cmd) {
    try {
      const perms = message.channel.permissionsOf(message.author.id)
      let argsMsg = `You did not provide the required arguments.`

      if (cmd.args && args.length != cmd.args) {
        if (cmd.usage) argsMsg += `\nUsage: \`${cmd.usage}\``
        return message.channel.createMessage(argsMsg)
      }

      if (cmd.permission && !perms.has(cmd.permission))
        return message.channel.createMessage('You do not have permission.')

      if (membersMap.get(message.author.id) === cmd.name)
        return message.channel.createMessage('Please wait before executing this command again.')

      if (cmd.cooldown && !perms.has('administrator')) {
        membersMap.set(message.author.id, cmd.name)
        setTimeout(() => {
          membersMap.delete(message.author.id)
        }, cmd.cooldown * 1000)
      }

      cmd.execute(message, args, bot)
    } catch (e) {
      console.error(e)
      message.channel.createMessage('There was an error trying to execute this command.')
    }
  }
})

bot.connect()
