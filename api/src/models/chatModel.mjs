import executar from "../config/DataBase.mjs";

export function cadastrarSala(nome, identificador, senha) {
    let query = `insert into Sala values (null,'${nome}' ,'${identificador}','${senha}')`;
    return executar(query);
}

export function inserirUser(fkSala, fkUsuario) {
    let query = `insert into Chat values (null,${fkSala},${fkUsuario})`;
    return executar(query);
}

export function inserirMensagem(fkUsuario, fkChat, texto, dtMensagem) {
    let query = `insert into Mensagem values (null,${fkUsuario},${fkChat},'${texto}','${dtMensagem}')`;
    return executar(query);
}

export function listarChats(fkUsuario) {
    let query = `select s.* from Sala s JOIN Chat c on c.fkSala = s.id where c.fkUsuario = ${fkUsuario}`;
    return executar(query);
}

export function listarMensagens(fkSala) {
    let query = `select u.nome, m.texto, m.dtMensagem, m.fkUsuario from Mensagem m JOIN Usuario u on m.fkUsuario = u.id where fkSala = ${fkSala} order by m.id`;
    return executar(query);
}

export function verUsuariosDaSala(idSala) {
    let query = `select u.* from Chat c JOIN Usuario u on c.fkUsuario = u.id where c.fkSala = ${idSala}`;
    return executar(query);
}