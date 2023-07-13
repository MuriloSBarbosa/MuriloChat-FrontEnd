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

export function alterarImagem(id, nome) {
    let query = `update Usuario set perfilSrc = ${nome ? `'${nome}'` : null} where id = ${id};`;
    return executar(query);
}

export function alterarNome(id, nome) {
    let query = `update Usuario set nome = '${nome}' where id = ${id};`;
    return executar(query);
}

export function verificarSenha(id, senha) {
    let query = `select * from Usuario where id = ${id} and senha = '${senha}'`;
    return executar(query);
}

export function alterarSenha(id, senha) {
    let query = `update Usuario set senha = '${senha}' where id = ${id};`;
    return executar(query);
}

export function atualizarToken(id) {
    let query = `select * from Usuario where id = ${id}`;
    return executar(query);

}