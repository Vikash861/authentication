////////////////////////////////////////////SETTING UP///////////////////////////////////////////
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/////////////////////////////////////////////DATABASE////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/usersDB")
// to use encryption we have to define schema using class object///////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const secret = "Thisisencryptsecrethere"
userSchema.plugin(encrypt,{secret:secret,encryptedFields: ['password']});

const user = mongoose.model('users', userSchema);

////////////////////////////////////////////GET/////////////////////////////////////////////////

////////////////////////////////////Home/////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.render('home');
})
//////////////////////////////////////////Login////////////////////////////////////////////////////
app.get('/login', (req, res) => {
    res.render('login');
})
//////////////////////////////////////////Register////////////////////////////////////////
app.get('/register', (req, res) => {
    res.render('register');
})

////////////////////////////////////////////////////POST///////////////////////////////////////////

app.post('/register', (req, res) => {


    user.findOne({ email: req.body.username })
        .then((foundUser) => {
            if (foundUser == null) {
                const userRegDetails = new user({
                    email: req.body.username,
                    password: req.body.password
                })
                userRegDetails.save((err) => {
                    if (err) return handleError(err)
                    else
                        res.render('secrets');
                })
            }
            else {
                res.render('secrets')
            }
        })
        .catch(err => console.log(err));


})

app.post('/login', (req, res) => {

    user.findOne({ email: req.body.username })
        .then((foundUser) => {
            if(foundUser != null){
                if(req.body.password == foundUser.password){
                    res.render('secrets');
                }
                else{
                    res.render("wrong password");
                }
            }
            else
                res.render("Accound doesn't exist please create accound");
        })
        .catch(err => console.log(err));

})



app.listen(3000, (err) => {
    if (!err)
        console.log("server listen at port 3000");
})