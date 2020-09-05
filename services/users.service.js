const UserModel = require('../models/users');
const Users = UserModel.Users;

class UserService {


    async addUser(userInfo) {
        
        let user = (await Users.findOne({userName: userInfo}));
        if (user) {
            return new Promise((resolve, reject) => {
                reject("User already exist.");
            });
        }

        user = new Users({username: userInfo});
        const result = await user.save().then(r => {
            return new Promise((resolve, reject) => {
                resolve(user.id);
            })
        }).catch(e => {
            return new Promise((resolve, reject) => {
                console.error(e);
                reject("Somthing has wrong...");
            });
        });

        return result;
    }
}

exports.UserService = UserService;
