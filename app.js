const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const rotaUsuarios = require("./routes/usuarios");
const rotaIngressos = require("./routes/ingressos");
const rotaCompras = require("./routes/compras");
const { engine } = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const SESSAO_SECRET = process.env.SESSAO_SECRET;
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

//config
    //mongoDB
    mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.z4rv5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
        console.log("conectado ao banco de dados com sucesso!!!");
    }).catch((erro) => {
        console.log("Erro ao se conectar ao banco de dados, erro: "+erro);
    })

    //body-parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}))

    //handlebars
    app.engine("handlebars", engine({defaultLayout: "main"}));
    app.set("view engine", "handlebars");
    app.use(express.static(path.join(__dirname, "public")));

    //cookie parser
    app.use(cookieParser());

    //session e flash para mensagens
    app.use(session({
        secret: SESSAO_SECRET,
        resave: false,
        saveUninitialized: true
    }));
    app.use(flash());

//rotas
app.use(async (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = await jwt.verify(token, SECRET);
            res.locals.user = {
                id: decoded.userId,
                isAdmin: decoded.isAdmin
            };
        } catch (erro) {
            console.log("Erro ao verificar token:", erro);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

app.get("/", (req,res) => {
    res.render("principal", {title: "Ingressos"});
})

app.use("/usuarios", rotaUsuarios);
app.use("/ingressos", rotaIngressos);
app.use("/compras", rotaCompras);

//server
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})