import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUploadSignature } from "../controllers/upload.controller.js";

const router = Router();

// Only authenticated users can request upload signature
router.use(verifyJWT);

router.get("/signature", getUploadSignature);

export default router;
