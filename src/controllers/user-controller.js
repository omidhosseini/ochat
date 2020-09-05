const userDto = require('../dto/register-user-dto');
const service = require('../services/users.service');


exports.registerUser =  (req, res)=>{
    
    const {error} = userDto.registerUserDto.validate(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    const userService = new service.UserService(); 

    userService.addUser(req.body).then(async(result)=>{
        res.send(await result);
    }).catch(async(err)=> {
        res.status(400).send(await err);
    });
}; 