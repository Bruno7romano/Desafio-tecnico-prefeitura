import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH 
  || path.resolve(__dirname, '../../data/prefeitura.db');

const db = new Database(DB_PATH);

// WAL = Write-Ahead Logging: leituras não bloqueiam escritas
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id                 TEXT PRIMARY KEY,
    nome               TEXT NOT NULL,
    data_nascimento    TEXT NOT NULL,
    bairro             TEXT NOT NULL,
    responsavel        TEXT NOT NULL,
    saude              TEXT,
    educacao           TEXT,
    assistencia_social TEXT,
    revisado           INTEGER NOT NULL DEFAULT 0,
    revisado_por       TEXT,
    revisado_em        TEXT
  )
`);

export default db;