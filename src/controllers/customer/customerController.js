const CustomerSchema = require('../../models/customer/customerSchema');


const createCustomer = async (req, res) => {
    try {

        const findCustomerByCustomerCode = await CustomerSchema.exists({
            customerCode: req.body.customerCode,
        });

        if (findCustomerByCustomerCode) {
            return res.status(409).json({
                message: 'O código do cliente já existe.',
                details: 'Conflict',
            });
        }

        const customer = new CustomerSchema(req.body);

        await customer.save();

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            customer: {
                customerCode: customer.customerCode,
                name: customer.name,
                phone: customer.phone,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateCustomer = async (req, res) => {
    try {
        const { customerCode } = req.body;

        if (customerCode) {
            const findCustomerByCustomerCode = await CustomerSchema.exists({
                customerCode: req.body.customerCode,
            });

            if (findCustomerByCustomerCode) {
                return res.status(409).json({
                    message: 'O código do cliente já existe.',
                    details: 'Conflict',
                });
            }
        }

        const customerFound = await CustomerSchema.findById(req.params.id);

        if (customerFound === null) {
            return res.status(404).json({
                message: 'Não foi possível atualizar o cadastro do cliente',
                details: 'Not Found.',
            });
        }

        customerFound.customerCode = req.body.customerCode || customerFound.customerCode;
        customerFound.name = req.body.name || customerFound.name;
        customerFound.phone = req.body.phone || customerFound.phone;

        const savedCustomer = await customerFound.save();

        return res.status(200).json({
            message: 'Cliente atualizado com sucesso!',
            customer: {
                customerCode: savedCustomer.customerCode,
                name: savedCustomer.name,
                phone: savedCustomer.phone,
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteCustomer = async (req, res) => {
    try {
        const customerFound = await CustomerSchema.findById(req.params.id);

        if (customerFound === null) {
            return res.status(404).json({
                message: 'Não foi possível deletar o cadastro do cliente',
                details: 'Not Found',
            });
        }

        await CustomerSchema.deleteOne({ _id: req.params.id });

        return res.status(200).json({
            message: 'Cliente deletado com sucesso!',
            customerCode: customerFound.customerCode,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const listCustomers = async (req, res) => {
    try {
        const customers = await CustomerSchema.find();
        return res.status(200).json({
            message: 'Clientes encontrados com sucesso',
            data: customers.map(customer => ({
                id: customer._id,
                name: customer.name,
                customerCode: customer.customerCode,
                phone: customer.phone,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt
            }))
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar clientes',
            details: error.message,
        });
    }
}

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerFound = await CustomerSchema.findById(id);

        if (!customerFound) {
            return res.status(404).json({
                message: 'Cliente não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        return res.status(200).json({
            message: 'Cliente encontrado com sucesso',
            data: {
                id: customerFound._id,
                name: customerFound.name,
                customerCode: customerFound.customerCode,
                phone: customerFound.phone,
                createdAt: customerFound.createdAt,
                updatedAt: customerFound.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar cliente',
            details: error.message,
        });
    }
}

const getCustomerByCodeNameOrPhone = async (req, res) => {
    try {
        const { customerCode, phone, name } = req.query;
        const customersFound = await CustomerSchema.find({
            $or: [
                { customerCode },
                { phone },
                { name }
            ]
        });

        if (!customersFound || customersFound.length === 0) {
            return res.status(404).json({
                message: 'Cliente não encontrado',
                details: 'Nenhum registro foi localizado com os critérios informados.',
            });
        }

        return res.status(200).json({
            message: 'Clientes encontrados com sucesso',
            data: customersFound.map(customerFound => ({
                id: customerFound._id,
                name: customerFound.name,
                customerCode: customerFound.customerCode,
                phone: customerFound.phone,
                createdAt: customerFound.createdAt,
                updatedAt: customerFound.updatedAt
            }))
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar cliente',
            details: error.message,
        });
    }
}

module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    listCustomers,
    getCustomerById,
    getCustomerByCodeNameOrPhone
};