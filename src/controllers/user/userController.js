const UserSchema = require('../../models/user/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { SECRET } = process.env;


const create = async (req, res) => {
    console.log('Request Body:', req.body); 
  const { username, name, role } = req.body;


  const findUserByUsername = await UserSchema.exists({
    username: req.body.username,
  });

  if (findUserByUsername) {
    return res.status(409).json({
      message: 'O usuário já existe.',
      details: 'Conflict',
    });
  }

  try {
    const newUser = new UserSchema({
      password: req.body.password,
      username,
      name,
      role
    });

    await newUser.save();

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: {
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  const {
    username, name,
  } = req.body;
  try {
    const userFound = await UserSchema.findById(req.params.id);

    if (userFound === null) {
      return res.status(404).json({
        message: 'Não foi possível atualizar o cadastro do usuário',
        details: 'Not Found.',
      });
    }

    if (username) {
      const findUserByUsername = await UserSchema.exists({
        username: req.body.username,
      });

      if (findUserByUsername) {
        return res.status(409).json({
          message: 'Não foi possível atualizar o cadastro do usuário',
          details: 'Conflict',
        });
      }
    }

    userFound.username = username || userFound.username;
    userFound.name = name || userFound.name;
    userFound.password = req.body.password || userFound.password;

    const savedUser = await userFound.save();

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso!',
      data: {
        name: savedUser.name,
        username: savedUser.username,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userFound = await UserSchema.findById(req.params.id);

    if (userFound === null) {
      return res.status(404).json({
        message: 'Não foi possível deletar o cadastro do usuário',
        details: 'Not Found',
      });
    }

     await UserSchema.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      message: 'Usuário deletado com sucesso!',
      username: userFound.username,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOneUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userFound = await UserSchema.findById(id);

    if (!userFound) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        details: 'Nenhum registro foi localizado com o ID informado.',
      });
    }

    return res.status(200).json({
      message: 'Usuário encontrado com sucesso',
      data: {
        name: userFound.name,
        username: userFound.username,
        role: userFound.role,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt
    }});
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar usuário',
      details: error.message,
    });
  }
};

const getOneUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    const userFound = await UserSchema.findOne({ username });

    if (!userFound) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        details: 'Nenhum registro foi localizado com o username informado.',
      });
    }

    return res.status(200).json({
      message: 'Usuário encontrado com sucesso',
      data: {
        name: userFound.name,
        username: userFound.username,
        role: userFound.role,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt
    }});

  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar usuário',
      details: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserSchema.find();

    return res.status(200).json({
      message: 'Usuários encontrados com sucesso',
      data: users.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar usuários',
      details: error.message,
    });
  }
};

const userSignIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: 'Não foi possível realizar o login',
        details: 'Verifique seu usuário e senha antes de tentar novamente.',
      });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Não foi possível realizar o login',
        details: 'Verifique seu usuário e senha antes de tentar novamente.',
      });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, {
      expiresIn: '24h',
    });

    user.token = token;
    await user.save();

    return res.status(200).json({
      message: 'Login autorizado',
      username: user.username,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao processar login',
      details: error.message,
    });
  }
};

module.exports = {
    create,
    update,
    deleteUser, 
    getOneUserById,
    getOneUserByUsername,
    getAllUsers,
    userSignIn
};