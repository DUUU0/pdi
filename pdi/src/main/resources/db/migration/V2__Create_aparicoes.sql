-- Tabela de Monitoramento (Logs)
CREATE TABLE aparicoes (
                           id SERIAL PRIMARY KEY,
                           pessoa_id INTEGER REFERENCES pessoas(id),
                           data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           similaridade DECIMAL(5,2)
);