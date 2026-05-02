CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       nome VARCHAR(100) NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       senha VARCHAR(255) NOT NULL,
                       tipo VARCHAR(50) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pessoas (
                         id SERIAL PRIMARY KEY,
                         nome VARCHAR(255),
                         data_nascimento DATE,
                         local_nascimento VARCHAR(255),
                         rg VARCHAR(20),
                         cpf VARCHAR(14) UNIQUE,
                         passaporte VARCHAR(20),
                         cnh VARCHAR(20),

                         criado_por INTEGER REFERENCES users(id),
                         atualizado_por INTEGER REFERENCES users(id),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE caracteristicas_pessoais (
                                          pessoa_id INTEGER PRIMARY KEY REFERENCES pessoas(id) ON DELETE CASCADE,
                                          genero VARCHAR(50),
                                          raca VARCHAR(50),
                                          altura DECIMAL(3,2),
                                          peso DECIMAL(5,2),
                                          biotipo VARCHAR(100),
                                          cabelo VARCHAR(100),
                                          roupa_uso_comum TEXT
);

CREATE TABLE biometria (
                           pessoa_id INTEGER PRIMARY KEY REFERENCES pessoas(id) ON DELETE CASCADE,
                           face_frontal TEXT,
                           face_esq TEXT,
                           face_dir TEXT
);

CREATE TABLE anomalias (
                           id SERIAL PRIMARY KEY,
                           pessoa_id INTEGER REFERENCES pessoas(id) ON DELETE CASCADE,
                           fisica TEXT,
                           congenita TEXT,
                           adquirida TEXT,
                           comportamental TEXT
);

CREATE TABLE caracteristicas_adicionais (
                                            id SERIAL PRIMARY KEY,
                                            pessoa_id INTEGER REFERENCES pessoas(id) ON DELETE CASCADE,
                                            caracteristica TEXT
);

CREATE TABLE historico_alteracoes (
                                      id SERIAL PRIMARY KEY,
                                      pessoa_id INTEGER REFERENCES pessoas(id) ON DELETE CASCADE,
                                      user_id INTEGER REFERENCES users(id),
                                      data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      tipo_operacao VARCHAR(20),
                                      dados_anteriores JSONB,
                                      dados_novos JSONB
);