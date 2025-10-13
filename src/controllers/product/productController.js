const ProductSchema = require('../../models/product/productSchema');
const Counters = require('../../models/counters');

const createProduct = async (req, res) => {
    const { name, description, price, category, tags } = req.body;

    try {
        const existingProduct = await ProductSchema.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({
                message: 'Produto já existe com o mesmo nome.',
                details: 'Conflict'
            });
        }

        const counter = await Counters.findByIdAndUpdate(
            { _id: 'productCode' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const newProduct = new ProductSchema({
            name,
            description,
            productCode: formatProductCode(counter.seq),
            price,
            category,
            tags
        });

        await newProduct.save();
        res.status(201).json({
            Message: 'Produto criado com sucesso',
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await ProductSchema.find();

        res.status(200).json({
            message: 'Produtos encontrados com sucesso',
            data: products
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await ProductSchema.findById(id);
        if (!product) {
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }
        return res.status(200).json({
            message: 'Produto encontrado com sucesso',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar produto',
            details: error.message,
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const options = { new: true };

        if (updates.name) {
            const findProductByName = await ProductSchema.exists({ name: updates.name });
            if (findProductByName) {
                return res.status(409).json({
                    message: 'Produto já existe com o mesmo nome.',
                    details: 'Conflict'
                });
            }
        }
        Object.keys(updates).forEach(key => {
            if (!updates[key]) {
                delete updates[key];
            }
        });

        const updatedProduct = await ProductSchema.findByIdAndUpdate(id, updates, options);

        if (!updatedProduct) {
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        return res.status(200).json({
            message: 'Produto atualizado com sucesso',
            data: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao atualizar produto',
            details: error.message,
        });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await ProductSchema.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }
        return res.status(200).json({
            message: 'Produto deletado com sucesso',
            data: deletedProduct
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao deletar produto',
            details: error.message,
        });
    }
};


const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await ProductSchema.find({ category });

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado para a categoria informada',
                details: 'Nenhum registro foi localizado com a categoria informada.',
            });
        }

        return res.status(200).json({
            message: 'Produtos encontrados com sucesso',
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar produtos por categoria',
            details: error.message,
        });
    }
};


const getProductsByAvailability = async (req, res) => {     
    try {
        const { available } = req.params;
        const products = await ProductSchema.find({ available: available === 'true' });

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado para a disponibilidade informada',
                details: 'Nenhum registro foi localizado com a disponibilidade informada.',
            });
        }

        return res.status(200).json({
            message: 'Produtos encontrados com sucesso',
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar produtos por disponibilidade',
            details: error.message,
        });
    }
};


const getProductByName = async (req, res) => {
    try {
        const { name } = req.query;
        const products = await ProductSchema.find({ name: { $regex: name, $options: 'i' } });

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado com o nome informado',
                details: 'Nenhum registro foi localizado com o nome informado.',
            });
        }

        return res.status(200).json({
            message: 'Produtos encontrados com sucesso',
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar produtos por nome',
            details: error.message,
        });
    }
};

const addTagsToProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;      
        const product = await ProductSchema.findById(id);

        if (!product) {             
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        product.tags = [...product.tags, ...tags];
        await product.save();

        return res.status(200).json({
            message: 'Tags adicionadas com sucesso',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao adicionar tags ao produto',
            details: error.message,
        });
    }
};

const removeTagsFromProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const product = await ProductSchema.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Produto não encontrado',
                details: 'Nenhum registro foi localizado com o ID informado.',
            });
        }

        product.tags = product.tags.filter(tag => !tags.includes(tag));
        await product.save();

        return res.status(200).json({
            message: 'Tags removidas com sucesso',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao remover tags do produto',
            details: error.message,
        });
    }
};

const getProductsByTags = async (req, res) => {
    try {
        const { tags } = req.query;

        const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        if (tagsArray.length === 0) {
            return res.status(400).json({   
                message: 'Nenhuma tag fornecida',
                details: 'Por favor, forneça pelo menos uma tag para buscar os produtos.',
            });
        }

        const products = await ProductSchema.find({ tags: { $all: tagsArray } });

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado com as tags informadas',
                details: 'Nenhum registro foi localizado com as tags informadas.',
            });
        }

        return res.status(200).json({
            message: 'Produtos encontrados com sucesso',
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar produtos por tags',
            details: error.message,
        });
    }
};

function formatProductCode(number, length = 6) {
  return number.toString().padStart(length, '0');
}

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByAvailability,
    getProductByName,
    addTagsToProduct,
    removeTagsFromProduct,
    getProductsByTags,
    getProductById
};