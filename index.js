const express = require("express");
const app = express();
const ejs = require("ejs")
const path = require('path');
let domain = "localhost:3000"

const Enmap = require("enmap");
let products = new Enmap({
    name: "products"
})
let promocodes = new Enmap({
    name: "promocodes"
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
        if (password == "test") {
            res.redirect("/admin?code=" + code)
        } else {
            res.redirect("denied.html")
        }
    } else if (accessCode == code) {
        res.render("temp/admin", {
            sites: "Sites",
            promoCodes: "Codes"
        })
    } else {
        res.redirect("denied.html")
    }
})

app.get("/", (req, res) => {
    let host = req.get('host');
    if (host !== domain) return
    res.render("index")
})
app.get("/about", (req, res) => {
    let host = req.get('host');
    if (host !== domain) return
    res.render("about.html")
})
app.get("/store", (req, res) => {
    let host = req.get('host');
    if (host !== domain) return
    res.render("temp/store", {
        products: "Product"
    })
})
app.get("/addProduct", (req, res) => {
    let host = req.get('host');
    if (host !== domain) return
    res.render("temp/addProduct.ejs")
})

function renderStore() {
    let output = '';
    products.forEach(product => {
        let html = `
        <div class="product">
            <img src="" alt="preview" id="preview">
            <h1 id="title">${product.title}</h1>
            <p id="price">${product.price}</p>
        </div>
        `
    })
}

function renderCodes() {
    promocodes.get('codes').forEach(c => {

    })
}

/**
 * Generates promocodes and saves them, returns generated promocodes
 * @param {number} amt Amount of codes you want to generate
 */
function generateCodes(amt) {
    let codes = []
    for (i = 0; i < amt; i++) {
        let promoCode = makekey(5)
        codes.push(promoCode)
    }
    let allCodes = codes
    promocodes.get('codes').forEach(c => {
        allCodes.push(c)
    })
    promocodes.set('codes', allCodes)
    return codes
}


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