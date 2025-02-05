const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Ingresso");
const Ingresso = mongoose.model("ingressos");
const auth = require("../auth/auth");

//tela para adicionar ingressos
router.get("/adicionar-ingresso", auth.verificaAdmin, (req,res) => {
    res.render("adicionarIngressos", {
        title: "Adicionar ingresso",
        erro: req.flash("erro")
    })
})

//adicionar ingressos (apenas admins)
router.post("/", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        req.flash("erro", "Erro, nome invalido");
        return res.redirect("/ingressos/adicionar-ingresso");
    }

    if(!req.body.preco || typeof req.body.preco === undefined || req.body.preco === null || req.body.preco < 0) {
        req.flash("erro", "Erro, preço invalido");
        return res.redirect("/ingressos/adicionar-ingresso");
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        req.flash("erro", "Erro, quantidade invalida");
        return res.redirect("/ingressos/adicionar-ingresso");
    }

    try {
        const novoIngresso = new Ingresso({
            nome: req.body.nome,
            preco: req.body.preco,
            quantidade: req.body.quantidade
        })

        const ingressoCriado = await novoIngresso.save();
        req.flash("sucesso", "Ingresso adicionado com sucesso!!!");
        return res.redirect("/usuarios/area-admin");
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//ver todos os ingressos adicionados (qualquer um no sistema consegue ver)
router.get("/", async (req,res) => {
    try {
        const ingressos = await Ingresso.find().lean();
        res.render("ingressos", {
            title: "Ingressos",
            ingressos: ingressos,
            erro: req.flash("erro"),
            sucesso: req.flash("sucesso")
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//tela de editar ingressos (apenas admins)
router.get("/editar/:id", auth.verificaAdmin, async (req,res) => {
    try {
        const ingresso = await Ingresso.findOne({_id: req.params.id}).lean();
        if(!ingresso) {
            req.flash("erro", "Erro ao encontrar ingresso a ser editado");
            res.redirect("/usuarios/area-admin");
        }

        res.render("editarIngresso", {
            title: "Editar ingresso",
            erro: req.flash("erro"),
            ingresso: ingresso
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//atualizar dados de um ingresso (apenas admins)
router.post("/editar/:id", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        req.flash("erro", "Erro, nome invalido");
        return res.redirect(`/ingressos/editar/${req.params.id}`);
    }

    if(!req.body.preco || typeof req.body.preco === undefined || req.body.preco === null || req.body.preco < 0) {
        req.flash("erro", "Erro, preço invalido");
        return res.redirect(`/ingressos/editar/${req.params.id}`);
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        req.flash("erro", "Erro, quantidade invalida");
        return res.redirect(`/ingressos/editar/${req.params.id}`);
    }

    try {
        const ingressoASerAtualizado = await Ingresso.findOne({_id: req.params.id});
        if(!ingressoASerAtualizado) {
            req.flash("erro", "Erro, ingresso a atualizar nao encontrado");
            return res.redirect(`/ingressos/editar/${req.params.id}`);
        }

        ingressoASerAtualizado.nome = req.body.nome;
        ingressoASerAtualizado.preco = req.body.preco;
        ingressoASerAtualizado.quantidade = req.body.quantidade;

        const ingressoAtualizado = await ingressoASerAtualizado.save();
        req.flash("sucesso", "Ingresso atualizado com sucesso!!!");
        return res.redirect("/usuarios/area-admin");
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//rota para excluir ingressos (apenas admins)
router.post("/excluir/:id", auth.verificaAdmin, async (req,res) => {
    try {
        const ingressoASerExcluido = await Ingresso.deleteOne({_id: req.params.id});
        req.flash("sucesso", "Ingresso excluido com sucesso!!!");
        return res.redirect("/usuarios/area-admin");
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

module.exports = router;