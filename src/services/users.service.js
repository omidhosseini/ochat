const bcrypt = require("bcrypt");
const UserModel = require("../models/users");
const Users = UserModel.Users;

class UserService {
  async addUser(username, password, connectionId) {
    let user = await Users.findOne({ username: username });
    const saltRounds = 10;

    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return new Promise((resolve, reject) => {
            resolve(user._id);
          });
        }
        if (err) {
          return new Promise((resolve, reject) => {
            reject("invalid username or password.");
          });
        }
      });

      return user._id;
    }

    await bcrypt.genSalt(saltRounds, async (err, salt) => {
      await bcrypt.hash(password, salt, async (err, hash) => {
        user = new Users({
          username: username,
          password: hash,
          connectionId: connectionId,
        });
        const result = await user
          .save()
          .then((r) => {
            return new Promise((resolve, reject) => {
              resolve(user._id);
            });
          })
          .catch((e) => {
            return new Promise((resolve, reject) => {
              reject("Somthing has wrong...");
            });
          });
        return result;
      });
    });
  }

  async syncUserInfo(token, connectionId) {
    const res = await Users.updateOne(
      { _id: token },
      { connectionId: connectionId }
    ); 
  }

  async getUser(token) {
    const userInfo = await Users.findOne({ _id: token });

    return userInfo;
  }
}

exports.UserService = UserService;
