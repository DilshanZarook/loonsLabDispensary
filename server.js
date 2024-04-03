if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


//importing libararies that installed in npm
const express = require("express")

const app = express()
const bcrypt = require("bcrypt") // importing bcrypt pacakage to hash the password
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
const users = [] // creating an array to store the users    

app.use(express.urlencoded({ extended: false }))

app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //we won't resave the session if nothing has changed
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('images'));



//configuring login post functionallity
app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    //flash message we are getting if user failed to login 
    failureFlash: true
}))

//configuring register post functionallity
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // hashing the password
        users.push({
            id: Date.now().toString(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobileNo: req.body.mobileNo,
            email: req.body.email,
            picture: req.body.picture,
            password: hashedPassword
        })
        res.redirect("/login")
        console.log(users)

    }catch (e) {
        console.log("e")
        res.redirect("/register")
}
})

// creating routes for each page and create access levels.
app .get ("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs",{name: req.user.name})
})

app.get('/login',checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
});


app.get("/register",checkNotAuthenticated,(req, res) => {
    res.render("register.ejs")
})
//end routes


app.delete('/logout', (req, res) => {
    req.logOut(req.user, err=>{
        if (err) return next (err)
        res.redirect('/')
        })
    })
    

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}



// console.log(users); //dispalying newly registrated users
app.listen(3000) 