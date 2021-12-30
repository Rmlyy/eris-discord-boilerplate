const fs = require('fs')
const { prefix } = require('../config')

module.exports = {
  name: 'help',
  description: 'Shows a list of commands',
  cooldown: 5,

  execute(message, args) {
    let msg = ''
    fs.readdirSync('./commands').forEach(file => {
      const command = require(`../commands/${file}`)
      const name = command.name
      const description = command.description
      const usage = command.usage
      msg += `\n**${prefix}${name} ${usage ? `${usage}` : ''}** ${description ? `- ${description}` : ''}`
    })
    message.channel.createMessage(msg)
  }
}