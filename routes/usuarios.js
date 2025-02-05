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
require("../models/Ingresso");
const Ingresso = mongoose.model("ingressos");

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

//tela de criar conta
router.get("/criar-conta", (req,res) => {
    res.render("criarConta", {
        title: "Criar conta",
        erro: req.flash("erro")
    })
})

//criar conta comum
router.post("/", async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        req.flash("erro", "Erro, nome de usuario invalido")
        return res.redirect("/usuarios/criar-conta");
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        req.flash("erro", "Erro, E-mail invalido")
        return res.redirect("/usuarios/criar-conta");
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        req.flash("erro", "Erro, senha invalida")
        return res.redirect("/usuarios/criar-conta");
    }

    if(req.body.senha.length < 4) {
        req.flash("erro", "Erro, Senha muito curta")
        return res.redirect("/usuarios/criar-conta");
    }

    if(req.body.senha2 !== req.body.senha) {
        req.flash("erro", "Erro, as senhas devem coincidir")
        return res.redirect("/usuarios/criar-conta");
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
            req.flash("erro", "Erro, ja existe uma conta com este email")
            return res.redirect("/usuarios/criar-conta");
        }

        const usuarioSalvo = await novoUsuario.save();
        req.flash("sucesso", "Conta criada com sucesso!!!")
        return res.redirect("/usuarios/login");
    } catch (erro) {
        return res.status(500).json({errorMessage: "Erro interno no servidor, erro: "+erro});
    }
})

//tela de login no front
router.get("/login", (req,res) => {
    res.render("login", {
        title: "Login",
        erro: req.flash("erro"),
        sucesso: req.flash("sucesso")
    })
})

//rota para fazer login
router.post("/login", async (req,res) => {
    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        req.flash("erro", "E-mail invalido");
        return res.redirect("/usuarios/login");
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        req.flash("erro", "Senha invalida");
        return res.redirect("/usuarios/login");
    }

    try {
        const usuarioExistente = await Usuario.findOne({email: req.body.email});
        if(!usuarioExistente) {
            req.flash("erro", "Erro, nenhum usuario encontrado com este email")
            return res.redirect("/usuarios/login")
        }

        const batem = await bcryptjs.compare(req.body.senha, usuarioExistente.senha);
        if(!batem) {
            req.flash("erro", "Senha incorreta");
            return res.redirect("/usuarios/login");
        }

        const token = jwt.sign({userId: usuarioExistente._id, isAdmin: usuarioExistente.isAdmin}, SECRET, {expiresIn: "1h"});
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        req.flash("sucesso", "Login realizado com sucesso!");
        return res.redirect("/ingressos");
    } catch(erro) {
        return res.status(500).json({errorMessage: "Erro interno no servidor, erro: "+erro});
    }
})

//tela de criar admins
router.get("/criar-admin", auth.verificaAdmin, (req,res) => {
    res.render("criarAdmin", {
        title: "Criar administrador",
        erro: req.flash("erro")
    })
})

//rota para criar admins (apenas admins)
router.post("/admin", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        req.flash("erro", "Erro, nome de usuario invalido")
        return res.redirect("/usuarios/criar-admin");
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        req.flash("erro", "Erro, e-mail de usuario invalido")
        return res.redirect("/usuarios/criar-admin");
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        req.flash("erro", "Erro, senha de usuario invalida")
        return res.redirect("/usuarios/criar-admin");
    }

    if(req.body.senha.length < 4) {
        req.flash("erro", "Erro, senha muito curta")
        return res.redirect("/usuarios/criar-admin");
    }

    if(req.body.senha2 !== req.body.senha) {
        req.flash("erro", "Erro, as senhas devem coincidir")
        return res.redirect("/usuarios/criar-admin");
    }

    try {
        const adminExistente = await Usuario.findOne({email: req.body.email});
        if(adminExistente) {
            req.flash("erro", "Erro, ja existe um usuario com este email")
            return res.redirect("/usuarios/criar-admin");
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
        req.flash("sucesso", "Admin criado com sucesso!!!");
        res.redirect("/usuarios/area-admin")
    } catch(erro) {
        console.log("Erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

//tela da area de administradores
router.get("/area-admin", auth.verificaAdmin, async (req,res) => {
    try {
        const ingressos = await Ingresso.find().lean();
        res.render("areaAdmin", {
            title: "Área de administradores",
            ingressos: ingressos,
            sucesso: req.flash("sucesso"),
            erro: req.flash("erro")
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

router.get("/logout", (req,res) => {
    res.clearCookie("token");

    req.flash("sucesso", "Logout realizado com sucesso!");

    res.redirect("/ingressos");
})

module.exports = router;