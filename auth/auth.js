const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
require("dotenv").config();
const SECRET = process.env.SECRET;

async function verificaUser(req,res, next) {
    const token = req.cookies.token;

    if(!token){
        req.flash("erro", "Erro, faça login novamente")
        return res.redirect("/ingressos");
    }

    try {
        const decoded = await jwt.verify(token, SECRET);
        const usuario = await Usuario.findOne({_id: decoded.userId});

        if(!usuario) {
            req.flash("erro", "Erro, usuario nao encontrado")
            return res.redirect("/ingressos");
        }

        req.user = usuario;
        next();
    } catch(erro) {
        console.log("erro: "+erro)
        return res.status(500).json({errorMessage: "Erro interno no sevidor"});
    }
}

async function verificaAdmin(req,res,next) {
    const token = req.cookies.token;

    if(!token){
        req.flash("erro", "Erro, faça login novamente")
        return res.redirect("/ingressos");
    }

    try {
        const decoded = await jwt.verify(token, SECRET);
        const usuario = await Usuario.findOne({_id: decoded.userId});

        if(!usuario) {
            req.flash("erro", "Erro, usuario nao encontrado")
            return res.redirect("/ingressos");
        }

        if(usuario.isAdmin !== 1) {
            req.flash("erro", "Erro, apenas admins podem realizar esta ação")
            return res.redirect("/ingressos");
        }

        req.user = usuario;
        next()
    } catch(erro) {
        console.log("erro: "+erro)
        return res.status(500).json({errorMessage: "Erro interno no sevidor"});
    }
}

module.exports = {
    verificaUser,
    verificaAdmin
}