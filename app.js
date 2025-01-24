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

//rotas
app.get("/", (req,res) => {
    res.send("Ola mundo");
})

app.use("/usuarios", rotaUsuarios);
app.use("/ingressos", rotaIngressos);
app.use("/compras", rotaCompras);

//server
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})