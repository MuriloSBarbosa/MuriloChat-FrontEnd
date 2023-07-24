import Sala from "../models/Sala.mjs";
import Chat from "../models/Chat.mjs";
import Mensagem from "../models/Mensagem.mjs";
import Usuario from "../models/Usuario.mjs";
import '../models/associations.mjs';

export function cadastrarSala(nome, identificador) {
    return Sala.create({
        nome: nome,
        identificador: identificador
    });
}

export function verificarUsuarioNaSala(idSala, idUser) {
    return Chat.findAll({
        where: {
            fkSala: idSala,
            fkUsuario: idUser
        }
    })
}

export function inserirUser(fkSala, fkUsuario) {
    return Chat.create({
        fkSala: fkSala,
        fkUsuario: fkUsuario
    });
}

export function inserirMensagem(idUsuario, idSala, mensagem, dtAgora, isAddUser) {
    return Mensagem.create({
        fkUsuario: idUsuario,
        fkSala: idSala,
        texto: mensagem,
        dtMensagem: dtAgora,
        isAddUser: isAddUser
    });
}

export function inserirMensagemImagem(idUsuario, idSala, srcImage, dtAgora) {
    return Mensagem.create({
        fkUsuario: idUsuario,
        fkSala: idSala,
        dtMensagem: dtAgora,
        srcImage: srcImage
    });
}

export function listarChats(fkUsuario) {
    return Sala.findAll({
        include: [
            {
                model: Chat,
                attributes: ['fkUsuario', 'fkSala'],
                where: { fkUsuario: fkUsuario },
            }
        ],
    });

}

export function listarMensagens(fkSala) {
    return Mensagem.findAll({
        attributes: ['texto', 'dtMensagem', 'fkUsuario', 'srcImage', 'isAddUser'],
        include: [
            {
                model: Usuario,
                attributes: ['nome', 'perfilSrc']
            }
        ],
        where: {
            fkSala: fkSala
        },
        order: [
            ['id', 'ASC']
        ],
        raw: true
    })
}

export function verUsuariosDaSala(idSala) {
    return Usuario.findAll({
        attributes: ['id', 'nome'],
        include: [
            {
                model: Chat,
                attributes: ['fkSala'],
                where: {
                    fkSala: idSala
                }
            }
        ]
    })
}

