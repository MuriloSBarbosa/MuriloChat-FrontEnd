import executar from "../config/DataBase.mjs";

export function cadastrarSala(nome, identificador, senha) {
    let query = `insert into Sala values (null,'${nome}' ,'${identificador}','${senha}')`;
    return executar(query);
}

export function verificarUsuarioNaSala(idSala, idUser) {
    let query = `select u.nome from Chat c join usuario u on u.id = c.fkUsuario where c.fkSala = ${idSala} and c.fkUsuario = ${idUser}`;
    return executar(query);
}

export function inserirUser(fkSala, fkUsuario) {
    let query = `insert into Chat values (null,${fkSala},${fkUsuario})`;
    return executar(query);
}

export function inserirMensagem(idUsuario, idSala, mensagem, dtAgora, isAddUser) {
    let query = `INSERT INTO Mensagem values (null,${idUsuario},${idSala},'${mensagem}','${dtAgora}',null, ${isAddUser ? 1 : 0})`;
    return executar(query);
}

export function inserirMensagemImagem(idUsuario, idSala, srcImage, dtAgora) {
    let query = `INSERT INTO Mensagem values (null,${idUsuario},${idSala},null,'${dtAgora}','${srcImage}',0)`;
    return executar(query);
}

export function listarChats(fkUsuario) {
    let query = `select s.* from Sala s JOIN Chat c on c.fkSala = s.id where c.fkUsuario = ${fkUsuario}`;
    return executar(query);
}

export function listarMensagens(fkSala) {
    let query = `select u.nome, u.perfilSrc, m.texto, m.dtMensagem, m.fkUsuario, m.srcImage, m.isAddUser from Mensagem m JOIN Usuario u on m.fkUsuario = u.id where fkSala = ${fkSala} order by m.id`;
    return executar(query);
}

export function verUsuariosDaSala(idSala) {
    let query = `select u.id, u.nome from Chat c JOIN Usuario u on c.fkUsuario = u.id where c.fkSala = ${idSala}`;
    return executar(query);
}

