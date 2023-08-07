import * as service from "../services/chatService.mjs"
import { servidorIo } from "../../app.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment from "moment-timezone";

const moduleURL = new URL(import.meta.url);
const modulePath = dirname(fileURLToPath(moduleURL));


export async function criarSala(req, res) {
    let { identificador, nome } = req.body;
    let { id: idUsuario, nome: nomeUser } = req.usuario;
    let { tokenUsuario } = req.headers.authorization.split(" ")[1];
    identificador = decodeURI(identificador);

    try {
        const sala = await service.cadastrarSala(nome, identificador);
        await service.inserirUser(sala.id, idUsuario, true);

        const mensagem = {
            idSala: sala.id,
            "Usuario.id": idUsuario,
            room: identificador,
            texto: `${nomeUser} criou o chat`,
            tokenUsuario,
            isAddUser: true
        };

        const dtAdd = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

        servidorIo.to(identificador).emit('addUser');
        servidorIo.to(identificador).emit('novaMensagem', mensagem);

        await service.inserirMensagem(idUsuario, sala.id, mensagem.texto, dtAdd, true);

        res.status(201).json({ idSala: sala.id, identificador });
    } catch (erro) {
        res.status(500).send("Erro ao cadastrar Chat: " + erro);
    }
}

export async function sairDaSala(req, res) {
    const { idSala, room } = req.body;
    const { id, nome } = req.usuario;
    const { tokenUsuario } = req.headers.authorization.split(" ")[1];


    try {

        const mensagem = {
            idSala,
            "Usuario.id": id,
            room,
            texto: `${nome} saiu do chat`,
            tokenUsuario,
            isAddUser: true
        };

        const dtMsg = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

        servidorIo.to(room).emit('novaMensagem', mensagem);
        servidorIo.emit('atualizarSalas', idSala);
        servidorIo.to(room).emit('addUser');

        await service.inserirMensagem(id, idSala, mensagem.texto, dtMsg, true);
        await service.sairDaSala(idSala, id);

        res.status(200).send("Saiu da sala com sucesso!");
    }
    catch (erro) {
        res.status(500).send("Erro ao sair da sala: " + erro);
    };
}


export async function inserirUser(req, res) {
    try {
        const { idSala, idUser, room, nomeUser, dtAdd } = req.body;
        const { tokenUsuario } = req.headers.authorization.split(" ")[1];
        const { id, nome } = req.usuario;

        const usuario = await service.verificarUsuarioNaSala(idSala, idUser);

        if (usuario.length > 0) {
            await service.realocarUser(idSala, idUser);
        } else {
            await service.inserirUser(idSala, idUser);
        }


        const mensagem = {
            idSala,
            "Usuario.id": id,
            room,
            texto: `${nome} adicionou ${nomeUser} ao chat`,
            tokenUsuario,
            isAddUser: true
        };

        servidorIo.to(room).emit('addUser');
        servidorIo.to(room).emit('novaMensagem', mensagem);
        servidorIo.emit('atualizarSalas', idSala);

        await service.inserirMensagem(idUser, idSala, mensagem.texto, dtAdd, true);

        return res.status(201).send("Chat cadastrado com sucesso!");
    } catch (erro) {
        return res.status(500).send("Erro ao cadastrar Chat: " + erro);
    }
}

export async function removerUsuario(req, res) {
    const { idSala, idUsuario, room, nomeUsuario } = req.body;
    const { id: idResponsavel, nome } = req.usuario;


    try {
        await service.removerUsuarioSala(idSala, idUsuario);

        const tokenUsuario = req.headers.authorization.split(" ")[1];
        const dtMensagem = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

        const mensagem = {
            idSala,
            "Usuario.id": idResponsavel,
            room,
            texto: `${nome} removeu ${nomeUsuario} do chat`,
            tokenUsuario,
            isAddUser: true
        };

        servidorIo.to(room).emit('addUser');
        servidorIo.to(room).emit('novaMensagem', mensagem);
        servidorIo.emit('atualizarSalas', { idSala, idUsuario });

        await service.inserirMensagem(idResponsavel, idSala, mensagem.texto, dtMensagem, true);

        res.status(200).send("Saiu da sala com sucesso!");
    }
    catch (erro) {
        res.status(500).send("Erro ao sair da sala: " + erro);
    };
}

export async function atualizarUsuario(req, res) {
    const { idSala, idUsuario, nomeUsuario, isAdmin, room } = req.body;
    const { id: idResponsavel, nome } = req.usuario;

    if (idSala == undefined || idUsuario == undefined || isAdmin == undefined) {
        return res.status(400).send("Dados inválidos");
    }

    try {

        await service.atualizarUsuarioSala(idSala, idUsuario, isAdmin);

        const tokenUsuario = req.headers.authorization.split(" ")[1];
        const dtMensagem = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

        const texto = isAdmin ? `${nome} promoveu ${nomeUsuario} como Administrador` : `${nome} removeu ${nomeUsuario} como Administrador`;

        const mensagem = {
            idSala,
            "Usuario.id": idResponsavel,
            room,
            texto,
            tokenUsuario,
            isAddUser: true
        };

        servidorIo.to(room).emit('novaMensagem', mensagem);
        servidorIo.to(room).emit('addUser');

        await service.inserirMensagem(idResponsavel, idSala, mensagem.texto, dtMensagem, true);

        res.status(200).send("Usuário atualizado com sucesso!");
    }

    catch (erro) {
        res.status(500).send("Erro ao atualizar usuário: " + erro);
    };
}

export function listarChats(req, res) {
    let { id } = req.usuario;

    service.listarChats(id)
        .then((chats) => {
            res.status(200).send(chats);
        }).catch((erro) => {
            res.status(500).send("Erro ao listar Chats: " + erro);
        });
}

export function listarMensagens(req, res) {
    let { fkSala } = req.params;
    let { id } = req.usuario;

    if (!fkSala) {
        return res.status(400).send("Dados inválidos");
    }

    const limit = Number(req.query.limit) || 100;
    const skip = Number(req.query.skip) || 0;

    service.listarMensagens(fkSala, limit, skip)
        .then((mensagens) => {
            const mensagemFormatada = mensagens.map((mensagem) => {
                if (mensagem.fkUsuario == id) {
                    mensagem.isRemetente = true;
                }
                mensagem.idColor = mensagem.fkUsuario;
                delete mensagem.fkUsuario;

                const { 'Usuario.nome': nome, 'Usuario.perfilSrc': perfilSrc, ...outrosCampos } = mensagem;
                delete mensagem['Usuario.nome'];
                delete mensagem['Usuario.perfilSrc'];

                return { nome, perfilSrc, ...outrosCampos };

            });
            res.status(200).send(mensagemFormatada);

        }).catch((erro) => {
            res.status(500).send("Erro ao listar Mensagens: " + erro);
        });
}

export function verUsuariosDaSala(req, res) {
    let { idSala } = req.params;
    const { id: idUsuario } = req.usuario;

    service.verUsuariosDaSala(idSala)
        .then((usuarios) => {
            const admin = usuarios.find((usuario) => usuario.id == idUsuario && usuario["Chats.isAdmin"] == true);

            const isAdmin = admin ? true : false;

            usuarios.forEach((usuario) => {
                if (usuario.id == idUsuario) {
                    usuario.isRemetente = true;
                }
            });

            res.status(200).send({ usuarios, isAdmin });
        }).catch((erro) => {
            res.status(500).send("Erro ao listar usuários da Sala: " + erro);
        });
}

export function inserirMensagemImagem(req, res) {
    const { fkSala } = req.params;
    const { id, nome } = req.usuario;
    const token = req.headers.authorization.split(" ")[1];
    const { filename } = req.file;
    const { room, dtMensagem } = req.body;

    if (!filename || !room || !dtMensagem) {
        return res.status(400).send("Dados inválidos");
    }
    const srcImage = encodeURI(filename);

    const mensagem = {
        idSala: fkSala,
        "Usuario.id": id,
        nome,
        srcImage,
        token,
        dtMensagem
    }

    servidorIo.to(decodeURI(room)).emit('novaMensagem', mensagem);

    service.inserirMensagemImagem(id, fkSala, srcImage, dtMensagem)
        .then(() => {
            res.status(201).send("Mensagem cadastrada com sucesso!");
        }).catch((erro) => {
            res.status(500).send("Erro ao cadastrar Mensagem: " + erro);
        });

}

export function buscarImagem(req, res) {

    const nomeImagem = req.params.nomeImagem;

    const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'images', decodeURI(nomeImagem));

    return res.sendFile(caminho, { headers: { 'Content-Type': 'image/jpeg' } });
}

export function inserirMensagemDoc(req, res) {
    const { fkSala } = req.params;
    const { id, nome } = req.usuario;
    const token = req.headers.authorization.split(" ")[1];
    const { filename } = req.file;
    const { room, dtMensagem, nomeDoc, typeDoc, sizeDoc } = req.body;

    if (!filename || !room || !dtMensagem) {
        return res.status(400).send("Dados inválidos");
    }

    const srcDoc = encodeURI(filename);

    const mensagem = {
        idSala: fkSala,
        "Usuario.id": id,
        nome,
        srcDoc,
        nomeDoc,
        typeDoc,
        sizeDoc,
        token,
        dtMensagem
    }

    try {

        servidorIo.to(room).emit('novaMensagem', mensagem);

        service.inserirMensagemDoc(id, fkSala, srcDoc, nomeDoc, typeDoc, sizeDoc, dtMensagem);

        res.status(201).send("Documento salvo com sucesso!");
    } catch (erro) {
        res.status(500).send("Erro ao cadastrar Mensagem: " + erro);
    }

}

export function buscarDocumento(req, res) {

    const nomeDoc = req.params.nomeDocumento;

    const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'documents', decodeURI(nomeDoc));

    // Para todos os tipos de arquivo, use: application/octet-stream
    // Para mais informações, acesse: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

    // definir o nome do arquivo do caminho
    return res.sendFile(caminho, { headers: { 'Content-Type': 'application/octet-stream' } });
}
