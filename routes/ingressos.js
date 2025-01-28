const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Ingresso");
const Ingresso = mongoose.model("ingressos");
const auth = require("../auth/auth");

//tela para adicionar ingressos
router.get("/adicionar-ingresso", (req,res) => {
    res.render("adicionarIngressos", {
        title: "Adicionar ingresso"
    })
})

//adicionar ingressos (apenas admins)
router.post("/", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        return res.status(400).json({message: "Erro, nome invalido"});
    }

    if(!req.body.preco || typeof req.body.preco === undefined || req.body.preco === null || req.body.preco < 0) {
        return res.status(400).json({message: "Erro, preço invalido"});
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        return res.status(400).json({message: "Erro, quantidade invalida"});
    }

    try {
        const novoIngresso = new Ingresso({
            nome: req.body.nome,
            preco: req.body.preco,
            quantidade: req.body.quantidade
        })

        const ingressoCriado = await novoIngresso.save();
        return res.status(201).json({message: "Ingresso adicionado com sucesso!!!", ingressoCriado: ingressoCriado});
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
            ingressos: ingressos
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//atualizar dados de um ingresso (apenas admins)
router.put("/:id", auth.verificaAdmin, async (req,res) => {
    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        return res.status(400).json({message: "Erro, nome invalido"});
    }

    if(!req.body.preco || typeof req.body.preco === undefined || req.body.preco === null || req.body.preco < 0) {
        return res.status(400).json({message: "Erro, preço invalido"});
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        return res.status(400).json({message: "Erro, quantidade invalida"});
    }

    try {
        const ingressoASerAtualizado = await Ingresso.findOne({_id: req.params.id});
        if(!ingressoASerAtualizado) {
            return res.status(404).json({message: "Erro, ingresso a atualizar nao encontrado"});
        }

        ingressoASerAtualizado.nome = req.body.nome;
        ingressoASerAtualizado.preco = req.body.preco;
        ingressoASerAtualizado.quantidade = req.body.quantidade;

        const ingressoAtualizado = await ingressoASerAtualizado.save();
        return res.status(200).json({message: "Ingresso atualizado com sucesso!!!", ingressoAtualizado:ingressoAtualizado});
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

//rota para excluir ingressos (apenas admins)
router.delete("/:id", auth.verificaAdmin, async (req,res) => {
    try {
        const ingressoASerExcluido = await Ingresso.deleteOne({_id: req.params.id});
        return res.status(200).json({message: "Ingresso excluido com sucesso!!!", ingressoASerExcluido:ingressoASerExcluido});
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({errorMessage: "Erro interno no servidor"});
    }
})

module.exports = router;