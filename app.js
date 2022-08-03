////////////////////////////////////////////SETTING UP///////////////////////////////////////////
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');//salting and hashing
const saltRounds = 2;
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const session = require('express-session');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

/////////////////////////////////////////////DATABASE////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/usersDB")
// to use encryption we have to define schema using class object///////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password']});

const user = mongoose.model('users', userSchema);

////////////////////////////////////////////GET/////////////////////////////////////////////////

////////////////////////////////////Home/////////////////////////////////////////////////////
app.get('/', (req, res) => {
    const session = req.session;
    console.log(session.userid);
    if (session.userid) {
        res.render('secrets')
    }
    else
        res.render('home');
})
//////////////////////////////////////////Login////////////////////////////////////////////////////
app.get('/login', (req, res) => {
    const session = req.session;
    console.log(session.userid);
    if (session.userid) {
        res.render('secrets')
    }
    else{
        res.render('login');
    }
})
//////////////////////////////////////////Register////////////////////////////////////////
app.get('/register', (req, res) => {
    const session = req.session;
    console.log(session.userid);
    if (session.userid) {
        res.render('secrets')
    }
    else{
        res.render('register');
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

////////////////////////////////////////////////////POST///////////////////////////////////////////



app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const userRegDetails = new user({
            email: req.body.username,
            password: hash
        })


        userRegDetails.save((err) => {
            if (err) return handleError(err)
            else {
                const session = req.session;
                session.userid = req.body.username;
                res.render('secrets');
            }
        })
    });
})

app.post('/login', (req, res) => {

    user.findOne({ email: req.body.username })
        .then((foundUser) => {
            if (foundUser != null) {
                bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
                    if (result === true) {
                        const session = req.session;
                        session.userid = req.body.username;
                        res.render('secrets');
                    }
                    else {
                        res.render("wrong password");
                    }
                });
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