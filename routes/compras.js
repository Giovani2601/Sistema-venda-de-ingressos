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

//rota para criar compras
router.post("/", auth.verificaUser, async (req,res) => {
    const user = req.user;
    
    if(!req.body.idIngresso || typeof req.body.idIngresso === undefined || req.body.idIngresso === null) {
        return res.status(400).json({message: "Erro, ingresso invalido"});
    }

    if(!req.body.quantidade || typeof req.body.quantidade === undefined || req.body.quantidade === null || req.body.quantidade <= 0) {
        return res.status(400).json({message: "Erro, quantidade invalida"});
    }

    try {
        const idUser = user._id;
        const ingressoASerComprado = await Ingresso.findOne({_id: req.body.idIngresso});

        if(!ingressoASerComprado) {
            return res.status(404).json({message: "Erro ao verificar ingresso para compra"});
        }

        if(req.body.quantidade > ingressoASerComprado.quantidade) {
            return res.status(400).json({message: "Erro, não é possível comprar uma quantidade de ingressos acima do disponível"});
        }

        ingressoASerComprado.quantidade = ingressoASerComprado.quantidade - req.body.quantidade;
        await ingressoASerComprado.save();

        const novaCompra = new Compra({
            idIngresso: req.body.idIngresso,
            idUsuario: idUser,
            quantidade: req.body.quantidade
        })

        const compraCriada = await novaCompra.save();
        return res.status(201).json({message: "Compra realizada com sucesso!!!", compraCriada:compraCriada});
    } catch(erro) {
        console.log("erro: "+erro);
        return res.status(500).json({message: "Erro interno no servidor"});
    }
})

//rota para ver todas as suas compras
router.get("/", auth.verificaUser, async (req,res) => {
    const user = req.user;

    try {
        const compras = await Compra.find({idUsuario: user._id}).populate("idIngresso");
        return res.status(200).json(compras);
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