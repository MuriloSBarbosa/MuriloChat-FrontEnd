import * as model from "../models/chatModel.mjs"

export async function criarSala(req, res) {
    let { identificador, nome, senha } = req.body;
    try {
        const sala = await model.cadastrarSala(nome, identificador, senha);
        await model.inserirChat(sala.insertId, req.usuario.id);
        res.status(201).send("Chat cadastrado com sucesso!");
    } catch (erro) {
        res.status(500).send("Erro ao cadastrar Chat: " + erro);
    }
}


export function inserirUser(req, res) {
    let { idSala, idUser } = req.body;

    model.inserirUser(idSala, idUser)
        .then(() => {
            res.status(201).send("Chat cadastrado com sucesso!");
        }).catch((erro) => {
            res.status(500).send("Erro ao cadastrar Chat: " + erro);
        });
}

export function inserirMensagem(req, res) {
    let { fkUsuario, fkChat, texto, dtMensagem } = req.body;

    model.inserirMensagem(fkUsuario, fkChat, texto, dtMensagem)
        .then(() => {
            res.status(201).send("Mensagem cadastrada com sucesso!");
        }).catch((erro) => {
            res.status(500).send("Erro ao cadastrar Mensagem: " + erro);
        });
}

export function listarChats(req, res) {
    let { id } = req.usuario;
    console.log(req.usuario);

    model.listarChats(id)
        .then((chats) => {
            res.status(200).send(chats);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar Chats: " + erro);
        });
}

export function listarMensagens(req, res) {
    let { fkSala } = req.params;

    model.listarMensagens(fkSala)
        .then((mensagens) => {
            res.status(200).send(mensagens);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar Mensagens: " + erro);
        });
}

