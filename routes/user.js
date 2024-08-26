import { Router } from "express";
const router = Router();
import { testUser, register, login, profile, listUsers, updateUser, uploadAvatar } from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import User from "../models/users.js"
import { checkEntityExists } from "../middlewares/checkEntityExists.js"

// Configuración de subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars")
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-"+Date.now()+"-"+file.originalname);
  }
});

const uploads = multer({storage});

// Definir las rutas
router.get('/test-user', ensureAuth, testUser);
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', ensureAuth, profile);
router.get('/list/:page?', ensureAuth, listUsers);
router.put('/update', ensureAuth, updateUser);
router.post('/upload-avatar', [ensureAuth, checkEntityExists(User, 'user_id'), uploads.single("file0")], uploadAvatar);

// Exportar el Router
export default router;