const OrderSchema = require('../../models/order/orderSchema');
const ProductSchema = require('../../models/product/productSchema');
const Counters = require('../../models/counters');
const { DateTime } = require("luxon");



function formatOrderCode(number, length = 6) {
    return number.toString().padStart(length, '0');
}


const getOrderNumber = async (req, res) => {
    const counter = await Counters.findByIdAndUpdate(
        { _id: 'orderCode' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return res.status(200).json({
        message: 'Número do pedido gerado com sucesso',
        order: formatOrderCode(counter.seq)
    });

}

const createOrder = async (req, res) => {
    const {
        orderCode,
        customerCode,
        products,
        isPaid,
        OrderObservations,
        discount
    } = req.body;
    try {
        const newKitchenOrder = await getOrder(products, 'COZINHA');
        const newBarOrder = await getOrder(products, 'BAR');

        if (newKitchenOrder.length !== 0) {
            const newOrder = new OrderSchema({
                orderCode: "C" + orderCode,
                customerCode,
                products: newKitchenOrder,
                category: 'COZINHA',
                isPaid,
                OrderObservations,
                discount,
                totalItems: newKitchenOrder.length,
                totalPrice: newKitchenOrder.reduce((total, item) => total + item.price, 0),
                orderedAt: DateTime.now().setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd'T'HH:mm:ss"),
            });
            await newOrder.save();
        }

        if (newBarOrder.length !== 0) {
            const newOrder = new OrderSchema({
                orderCode: "B" + orderCode,
                customerCode,
                products: newBarOrder,
                category: 'BAR',
                isPaid,
                OrderObservations,
                discount,
                totalItems: newBarOrder.length,
                totalPrice: newBarOrder.reduce((total, item) => total + item.price, 0),
                orderedAt: DateTime.now().setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd'T'HH:mm:ss"),

            });
            await newOrder.save();
        }

        res.status(201).json({
            message: 'Pedido criado com sucesso',
            order: { orderCode, customerCode, isPaid, OrderObservations, discount }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const getOrder = async (products, filtro) => {
    const allProducts = [];

    for (const item of products) {
        const product = await ProductSchema.findById(item.productId);

        if (product && product.category === filtro) {
            allProducts.push({
                ...product.toObject(),
                collected: item.collected || false,
            });
        }
    }
    return allProducts;
}

const getKitchenOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const kitchenOrders = await OrderSchema.find({ orderCode: /^C/, status })
            .sort({ createdAt: 1 });
        res.status(200).json(kitchenOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getBarOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const barOrders = await OrderSchema.find({ orderCode: /^B/, status })
            .sort({ createdAt: 1 });
        res.status(200).json(barOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllOrdersByCustomerCode = async (req, res) => {
    try {
        const { status, customerCode } = req.query;

        const allOrders = await OrderSchema.find({ customerCode }).sort({ createdAt: 1 });

        const filteredOrders = allOrders.filter(order => !status || order.status === status);

        if (filteredOrders.length === 0) {
            return res.status(404).json({
                message: 'Nenhum pedido encontrado para o código de cliente informado',
                details: 'Nenhum registro foi localizado com o código de cliente informado.',
            });
        }

        const orderGroups = {};
        for (const order of filteredOrders) {
            const code = order.orderCode.slice(1);
            if (!orderGroups[code]) {
                orderGroups[code] = [];
            }
            orderGroups[code].push(order);
        }

        const mergedOrders = Object.entries(orderGroups).map(([code, orders]) => {
            const productMap = new Map();
            const discount = orders[0].discount || 0;
            orders.forEach(order => {
                order.products.forEach(prod => {
                    const key = prod.productCode || (prod._id && prod._id.toString());
                    if (!key) return;

                    const qty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
                    const unitPrice = Number(prod.price) || 0;

                    if (productMap.has(key)) {
                        const existing = productMap.get(key);
                        existing.quantity += qty;
                        existing.totalPrice += unitPrice * qty;
                    } else {
                        productMap.set(key, {
                            productCode: prod.productCode,
                            name: prod.name,
                            category: prod.category,
                            price: unitPrice,
                            quantity: qty,
                            collected: prod.collected || false,
                            totalPrice: unitPrice * qty,
                        });
                    }
                });
            });

            const products = Array.from(productMap.values());
            const totalItems = products.reduce((s, p) => s + p.quantity, 0);
            const totalPrice = products.reduce((s, p) => s + p.totalPrice, 0);

            const isPaid = orders.some(o => o.isPaid);

            return {
                orderCode: code,
                totalItems,
                totalPrice,
                discount,
                totalPriceAfterDiscount: totalPrice - discount,
                isPaid,
                products
            };
        });

        const totalOrders = mergedOrders.length;
        const totalItemsGlobal = mergedOrders.reduce((s, o) => s + o.totalItems, 0);

        const totalPriceGlobal = mergedOrders.reduce((s, o) => s + o.totalPrice, 0);
        const totalDiscountGlobal = mergedOrders.reduce((s, o) => s + (o.discount || 0), 0);
        const totalAfterDiscountGlobal = totalPriceGlobal - totalDiscountGlobal;

        const remainingAmount = mergedOrders
            .filter(o => !o.isPaid)
            .reduce((s, o) => s + (o.totalPrice - o.discount), 0);

        res.status(200).json({
            summary: {
                message: 'Resumo geral dos pedidos',
                customerCode,
                totalOrders,
                totalItems: totalItemsGlobal,
                totalPrice: totalPriceGlobal,
                totalDiscount: totalDiscountGlobal,
                totalPriceAfterDiscount: totalAfterDiscountGlobal,
                remainingAmount,
            },
            orders: mergedOrders,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const orders = await OrderSchema.find({ status: { $nin: ['ABERTO', 'IMPEDIDO'] } }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: 'Histórico de pedidos recuperado com sucesso',
            orders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['ABERTO', 'PRONTO', 'IMPEDIDO', 'CANCELADO', 'ENTREGUE', 'FINALIZADO'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status inválido',
                details: `O status deve ser um dos seguintes: ${validStatuses.join(', ')}.`,
            });
        }
        const order = await OrderSchema.findById(id);
        if (!order) {
            return res.status(404).json({
                message: 'Pedido não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        if (order.status === 'CANCELADO' || order.status === 'FINALIZADO') {
            return res.status(400).json({
                message: 'Não é possível alterar o status de um pedido CANCELADO ou FINALIZADO',
                details: 'Pedidos com status CANCELADO ou FINALIZADO não podem ter seu status alterado.',
            });
        }

        if (order.status === 'ENTREGUE' && status !== 'FINALIZADO') {
            return res.status(400).json({
                message: 'Status inválido',
                details: 'Um pedido ENTREGUE só pode ser alterado para FINALIZADO.',
            });
        }

        if (order.status === 'ABERTO' && status !== 'IMPEDIDO' && status !== 'PRONTO') {
            return res.status(400).json({
                message: 'Status inválido',
                details: 'Um pedido ABERTO só pode ser alterado para IMPEDIDO ou PRONTO.',
            });
        }

        if (order.status === 'IMPEDIDO' && status !== 'ABERTO' && status !== 'CANCELADO') {
            return res.status(400).json({
                message: 'Status inválido',
                details: 'Um pedido IMPEDIDO só pode ser alterado para ABERTO ou CANCELADO.',
            });
        }

        if (order.status === 'PRONTO' && status !== 'ENTREGUE' && status !== 'ABERTO') {
            return res.status(400).json({
                message: 'Status inválido',
                details: 'Um pedido PRONTO só pode ser alterado para ENTREGUE ou ABERTO.',
            });
        }

        order.status = status;

        if (status === 'PRONTO') {
            order.readyAt = DateTime.now().setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd'T'HH:mm:ss");
            order.deliveredAt = null;

        } else if (status === 'ENTREGUE') {
            order.deliveredAt = DateTime.now().setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd'T'HH:mm:ss");

        } else if (status === 'ABERTO' || status === 'CANCELADO') {
            order.readyAt = null;
            order.deliveredAt = null;
        } else if (status === 'IMPEDIDO') {
            order.impedimentObservations = req.body.impedimentObservations || '';
            order.readyAt = null;
            order.deliveredAt = null;
        }

        await order.save();
        return res.status(200).json({
            message: 'Status do pedido atualizado com sucesso',
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao atualizar o status do pedido',
            details: error.message,
        });
    }
}

const addProductToDeliveredOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;

        const order = await OrderSchema.findById(id);
        if (!order) {
            return res.status(404).json({
                message: 'Pedido não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        if (order.status !== 'ENTREGUE') {
            return res.status(400).json({
                message: 'Não é possível adicionar produtos a um pedido que não está entregue',
                details: 'Pedidos que não estão com status ENTREGUE não podem ter produtos adicionados.',
            });
        }

        const product = await ProductSchema.findById(productId);

        if (product) {
            order.products.push({
                ...product.toObject(),
                collected: true,
            });
        }

        await order.save();

        return res.status(200).json({
            message: 'Produto adicionado ao pedido com sucesso',
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao adicionar produto ao pedido',
            details: error.message,
        });
    }
}

const removeProductFromDeliveredOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        const order = await OrderSchema.findById(id);

        if (!order) {
            return res.status(404).json({
                message: 'Pedido não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }
        if (order.status !== 'ENTREGUE') {
            return res.status(400).json({
                message: 'Não é possível remover produtos de um pedido que não está entregue',
                details: 'Pedidos que não estão com status ENTREGUE não podem ter produtos removidos.',
            });
        }

        const productIndex = order.products.findIndex(p => p._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum produto foi localizado com o ID informado.',
            });
        }

        order.products.splice(productIndex, 1);
        await order.save();

        return res.status(200).json({
            message: 'Produto removido do pedido com sucesso',
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao remover produto do pedido',
            details: error.message,
        });
    }
}


const removeAllOrders = async (req, res) => {
    try {
        await OrderSchema.deleteMany({});
        await Counters.findByIdAndUpdate(
        { _id: 'orderCode' },
        { $set: { seq: 0 } },
        { new: true, upsert: true }
    );

        return res.status(200).json({
            message: 'Todos os pedidos foram removidos com sucesso',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao remover todos os pedidos',
            details: error.message,
        });
    }
}

// //gerar um relatorio que traga todos os dados dos pedidos do dia atual, total de pedidos, total de itens vendidos, total faturado, total de descontos aplicados e total a receber, total recebido, total de pedidos cancelados, itens por pedido, que seja baixavel em pdf
// const generateDailyReport = async (req, res) => {
//    try {
//         const startOfDay = DateTime.now().setZone("America/Sao_Paulo").startOf('day').toJSDate();
//         const endOfDay = DateTime.now().setZone("America/Sao_Paulo").endOf('day').toJSDate();

//         const orders = await OrderSchema.find({
//             createdAt: { $gte: startOfDay, $lte: endOfDay }
//         });         
//         return res.status(200).json({
//             message: 'Relatório diário gerado com sucesso',
//             report: {
//                 totalOrders: orders.length,
//                 totalItemsSold: orders.reduce((acc, order) => acc + order.products.length, 0),
//                 totalRevenue: orders.reduce((acc, order) => acc + order.total, 0),
//                 totalDiscounts: orders.reduce((acc, order) => acc + order.discount, 0),
//                 totalToReceive: orders.reduce((acc, order) => acc + order.total - order.paid, 0),
//                 totalReceived: orders.reduce((acc, order) => acc + order.paid, 0),
//                 totalCancelled: orders.filter(order => order.status === 'CANCELADO').length,
//                 itemsPerOrder: orders.map(order => order.products.length)
//             }
//         });

//         // Implementar a geração do PDF aqui, se necessário
//         const pdfReport = await generatePDFReport(report);
//         return res.status(200).json({
//             message: 'Relatório diário gerado com sucesso', 
//             report: pdfReport
//         });
        
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Erro ao gerar o relatório diário',
//             details: error.message
//         });
//     }
// }

module.exports = {
    getOrderNumber,
    getKitchenOrders,
    getBarOrders,
    getAllOrdersByCustomerCode,
    createOrder,
    getOrderHistory,
    updateOrderStatus,
    addProductToDeliveredOrder,
    removeProductFromDeliveredOrder,
    removeAllOrders
};