-- Aplicar somente se programs.content_snapshot ainda não existir e programs estiver vazia.
-- backend/setup-db.js verifica ambas as condições antes de executar esta migração.
ALTER TABLE programs ADD COLUMN content_snapshot JSON NOT NULL AFTER profile_snapshot;
