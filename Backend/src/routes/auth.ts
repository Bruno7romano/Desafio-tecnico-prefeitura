import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const CREDENTIALS = {
  email: 'tecnico@prefeitura.rio',
  senha: 'painel@2024',
};

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

router.post('/token', (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Dados inválidos',
      issues: result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  const { email, senha } = result.data;

  if (email !== CREDENTIALS.email || senha !== CREDENTIALS.senha) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = jwt.sign(
    { preferred_username: email },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  res.json({ access_token: token, token_type: 'Bearer' });
});

export default router;
