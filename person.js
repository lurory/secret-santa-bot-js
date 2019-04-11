const Const = require("./const.js")
const Utils = require("./utils.js")

const MongoClient = require("mongodb").MongoClient

class Person {
  constructor(user, gift = null) {
    this.name = user.first_name + " " + user.last_name
    this.gift = gift

    // MongoClient.connect(Const.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
    // 	if (err) throw err;
    // 	const collection = client.db("storage").collection("carona-bot");
    // 	// this.collection.insertOne(entry, (err, result) => {
    // 	// 	if (err) console.log(err)
    // 	// })
    // 	collection.find({}, { '_id': 0 }).toArray((err, result) => {
    // 		if (err) throw err
    // 		for (const entry of result) {
    // 			delete entry['_id']
    // 			this.rides[entry['chatId']] = entry
    // 		}
    // 	})
    // 	client.close();
    // });
  }

  setGift(gift) {
    this.gift = gift
  }
}

module.exports = Person
