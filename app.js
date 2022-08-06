////////////////////////////////////////////SETTING UP///////////////////////////////////////////
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');//salting and hashing
const saltRounds = 1;
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/usersessions',
    collection: 'mySessions'
});

//  Catch errors
store.on('error', function (error) {
    console.log(error);
});


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    // key:user_SID,
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, expires: 1000 * 60 * 60 }
}))

const sessionChecker = (req, res, next) => {
    if (req.session.userid) {
        res.render('secrets');
    }
    else {
        next();
    }
}

/////////////////////////////////////////////DATABASE////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/usersDB")
// to use encryption we have to define schema using class object///////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const user = mongoose.model('users', userSchema);

////////////////////////////////////////////GET/////////////////////////////////////////////////

////////////////////////////////////Home/////////////////////////////////////////////////////
app.get('/', sessionChecker, (req, res) => {
    res.render('home');
})
//////////////////////////////////////////Login////////////////////////////////////////////////////
app.get('/login', sessionChecker, (req, res) => {
    res.render('login');
})
//////////////////////////////////////////Register////////////////////////////////////////
app.get('/register', sessionChecker, (req, res) => {
    res.render('register');
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
        userRegDetails.save().then(()=>{
            req.session.userid = req.body.username;
            res.render('secrets');
        })

    });

})

app.post('/login', (req, res) => {
    user.findOne({ email: req.body.username })
        .then((foundUser) => {
            if (foundUser != null) {
                bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
                    if (result === true) {
                        req.session.userid = req.body.username;
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