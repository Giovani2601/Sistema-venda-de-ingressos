const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcryptjs = require("bcryptjs");
require("dotenv").config();
const SECRET = process.env.SECRET;
const jwt = require("jsonwebtoken");
const auth = require("../auth/auth");

//inicia uma conta de admin (se nao houver nenhuma ja existente)
router.get("/install", async (req,res) => {
    try {
        const usuarioAdminExistente = await Usuario.findOne({isAdmin: 1});
        if(usuarioAdminExistente) {
            return res.status(400).json({message: "Erro, ja existe um usuario admin no sistema"});
        }

        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync("admin", salt);

        const novoAdmin = new Usuario({
            nome: "admin",
            email: "admin@admin.com",
            senha: hash,
            isAdmin: 1
        })

        const adminCriado = await novoAdmin.save();
        return res.status(200).json({message: "Conta admin criada com sucesso!!!", adminCriado:adminCriado});
    } catch (erro) {
        return res.status(500).json({errorMessage: "Erro interno no servidor, erro: "+erro});
    }
})

//criar conta comum
router.post("/", async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        return res.status(400).json({message: "Erro, nome de usuario invalido"});
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        return res.status(400).json({message: "Erro, e-mail de usuario invalido"});
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        return res.status(400).json({message: "Erro, senha de usuario invalida"});
    }

    if(req.body.senha.length < 4) {
        return res.status(400).json({message: "Erro, senha muito curta"});
    }

    if(req.body.senha2 !== req.body.senha) {
        return res.status(400).json({message: "Erro, as senhas devem coincidir"})
    }

    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(req.body.senha, salt);

    const novoUsuario = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: hash
    })

    try {
        const usuarioExistente = await Usuario.findOne({email: req.body.email});
        if(usuarioExistente) {
            return res.status(400).json({message: "Erro, ja existe uma conta com este email"})
        }

        const usuarioSalvo = await novoUsuario.save();
        return res.status(201).json({message: "Conta criada com sucesso!!!", usuarioSalvo:usuarioSalvo});
    } catch (erro) {
        return res.status(500).json({errorMessage: "Erro interno no servidor, erro: "+erro});
    }
})

router.post("/login", async (req,res) => {
    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        return res.status(400).json({message: "Erro, e-mail de usuario invalido"});
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        return res.status(400).json({message: "Erro, senha de usuario invalida"});
    }

    try {
        const usuarioExistente = await Usuario.findOne({email: req.body.email});
        if(!usuarioExistente) {
            return res.status(404).json({message: "Erro, nenhum usuario encontrado com este email"});
        }

        const batem = await bcryptjs.compare(req.body.senha, usuarioExistente.senha);
        if(!batem) {
            return res.status(400).json({message: "Erro, senha incorreta"});
        }

        const token = jwt.sign({userId: usuarioExistente._id}, SECRET, {expiresIn: "1h"});
        return res.status(200).json({message: "Login realizado com sucesso!!!", token:token});

    } catch(erro) {
        return res.status(500).json({errorMessage: "Erro interno no servidor, erro: "+erro});
    }
})

//rota para criar admins (apenas admins)
router.post("/admin", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        return res.status(400).json({message: "Erro, nome de usuario invalido"});
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        return res.status(400).json({message: "Erro, e-mail de usuario invalido"});
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        return res.status(400).json({message: "Erro, senha de usuario invalida"});
    }

    if(req.body.senha.length < 4) {
        return res.status(400).json({message: "Erro, senha muito curta"});
    }

    if(req.body.senha2 !== req.body.senha) {
        return res.status(400).json({message: "Erro, as senhas devem coincidir"})
    }

    try {
        const adminExistente = await Usuario.findOne({email: req.body.email});
        if(adminExistente) {
            return res.status(400).json({message: "Erro, ja existe um usuario com este email"});
        }

        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(req.body.senha, salt);

        const novoAdmin = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: hash,
            isAdmin: 1
        })

        const adminCriado = await novoAdmin.save();
        return res.status(201).json({message: "Admin criado com sucesso!!!", adminCriado:adminCriado});
    } catch(erro) {
        console.log("Erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

module.exports = router;