const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Compra = new Schema({
    idIngresso: {
        type: mongoose.Types.ObjectId,
        ref: "ingressos"
    },
    idUsuario: {
        type: mongoose.Types.ObjectId,
        ref: "usuarios"
    },
    quantidade: {
        type: Number,
        required: true
    }
});

mongoose.model("compras", Compra);