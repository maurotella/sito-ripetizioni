CREATE TABLE Ragazzo (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    indirizzo TEXT NOT NULL
);

CREATE TABLE Tariffa (
    id INTEGER PRIMARY KEY,
    ragazzo INTEGER REFERENCES Ragazzo(id),
    materia TEXT NOT NULL,
    prezzo INTEGER
);

CREATE TABLE Incontro (
    id INTEGER PRIMARY KEY,
    data TEXT,
    tariffa INTEGER REFERENCES Tariffa(id),
    ore REAL,
    saldato BOOLEAN
);