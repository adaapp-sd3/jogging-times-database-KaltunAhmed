var db = require("../database");

// get the queries ready - note the ? placeholders
var insertUser = db.prepare(
  "INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)"
);

var selectUserById = db.prepare("SELECT * FROM user WHERE id = ?");
var selectUserByEmail = db.prepare("SELECT * FROM user WHERE email = ?");
var deleteAccountById = db.prepare("DELETE FROM user WHERE id = ?");

class User {
  static insert(name, email, passwordHash) {
    // run the insert query
    var info = insertUser.run(name, email, passwordHash);

    // check what the newly inserted row id is
    var userId = info.lastInsertRowid;

    return userId;
  }

  static findById(id) {
    var row = selectUserById.get(id);

    if (row) {
      return new User(row);
    } else {
      return null;
    }
  }

  static findByEmail(email) {
    var row = selectUserByEmail.get(email);
    if (row) {
      return new User(row);
    } else {
      return null;
    }
  }

  static deleteAccountById(id) {
    deleteAccountById.run(id);
  }

  constructor(databaseRow) {
    this.id = databaseRow.id;
    this.name = databaseRow.name;
    this.email = databaseRow.email;
    this.passwordHash = databaseRow.password_hash;
  }
}

module.exports = User;
