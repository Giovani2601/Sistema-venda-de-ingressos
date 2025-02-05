const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Compra");
const Compra = mongoose.model("compras");
require("../models/Ingresso");
const Ingresso = mongoose.model("ingressos");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const auth = require("../auth/auth");

//tela para comprar ingressos
router.get("/comprar/:id", auth.verificaUser, async (req,res) => {
    const user = req.user;
    try {
        const ingresso = await Ingresso.findOne({_id: req.params.id}).lean();
        if(!ingresso) {
            req.flash("erro", "Erro, ingresso nao encontrado");
            return res.redirect("/ingressos");
        }

        res.render("comprarIngresso", {
            title: "Comprar ingresso",
            ingresso: ingresso,
            erro: req.flash("erro")
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

//rota para criar compras
router.post("/", auth.verificaUser, async (req,res) => {
    const user = req.user;
    
    if(!req.body.idIngresso || typeof req.body.idIngresso === undefined || req.body.idIngresso === null) {
        req.flash("erro", "Erro, ingresso invalido");
        return res.redirect(`/compras/comprar/${req.body.idIngresso}`);
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        req.flash("erro", "Erro, quantidade invalida");
        return res.redirect(`/compras/comprar/${req.body.idIngresso}`);
    }

    try {
        const idUser = user._id;
        const ingressoASerComprado = await Ingresso.findOne({_id: req.body.idIngresso});

        if(!ingressoASerComprado) {
            req.flash("erro", "Erro ao verificar ingresso para compra");
            return res.redirect(`/compras/comprar/${req.body.idIngresso}`);
        }

        if(req.body.quantidade > ingressoASerComprado.quantidade) {
            req.flash("erro", "Erro, não é possível comprar uma quantidade de ingressos acima do disponível");
            return res.redirect(`/compras/comprar/${req.body.idIngresso}`);
        }

        ingressoASerComprado.quantidade = ingressoASerComprado.quantidade - req.body.quantidade;
        await ingressoASerComprado.save();

        const novaCompra = new Compra({
            idIngresso: req.body.idIngresso,
            idUsuario: idUser,
            quantidade: req.body.quantidade
        })

        const compraCriada = await novaCompra.save();
        req.flash("sucesso", "Compra realizada com sucesso!!!");
        return res.redirect("/ingressos");
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

//rota para ver todas as suas compras
router.get("/", auth.verificaUser, async (req,res) => {
    const user = req.user;

    try {
        const compras = await Compra.find({idUsuario: user._id}).populate("idIngresso").lean();
        return res.render("meusIngressos", {
            title: "Meus ingressos",
            compras: compras
        })
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

//rota para ver uma compra em especifico
router.get("/:id", auth.verificaUser, async (req,res) => {
    const user = req.user;

    try {
        const compra = await Compra.findOne({idUsuario: user._id, _id: req.params.id}).populate("idIngresso");
        if(!compra) {
            return res.status(404).json({message: "Erro ao encontrar compra"});
        }
        return res.status(200).json(compra);
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

module.exports = router;