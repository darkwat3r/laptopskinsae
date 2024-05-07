const bcrypt        = require('bcryptjs');
const saltRounds    = 5;

module.exports = {
    encrpytPass: (myPlaintextPassword) => {
        return bcrypt.hash(myPlaintextPassword, saltRounds)
            .then(
                (hash) => {
                    return hash;
                }
            )
            .catch(
                (err) => {
                    return err;
                }
            );    
    },
    verifyPass: (myPlaintextPassword, hash) => {
        return bcrypt.compare(myPlaintextPassword, hash)
            .then(
                (res) => {
                    return res;
                },
                (err) => {
                    return err;
                }
            );   
    },
    newRandomPassword: (length) => {
        if (!length)
            length = 12;
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var result = ""
        var charactersLength = characters.length;

        for ( var i = 0; i < length ; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        //console.log(result)
        return result;
    }
}