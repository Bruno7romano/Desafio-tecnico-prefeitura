import db from './database';
import seedData from '../../data/seed.json';

type SeedChild = typeof seedData[0];

export function runSeed(): void {
  const { count } = db
    .prepare('SELECT COUNT(*) as count FROM children')
    .get() as { count: number };

  if (count > 0) {
    console.log('Banco já populado, seed ignorado.');
    return;
  }

  const insert = db.prepare(`
    INSERT INTO children (
      id, nome, data_nascimento, bairro, responsavel,
      saude, educacao, assistencia_social,
      revisado, revisado_por, revisado_em
    ) VALUES (
      @id, @nome, @data_nascimento, @bairro, @responsavel,
      @saude, @educacao, @assistencia_social,
      @revisado, @revisado_por, @revisado_em
    )
  `);

  const seedAll = db.transaction((children: SeedChild[]) => {
    for (const child of children) {
      insert.run({
        id:                 child.id,
        nome:               child.nome,
        data_nascimento:    child.data_nascimento,
        bairro:             child.bairro,
        responsavel:        child.responsavel,
        saude:              child.saude ? JSON.stringify(child.saude) : null,
        educacao:           child.educacao ? JSON.stringify(child.educacao) : null,
        assistencia_social: child.assistencia_social ? JSON.stringify(child.assistencia_social) : null,
        revisado:           child.revisado ? 1 : 0,
        revisado_por:       child.revisado_por,
        revisado_em:        child.revisado_em,
      });
    }
  });

  seedAll(seedData);
  console.log(`Seed: ${seedData.length} crianças inseridas.`);
}