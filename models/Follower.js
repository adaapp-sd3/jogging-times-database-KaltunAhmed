var db = require("../database");
var insertFollowers = db.prepare(
  "INSERT INTO Followers (user_id, following_id, dateFollowed) VALUES (?, ?, ?)"
);
var selectFollowing = db.prepare(
  "SELECT * FROM followers WHERE following_id = ?"
);
var selectFollowers = db.prepare("SELECT * FROM followers WHERE user_id = ?");

var NumberOfFollowers = db.prepare(
  "SELECT count(*) FROM followers WHERE following_id = ? AND user_id = ?"
);
var deleteAccountById = db.prepare("DELETE FROM followers WHERE user_id = ?");

class Followers {
  static insert(user_id, following_id, dateFollowed) {
    // run the insert query
    var number = NumberOfFollowers.get(user_id, following_id);
    var value = number["number(*)"];

    if (value < 1) {
      var info = insertFollowers.run(following_id, user_id);
      // check what the newly inserted row id is
      var following_id = info.lastInsertRowid;
    }
    return following_id;
  }

  // find who i'm following
  static findFollowing(user_id) {
    var row = selectFollowersById.get(user_id);

    if (row) {
      return new Followers(row);
    } else {
      return null;
    }
  }
  // find who's following me
  static findFollowers(following_id) {
    var row = selectFollowersById.get(following_id);

    if (row) {
      return new Followers(row);
    } else {
      return null;
    }
  }

  static deleteFollowerById(user_id) {
    deleteFollowerById.run(user_id);
  }
  static deleteAccountById(id) {
    deleteAccountById.run(id);
  }
  constructor(databaseRow) {
    this.user_id = databaseRow.user_id;
    this.following_id = databaseRow.following_id;
  }
}
