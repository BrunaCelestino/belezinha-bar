const mongoose = require('mongoose');
const { DateTime } = require("luxon");


const orderSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    orderCode: {
        type: String,
        required: true,
        unique: true
    },
    customerCode: {
        type: String,
        required: true,
    },
    products: {
        type: Array,
        required: true,
    },
    orderedAt: {
        type: String,
    },
    readyAt: {
        type: String,
        required: false,
    },
    deliveredAt: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        enum: ['ABERTO', 'PRONTO', 'IMPEDIDO', 'CANCELADO', 'ENTREGUE', 'FINALIZADO'],
        default: 'ABERTO'
    },
    category: {
        type: String,
        required: true,
        enum: ['BAR', 'COZINHA']
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    OrderObservations: {
        type: String,
        required: false,
    },
    impedimentObservations: {
        type: String,
        required: false,
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPriceAfterDiscount: {
        type: Number,
        required: false,
        default: 0
    }
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);