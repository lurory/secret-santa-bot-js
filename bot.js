const token = process.env.TOKEN

const Bot = require("node-telegram-bot-api")

const Utils = require("./utils.js")
const Person = require("./person.js")
const SecretSantaManager = require("./secretSantaManager.js")

let bot

if (process.env.NODE_ENV === "production") {
  bot = new Bot(token)
  bot.setWebHook(process.env.HEROKU_URL + bot.token)
} else {
  bot = new Bot(token, {
    polling: true
  })
}

console.log("Bot server started in the " + process.env.NODE_ENV + " mode")

secretSantaManager = new SecretSantaManager()

bot.on("text", msg => {
  if (msg.text[0] != "/") return

  const chatId = msg.chat.id
  const user = msg.from

  const fields = msg.text.split(" ")
  command = fields[0]

  if (command.indexOf("@AmigoOcultoBot") > -1) command = command.split("@")[0]

  switch (command) {
    case "/menu":
      // Keyboard is an array of array of buttons, resulting in rows and columns.
      let menuKeyboard = [
        [
          {
            text: "Criar Amigo Oculto",
            callback_data: "/criar"
          }
        ]
      ]
      bot.sendMessage(chatId, "Menu com botões...", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: menuKeyboard
        }
      })
      break

    case "/foto":
      // Just in case...
      console.log("Foto")
      bot.getUserProfilePhotos(user.id, { limit: 1 }).then(
        function (result) {
          console.log(result)
          if (result.total_count === 0) return

          const file_id = result.photos[0][0].file_id
          bot.getFile(file_id).then(
            function (file) {
              const url = "https://api.telegram.org/file/bot" + token + "/" + file.file_path
              bot.sendMessage(chatId, url)
            },
            function (err) {
              console.log(err)
            }
          )
          // for (const photo of result.photos[0])
          // {
          //   console.log("Width: " + photo.width + ", Height: " + photo.height)
          //   bot.sendPhoto(chatId, photo.file_id)
          // }
        },
        function (err) {
          console.log(err)
        }
      )
      break

    case "/criar":
      let createResult = secretSantaManager.createSecretSanta(chatId, user.id)
      if (createResult === true) bot.sendMessage(chatId, "Novo amigo oculto criado por " + user.first_name + ".")
      else
        bot.sendMessage(
          chatId,
          "Já existe um amigo oculto para esse grupo. Digite /entrar para entrar no amigo oculto.",
          {
            reply_to_message_id: msg.message_id
          }
        )
      break

    case "/remover":
      let deleteResult = secretSantaManager.removeSecretSanta(chatId, user.id)
      console.log(deleteResult)
      if (deleteResult === -2)
        bot.sendMessage(chatId, "Não há um amigo oculto para esse grupo. Digite /criar para criar um sorteio.", {
          reply_to_message_id: msg.message_id
        })
      else if (deleteResult === -1)
        bot.sendMessage(
          chatId,
          "Você não tem permissão para remover o amigo oculto. Caso queira sair do sorteio, digite /sair.",
          {
            reply_to_message_id: msg.message_id
          }
        )
      else
        bot.sendMessage(chatId, "Amigo oculto removido com sucesso.", {
          reply_to_message_id: msg.message_id
        })
      break

    case "/entrar":
      let person
      if (fields.length < 2) person = new Person(user)
      else person = new Person(user, fields.slice(1, fields.length).join(" "))

      let addResult = secretSantaManager.addParticipant(chatId, person)
      if (addResult === true && fields.length >= 2)
        bot.sendMessage(chatId, "Agora você está participando do amigo oculto.", {
          reply_to_message_id: msg.message_id
        })
      else if (addResult === true)
        bot.sendMessage(
          chatId,
          "Agora você está participando do amigo oculto. Quando decidir seu presente, use o comando /presente.\nEx: /presente barra de chocolate",
          {
            reply_to_message_id: msg.message_id
          }
        )
      else
        bot.sendMessage(chatId, "Você já está participando do amigo oculto.", {
          reply_to_message_id: msg.message_id
        })
      break

    case "/sair":
      let removeResult = secretSantaManager.removeParticipant(chatId, user.id)
      if (removeResult === true)
        bot.sendMessage(chatId, "Você saiu do amigo oculto.", {
          reply_to_message_id: msg.message_id
        })
      else
        bot.sendMessage(chatId, "Você não está participando do amigo oculto.", {
          reply_to_message_id: msg.message_id
        })
      break

    case "/presente":
      if (fields.length < 2) {
        bot.sendMessage(chatId, "Digite /presente [presente]. Ex: /presente chocolate")
        return
      }
      const gift = fields.slice(1, fields.length).join(" ")
      const giftResult = secretSantaManager.setGift(chatId, user.id, gift)
      if (giftResult === -2)
        bot.sendMessage(chatId, "Não há um amigo oculto para esse grupo. Digite /criar para criar um sorteio.", {
          reply_to_message_id: msg.message_id
        })
      else if (giftResult === -1)
        bot.sendMessage(chatId, "Você não está participando do amigo oculto. Digite /entrar para entrar no sorteio.", {
          reply_to_message_id: msg.message_id
        })
      else
        bot.sendMessage(chatId, "Presente atualizado com sucesso.", {
          reply_to_message_id: msg.message_id
        })
      break

    case "/lista":
      const message = secretSantaManager.listParticipants(chatId)
      if (message === -2)
        bot.sendMessage(chatId, "Não há um amigo oculto para esse grupo. Digite /criar para criar um sorteio.")
      else if (message === -1)
        bot.sendMessage(chatId, "Não há nenhum participante até o momento. Digite /entrar para entrar no sorteio.")
      else
        bot.sendMessage(chatId, message, {
          parse_mode: "Markdown"
        })
      break

    case "/sortear":
      const raffleResult = secretSantaManager.raffle(chatId, user.id)
      if (raffleResult === -3)
        bot.sendMessage(chatId, "Não há um amigo oculto para esse grupo. Digite /criar para criar um sorteio.", {
          reply_to_message_id: msg.message_id
        })
      else if (raffleResult === -2)
        bot.sendMessage(chatId, "Você não tem permissão para remover o amigo oculto. Caso queira sair do sorteio, digite /sair.", {
          reply_to_message_id: msg.message_id
        })
      else if (raffleResult === -1)
        bot.sendMessage(chatId, "Não é possível sortear porque há menos de 2 pessoas participando.", {
          reply_to_message_id: msg.message_id
        })
      else
      {
        let revealKeyboard = [
          [
            {
              text: "Clique para descobrir seu amigo oculto!",
              switch_inline_query_current_chat: chatId
            }
          ]
        ]
        bot.sendMessage(chatId, "O amigo oculto foi sorteado! Cliquem no botão abaixo para descobrir quem vocês tiraram!", {
          reply_markup: {
            inline_keyboard: revealKeyboard
          }
        })
      }
      break

    case "/help":
    case "/ajuda":
      bot.sendMessage(chatId, Utils.getHelpMessage(), {
        parse_mode: "Markdown"
      })
      break

    default:
      bot.sendMessage(chatId, "Desculpe, não entendi. Digite /ajuda para ver a lista de comandos.")
  }
})

bot.on("callback_query", query => {
  const chatId = query.message.chat.id
  const userId = query.from.id
  const command = query.data
  switch (command) {
    case "/criar":
      break
  }
  bot.sendMessage(chatId, 'Received callback query "' + query.data + '" from user ' + query.from.first_name)
})

bot.on("inline_query", msg => {
  const chatId = msg.query
  let result = secretSantaManager.retrieveResult(chatId, msg.from.id)
  let title
  let description = ""

  if (result === -2) title = "Não há sorteio para esse grupo."
  else if (result === -1) title = "O amigo oculto ainda não foi sorteado."
  else {
    title = result.name
    description = result.gift !== null ? result.gift : "O presente ainda não foi cadastrado"
  }
  const results = [
    {
      type: "article",
      id: "0",
      title: title,
      description: description,
      input_message_content: { message_text: "." },
      thumb_url: "https://submeg.files.wordpress.com/2011/12/work-in-progress22.jpg?w=620&h=521&crop=1"
    }
  ]
  bot.answerInlineQuery(msg.id, JSON.stringify(results), { cache_time: 0 }).then(() => { })
})

bot.on("polling_error", error => {
  console.log(error)
})

module.exports = bot
