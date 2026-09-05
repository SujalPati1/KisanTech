import express from 'express';
import { login } from '../controllers/login.js';
import { signUp } from '../controllers/signUp.js';


const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

export default router;