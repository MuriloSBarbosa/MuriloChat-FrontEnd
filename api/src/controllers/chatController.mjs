import * as model from "../models/chatModel.mjs"
import { servidorIo } from "../../app.mjs";

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


export function listarChats(req, res) {
    let { id } = req.usuario;

    model.listarChats(id)
        .then((chats) => {
            res.status(200).send(chats);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar Chats: " + erro);
        });
}

export function listarMensagens(req, res) {
    let { fkSala } = req.params;
    let { id } = req.usuario;

    model.listarMensagens(fkSala)
        .then((mensagens) => {
            mensagens.map((mensagem) => {
                if (mensagem.fkUsuario == id) {
                    mensagem.isRemetente = true;
                }
                mensagem.idColor = mensagem.fkUsuario;
                delete mensagem.fkUsuario;
            });
            res.status(200).send(mensagens);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar Mensagens: " + erro);
        });
}

export function verUsuariosDaSala(req, res) {
    let { idSala } = req.params;

    model.verUsuariosDaSala(idSala)
        .then((usuarios) => {
            res.status(200).send(usuarios);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar usuários da Sala: " + erro);
        });
}


export function inserirMensagemImagem(req, res) {
    let { fkSala } = req.params;
    let { id, nome } = req.usuario;
    let token = req.headers.authorization.split(" ")[1];
    let { path } = req.file;
    let { room, dtMensagem } = req.body;

    console.log("Path: " + path);
    console.log("Room: " + room);
    console.log("dtMensagem: " + dtMensagem);


    const mensagem = {
        id,
        nome,
        path,
        token,
        dtMensagem
    }

    servidorIo.to(room).emit('novaMensagem', mensagem);

    res.send("ok");
}