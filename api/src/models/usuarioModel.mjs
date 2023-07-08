import executar from "../config/DataBase.mjs";

export function cadastrarUsuario(nome, login, senha) {
    let query = `insert into Usuario values (null,'${nome}','${login}','${senha}')`;
    return executar(query);
}

export function verificarUsuario(login, senha) {
    let query = `select * from Usuario where login = '${login}' and senha = '${senha}'`;
    return executar(query);
}

export function verificarNome(nome) {
    let query = `select id, nome from Usuario where nome = '${nome}';`;
    return executar(query);
}

