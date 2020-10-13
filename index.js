const express = require("express");
const app = express();
const ejs = require("ejs")
const path = require('path');
let domain = "localhost:3000"

const Enmap = require("enmap");
let sites = new Enmap({
    name: "sites"
})

let htmlPath = path.join(__dirname, 'views');
app.use(express.static(htmlPath));
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile);

let code = makekey(10)

setInterval(() => {
    code = makekey(10)
}, 1800000);

app.get("/admin", (req, res) => {
    let host = req.get('host');
    if (host !== domain) return
    let accessCode = req.query.code
    let password = req.query.password
    if (!accessCode && !password) {
        res.render("login.html")
    } else if (password && !accessCode) {
        if (password == "tBpnQmy4rj") {
            res.redirect("/admin?code=" + code)
        } else {
            res.redirect("denied.html")
        }
    } else if (accessCode == code) {
        res.render("temp/admin")
    } else {
        res.redirect("denied.html")
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
function makekey(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let server = app.listen(3000, function () {
    let host = 'localhost';
    let port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});