import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { loginValidators, registerValidators } from './auth.validators';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Employee login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               rememberMe: { type: boolean }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', loginValidators, validate, controller.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new employee
 *     tags: [Auth]
 */
router.post('/register', registerValidators, validate, controller.register);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', controller.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout employee
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authenticate, controller.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticate, controller.getProfile);

export default router;
