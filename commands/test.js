module.exports = {
    name: 'test',
    description: 'Just a test command',
    aliases: ['testing', 's'],
    permission: 'administrator',
    usage: '[arg 1], [arg 2]',
    args: 2,
    cooldown: 5,

    execute (message, args) {
        message.channel.createMessage(`First argument: ${args[0]}\nSecond argument: ${args[1]}`)
    }
}