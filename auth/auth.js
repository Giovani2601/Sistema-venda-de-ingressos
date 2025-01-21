const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
require("dotenv").config();
const SECRET = process.env.SECRET;

async function verificaUser(req,res, next) {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({message: "Erro, faça login novamente"});
    }

    try {
        const decoded = await jwt.verify(token, SECRET);
        const usuario = await Usuario.findOne({_id: decoded.userId});

        if(!usuario) {
            return res.status(404).json({message: "Erro, usuario nao encontrado"});
        }

        req.user = usuario;
        next();
    } catch(erro) {
        console.log("erro: "+erro)
        return res.status(500).json({errorMessage: "Erro interno no sevidor"});
    }
}

async function verificaAdmin(req,res,next) {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({message: "Erro, faça login novamente"});
    }

    try {
        const decoded = await jwt.verify(token, SECRET);
        const usuario = await Usuario.findOne({_id: decoded.userId});

        if(!usuario) {
            return res.status(404).json({message: "Erro, usuario nao encontrado"});
        }

        if(usuario.isAdmin !== 1) {
            return res.status(403).json({message: "Erro, apenas admins podem realizar esta ação"});
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