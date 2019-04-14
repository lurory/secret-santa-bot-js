const Const = require("./const.js")
const Utils = require("./utils.js")

class Person {
  constructor(user, gift = null) {
    this.id = user.id
    this.name = user.first_name + " " + (user.last_name || "") 
    this.gift = gift
  }

  setGift(gift) {
    this.gift = gift
  }
}

module.exports = Person
