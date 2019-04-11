const token = process.env.TOKEN

const Bot = require('node-telegram-bot-api')

const Utils = require("./utils.js")

let bot

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token)
  bot.setWebHook(process.env.HEROKU_URL + bot.token)
}
else {
  bot = new Bot(token, { polling: true })
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode')

bot.on('text', (msg) => {
  if (msg.text[0] != "/")
    return

  const chatId = msg.chat.id
  const user = msg.from

  const fields = msg.text.split(' ')
  command = fields[0]

  if (command.indexOf('@AmigoOcultoBot') > -1)
    command = command.split('@')[0]

  switch (command) {
    case '/help':
    case '/ajuda':
      break

    default:
      bot.sendMessage(chatId, 'Desculpe, não entendi. Digite /ajuda para ver a lista de comandos.')
  }
})

bot.on('polling_error', (error) => {
  console.log(error)
})

module.exports = bot