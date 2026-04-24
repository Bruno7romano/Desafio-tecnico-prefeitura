import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const CREDENTIALS = {
  email: 'tecnico@prefeitura.rio',
  senha: 'painel@2024',
};

router.post('/token', (req: Request, res: Response) => {
  const { email, senha } = req.body;

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