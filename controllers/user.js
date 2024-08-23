import User from "../models/users.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";

// Método de prueba de usuario
export const testUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador user.js",
    user: req.user
  });
}

// Método Registro de Usuarios
export const register = async (req, res) => {
  try {
    // Obtener los datos de la petición
    let params = req.body;

    // Validaciones de los datos obtenidos
    if (!params.name || !params.last_name || !params.email || !params.password || !params.nick){
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }

    // Crear el objeto de usuario con los datos que ya validamos
    let user_to_save = new User(params);
    user_to_save.email = params.email.toLowerCase();

    // Busca si ya existe un usuario con el mismo email o nick
    const existingUser = await User.findOne({
      $or: [
        { email: user_to_save.email.toLowerCase() },
        { nick: user_to_save.nick.toLowerCase() }
      ]
    });

    // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
    if(existingUser) {
      return res.status(409).send({
        status: "error",
        message: "!El usuario ya existe!"
      });
    }

    // Cifra la contraseña antes de guardarla en la base de datos
    const salt = await bcrypt.genSalt(10); // Genera una sal para cifrar la contraseña
    const hashedPassword = await bcrypt.hash(user_to_save.password, salt); // Cifra la contraseña
    user_to_save.password = hashedPassword; // Asigna la contraseña cifrada al usuario

    // Guardar el usuario en la base de datos
    await user_to_save.save();

    // Devolver el usuario registrado
    return res.status(200).json({
      status: "success",
      message: "Registro de usuario exitoso",
      user_to_save
    });

  } catch (error) {
    // Manejo de errores
    console.log("Error en el registro de usuario:", error);
    // Devuelve mensaje de error
    return res.status(500).send({
      status: "error",
      message: "Error en el registro de usuario"
    });
  }
}

// Método de autenticación de usuarios (login) usando JWT
export const login = async (req, res) => {
  try {
    // Obtener los parámetros del body
    let params = req.body;

    // Validar parámetros: email, password
    if (!params.email || !params.password) {
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }

    // Buscar en la BD si existe el email recibido
    const user = await User.findOne({ email: params.email.toLowerCase() });

    // Si no existe el usuario
    if(!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    // Comprobar al contraseña
    const validPassword = await bcrypt.compare(params.password, user.password);

    // Si la contraseña es incorrecta
    if(!validPassword) {
      return res.status(401).send({
        status: "error",
        message: "Contraseña incorrecta"
      });
    }

    // Generar token de autenticación
    const token = createToken(user);

    // Devolver Token y datos del usuario autenticado
    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        nick: user.nick,
        image: user.image,
        created_at: user.created_at
      }
    });

  } catch (error) {
    // Manejo de errores
    console.log("Error en la autenticación del usuario:", error);
    // Devuelve mensaje de error
    return res.status(500).send({
      status: "error",
      message: "Error en la autenticación del usuario"
    });
  }
}

// Método para mostrar el perfil del usuario
export const profile = async (req, res) => {
  try {
    // Obtener el ID del usuario desde los parámetros de la URL
    const userId = req.params.id;

    // Buscar al usuario en la BD y excluimos los datos que no queremos mostrar
    const user = await User.findById(userId).select('-password -role -email -__v');

    // Verficiar si el usuario no existe
    if(!user){
      return res.status(404).send({
        status: "success",
        message: "Usuario no encontrado"
      });
    }

    // Devolver la información del perfil del usuario
    return res.status(200).json({
      status: "success",
      user
    });

  } catch (error) {
    console.log("Error al obtener el perfil del usuario:", error)
    return res.status(500).send({
      status: "error",
      message: "Error al obtener el perfil del usuario"
    });
  }
}

// Método para listar usuarios con la paginación de MondoDB
export const listUsers = async (req, res) => {
  try {
    // Gestionar páginas
    // Controlar la página actual
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    // Configurar los ítems por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 3;

    // Realizar consulta paginada
    const options = {
      page: page,
      limit: itemsPerPage,
      select: '-password -email -role -__v'
    };
    const users = await User.paginate({}, options);

    // Si no hay usuarios dispobibles
    if(!users || users.docs.length === 0){
      return res.status(404).send({
        status: "error",
        message: "No existen usuarios disponibles"
      });
    }

    // Devolver los usuarios paginados
    return res.status(200).json({
      status: "success",
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      Currentpage: users.page
    });

  } catch (error) {
    console.log("Error al listar los usuarios:", error)
    return res.status(500).send({
      status: "error",
      message: "Error al listar los usuarios"
    });
  }
}