const express = require("express");
const app = express();
const ejs = require("ejs")
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const fs = require("fs")
const bodyParser = require('body-parser')
let resetEnmap = true //false

const {
    inspect
} = require("util");

// Multer configuration
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

let upload = multer({
    storage: storage
})

let domain = "localhost:3000"

const Enmap = require("enmap");
const {
    reset
} = require("nodemon");
let products = new Enmap({
    name: "products"
})
let promocodes = new Enmap({
    name: "promocodes"
})

if (!products.has("id")) {
    products.set("id", 1)
}
if (resetEnmap) {
    products.deleteAll()
    products.set("id", 1)
}

let htmlPath = path.join(__dirname, 'views');
app.use(express.static(htmlPath));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
    extended: true
})) // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile);

let code = {
    code: makekey(10),
    expires: Date.now() + 1800000
}
setInterval(() => {
    code.code = makekey(10)
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
            res.redirect("/admin?code=" + code.code)

        } else {
            res.redirect("denied.html")
        }
    } else if (accessCode == code.code) {
        res.render("temp/admin", {
            sites: "Sites",
            promoCodes: renderCodes()
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
    let accessCode = req.query.code

    if (accessCode == code.code) {
        res.render("temp/addProduct.ejs")
    } else {
        res.redirect("denied.html")
    }
})

app.get("/validateCode", (req, res) => {
    if (req.body.code == code) {
        res.sendStatus(200)
        console.log("OK")
    } else {
        //res.redirect("/admin") (Does nothing)
        res.sendStatus(401)
        console.log("NOT OK")
    }
})

//Handles the addProduct image upload
app.post('/upload', upload.single("image"), (req, res) => {
    let data = JSON.parse(req.body.data)
    data.filename = req.file.filename

    products.set(products.get("id").toString(), data)
    products.set("id", products.get("id") + 1)

    console.log(products)
    res.sendStatus(200)

})

app.post('/codes', (req, res) => {
    console.log(promocodes.get('codes'))
    generateCodes(req.body.amt)
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
    let html = ""
    if (promocodes.has("codes")) {
        console.log(promocodes.has("codes"))
        promocodes.get('codes').forEach(c => {
            html += `<ul>${c}</ul>`
        })
    }
    return html
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