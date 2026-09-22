-- Localização onde a pessoa foi vista (câmera/ponto de captura)
ALTER TABLE aparicoes
    ADD COLUMN local VARCHAR(255),
    ADD COLUMN latitude DECIMAL(9,6),
    ADD COLUMN longitude DECIMAL(9,6);

CREATE INDEX idx_aparicoes_pessoa_data ON aparicoes (pessoa_id, data_hora DESC);
