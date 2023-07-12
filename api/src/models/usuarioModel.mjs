import executar from "../config/DataBase.mjs";

export function cadastrarUsuario(nome, senha, perfilSrc) {
    let query = `insert into Usuario values (null,'${nome}','${senha}', '${perfilSrc}')`;
    return executar(query);
}

export function verificarUsuario(login, senha) {
    let query = `select * from Usuario where nome = '${login}' and senha = '${senha}'`;
    return executar(query);
}

export function verificarNome(nome) {
    let query = `select id, nome from Usuario where nome = '${nome}';`;
    return executar(query);
}

