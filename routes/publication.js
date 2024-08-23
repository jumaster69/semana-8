import { Router } from "express";
const router = Router();
import { testPublication } from "../controllers/publication.js";

// Definir las rutas
router.get('/test-publication', testPublication);

// Exportar el Router
export default router;