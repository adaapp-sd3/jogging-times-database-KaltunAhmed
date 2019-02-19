var db = require("../database");

// get the queries ready - note the ? placeholders
var insertJogs = db.prepare(
  "INSERT INTO jogs (date, duration, distance, user_id) VALUES (?, ?, ?, ?)"
);

var selectjogsById = db.prepare("SELECT * FROM jogs WHERE id = ?");
var selectJogByUser = db.prepare("SELECT * FROM jogs WHERE user_id = ?");
var updateJogById = db.prepare(
  "UPDATE jogs SET date = ?, distance = ?, duration = ?  WHERE id = ?"
);
var deleteTimeById = db.prepare("DELETE FROM jogs WHERE id = ?");
var deleteAccountById = db.prepare("DELETE FROM jogs WHERE user_id = ?");

class Jogs {
  static insert(date, duration, distance, user_id) {
    // run the insert query
    var info = insertJogs.run(date, distance, duration, user_id);

    // check what the newly inserted row id is
    var jogsId = info.lastInsertRowid;

    return jogsId;
  }
  static updateJogById(date, distance, duration, id) {
    updateJogById.run(date, distance, duration, id);
  }
  static deleteTimeById(id) {
    deleteTimeById.run(id);
  }
  static findById(id) {
    var row = selectjogsById.get(id);

    if (row) {
      return new Jogs(row);
    } else {
      return null;
    }
  }
  static findByUser(id) {
    var row = selectJogByUser.get(id);

    if (row) {
      return new Jog(row);
    } else {
      return null;
    }
  }
  static findAllFromUser(id) {
    var allJogs = selectJogByUser.all(id);
    return allJogs;
  }

  static deleteAccountById(id) {
    deleteAccountById.run(id);
  }

  constructor(databaseJogsRow) {
    this.id = databaseJogsRow.id;
    this.distance = databaseJogsRow.distance;
    this.duration = databaseJogsRow.duration;
  }
}

module.exports = Jogs;
