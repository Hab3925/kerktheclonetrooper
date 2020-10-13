const express = require("express");
const app = express();
const ejs = require("ejs")
const path = require('path');

const Enmap = require("enmap");
let sites = new Enmap({
    name: "sites"
})

let htmlPath = path.join(__dirname, 'views');
app.use(express.static(htmlPath));
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile);

app.get("/admin", (req, res) => {
    let accessCode = req.query.code
    let password = req.query.password
    let code = makekey(10)
    if (!accessCode) {
        res.render("login.html")
    } else if (password) {
        if (password == "tBpnQmy4rj") {
            res.redirect("/admin?code=" + code)
        }
    } else if (accessCode == code) {
        res.render("admin")
    }
})

app.get("/", (req, res) => {
    res.render("index")
})
app.get("/about", (req, res) => {
    res.render("about")
})
app.get("/store", (req, res) => {
    res.render("/temp/store.ejs")
})

/**
 * Generates string of random characters
 * @param {number} length Length of string you want generated
 */
makekey = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let server = app.listen(3000, function () {
    let host = 'localhost';
    let port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});