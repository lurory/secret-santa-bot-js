const Const = require("./const.js")
const Utils = require("./utils.js")

const MongoClient = require("mongodb").MongoClient

class SecretSantaManager {
  constructor(chatId, hostId) {

    this.secretSantas = {}

    MongoClient.connect(Const.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
      if (err) throw err;
      const collection = client.db("storage").collection("secret-santa-bot");
      // this.collection.insertOne(entry, (err, result) => {
      // 	if (err) console.log(err)
      // })
      collection.find({}, { projection: { _id: 0 } }).toArray((err, result) => {
        if (err) throw err
        for (const entry of result) {
          const chatId = entry['chatId']
          delete entry['chatId']
          this.secretSantas[chatId] = entry
        }
        console.log(this.secretSantas)
      })
      client.close();
    });
  }

  createSecretSanta(chatId, userId) {
    if (this.secretSantas.hasOwnProperty(chatId))
      return false // There is already a secret santa for this chatId

    let secretSanta = {
      'hostId': userId,
      'participants': {},
      'result': {}
    }
    this.secretSantas[chatId] = secretSanta
    secretSanta['chatId'] = chatId
    this.updateMongoWithQuery(chatId, { $set: secretSanta })
    console.log(this.secretSantas)

    return true
  }

  removeSecretSanta(chatId, userId) {
    if (!this.secretSantas.hasOwnProperty(chatId))
      return -2 // There is not a secret santa for this chatId

    if (this.secretSantas[chatId]['hostId'] !== userId)
      return -1 // User is not the host, it can't remove the secret santa

    delete this.secretSantas[chatId]
    MongoClient.connect(Const.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
      if (err) throw err;
      const collection = client.db("storage").collection("secret-santa-bot");

      collection.deleteOne({ 'chatId': chatId }, (error, res) => {
        if (error) throw error;
        console.log(res.deletedCount + ' document(s) deleted.');
      })

      client.close();
    });

    return 0
  }

  addParticipant(chatId, person) {
    if (this.secretSantas[chatId].participants.hasOwnProperty(person.id))
      return false // Person is already a participant

    this.secretSantas[chatId].participants[person.id] = person
    const key = 'participants.' + person.id
    this.updateMongoWithQuery(chatId, { $set: { [key]: person } })
    return true
  }

  removeParticipant(chatId, userId) {
    if (!this.secretSantas[chatId].participants.hasOwnProperty(userId))
      return false // Person is not a participant

    delete this.secretSantas[chatId].participants[userId]
    const key = 'participants.' + userId
    this.updateMongoWithQuery(chatId, { $unset: { [key]: "" } })
    return true
  }

  setGift(chatId, userId, gift) {
    if (!this.secretSantas.hasOwnProperty(chatId))
      return -2 // There is not a secret santa for this chatId

    if (!this.secretSantas[chatId]['participants'].hasOwnProperty(userId))
      return -1 // User have not joined the secret santa

    this.secretSantas[chatId]['participants'][userId].gift = gift
    const key = 'participants.' + userId + '.gift'
    this.updateMongoWithQuery(chatId, { $set: { [key]: gift } })
    return 0
  }

  listParticipants(chatId) {
    if (!this.secretSantas.hasOwnProperty(chatId))
      return -2 // There is not a secret santa for this chatId

    let message = '*Lista de participantes:*\n\n'
    let users = Object.values(this.secretSantas[chatId].participants)

    if (users.length === 0)
      return -1

    users.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    for (const user of users) {
      message += user.name + ' - ' +
        (user.gift !== null ? user.gift : 'Não decidiu o presente') + '\n'
    }
    return message
  }

  // Function to update the MongoDB using a query
  updateMongoWithQuery(chatId, query) {
    MongoClient.connect(Const.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
      if (err) throw err;
      const collection = client.db("storage").collection("secret-santa-bot");

      collection.updateOne({ 'chatId': chatId }, query,
        { 'upsert': true }, (error, res) => {
          if (error) throw error;
          console.log(res.upsertedCount + " element(s) included, " +
            res.modifiedCount + " element(s) modified."
          );
        })

      client.close();
    });
  }

  // Function to update a ride of a specific user
  // updateMongo(chatId, userId, direction) {
  // 	MongoClient.connect(Const.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
  // 		if (err) throw err;
  // 		const collection = client.db("storage").collection("secret-santa-bot");

  // 		let updateQuery
  // 		let key = direction + '.' + userId
  // 		if (this.secretSanta[chatId][direction][userId])
  // 			updateQuery = {
  // 				$set: {
  // 					[key]: this.rides[chatId][direction][userId],
  // 				}
  // 			}
  // 		else
  // 			updateQuery = {
  // 				$unset: {
  // 					[key]: "",
  // 				}
  // 			}

  // 		collection.updateOne({ 'chatId': chatId }, updateQuery,
  // 			{ 'upsert': true }, (error, res) => {
  // 				if (error) throw error;
  // 				console.log(res.modifiedCount + " element(s) modified.");
  // 			})

  // 		client.close();
  // 	});
  // }
}

module.exports = SecretSantaManager
