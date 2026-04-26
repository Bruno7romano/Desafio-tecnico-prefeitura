import { Response, Router } from 'express';
import { z } from 'zod';
import db from '../db/database';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

const listQuerySchema = z.object({
  bairro: z.string().optional(),
  com_alertas: z.enum(['true', 'false']).optional(),
  revisado: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

type ChildRow = {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  responsavel: string;
  saude: string | null;
  educacao: string | null;
  assistencia_social: string | null;
  revisado: number;
  revisado_por: string | null;
  revisado_em: string | null;
};

function parseChild(row: ChildRow) {
  return {
    ...row,
    saude:              row.saude ? JSON.parse(row.saude) : null,
    educacao:           row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado:           row.revisado === 1,
  };
}

router.get('/', (req: AuthRequest, res: Response) => {
  const result = listQuerySchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      error: 'Parâmetros inválidos',
      issues: result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  const { bairro, com_alertas, revisado, page, limit } = result.data;

  let rows = (db.prepare('SELECT * FROM children').all() as ChildRow[]).map(parseChild);

  if (bairro) {
    rows = rows.filter(c => c.bairro === bairro);
  }

  if (com_alertas === 'true') {
    rows = rows.filter(c => {
      const areas = [c.saude, c.educacao, c.assistencia_social];
      return areas.some(a => a?.alertas?.length > 0);
    });
  }

  if (revisado !== undefined) {
    rows = rows.filter(c => c.revisado === (revisado === 'true'));
  }

  const total = rows.length;
  const start = (page - 1) * limit;
  const data = rows.slice(start, start + limit);

  res.json({
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id) as ChildRow | undefined;

  if (!row) {
    res.status(404).json({ error: 'Criança não encontrada' });
    return;
  }

  res.json(parseChild(row));
});

router.patch('/:id/review', requireAuth, (req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT id FROM children WHERE id = ?').get(req.params.id);

  if (!row) {
    res.status(404).json({ error: 'Criança não encontrada' });
    return;
  }

  db.prepare(`
    UPDATE children
    SET revisado = 1, revisado_por = ?, revisado_em = ?
    WHERE id = ?
  `).run(req.user!.preferred_username, new Date().toISOString(), req.params.id);

  res.json({ success: true });
});

export default router;