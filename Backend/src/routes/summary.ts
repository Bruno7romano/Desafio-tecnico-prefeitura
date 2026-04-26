import { Request, Response, Router } from 'express';
import db from '../db/database';

const router = Router();

type ChildRow = {
  bairro: string;
  saude: string | null;
  educacao: string | null;
  assistencia_social: string | null;
  revisado: number;
};

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT saude, educacao, assistencia_social, revisado FROM children').all() as ChildRow[];

  let alertas_saude = 0;
  let alertas_educacao = 0;
  let alertas_assistencia = 0;
  let revisadas = 0;

  for (const row of rows) {
    const saude      = row.saude ? JSON.parse(row.saude) : null;
    const educacao   = row.educacao ? JSON.parse(row.educacao) : null;
    const assistencia = row.assistencia_social ? JSON.parse(row.assistencia_social) : null;

    if (saude?.alertas?.length > 0)       alertas_saude++;
    if (educacao?.alertas?.length > 0)    alertas_educacao++;
    if (assistencia?.alertas?.length > 0) alertas_assistencia++;
    if (row.revisado === 1)               revisadas++;
  }

  res.json({
    total: rows.length,
    revisadas,
    alertas_por_area: {
      saude:             alertas_saude,
      educacao:          alertas_educacao,
      assistencia_social: alertas_assistencia,
    },
  });
});

router.get('/by-bairro', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT bairro, saude, educacao, assistencia_social FROM children').all() as ChildRow[];

  const map = new Map<string, { bairro: string; total: number; saude: number; educacao: number; assistencia_social: number }>();

  for (const row of rows) {
    const saude       = row.saude ? JSON.parse(row.saude) : null;
    const educacao    = row.educacao ? JSON.parse(row.educacao) : null;
    const assistencia = row.assistencia_social ? JSON.parse(row.assistencia_social) : null;

    const current = map.get(row.bairro) ?? {
      bairro: row.bairro,
      total: 0,
      saude: 0,
      educacao: 0,
      assistencia_social: 0,
    };

    current.total++;
    if (saude?.alertas?.length > 0)       current.saude++;
    if (educacao?.alertas?.length > 0)    current.educacao++;
    if (assistencia?.alertas?.length > 0) current.assistencia_social++;

    map.set(row.bairro, current);
  }

  res.json(Array.from(map.values()).sort((a, b) => b.total - a.total));
});

export default router;
