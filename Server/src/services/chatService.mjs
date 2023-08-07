import Sala from "../models/Sala.mjs";
import Chat from "../models/Chat.mjs";
import Mensagem from "../models/Mensagem.mjs";
import Usuario from "../models/Usuario.mjs";
import '../models/associations.mjs';
import { Op } from 'sequelize';


export function cadastrarSala(nome, identificador) {
    return Sala.create({
        nome: nome,
        identificador: identificador
    });
}

export async function sairDaSala(idSala, idUser) {
    try {
        await Chat.update({
            isOut: true,
        }, {
            where: {
                fkSala: idSala,
                fkUsuario: idUser
            }
        });

        const chat = await Chat.findOne({
            where: {
                fkSala: idSala,
                fkUsuario: {
                    [Op.ne]: null
                },
                isOut: false
            }
        });

        if (!chat) {
            await Sala.destroy({
                where: {
                    id: idSala
                }
            });
        }
    } catch (error) {
        console.error("Erro ao sair da sala: ", error);
        throw error;
    }
}

export async function removerUsuarioSala(idSala, idUser) {
    Chat.update({
        isOut: true,

    }, {
        where: {
            fkSala: idSala,
            fkUsuario: idUser
        }
    });

}

export function atualizarUsuarioSala(idSala, idUser, isAdmin) {
    return Chat.update({
        isAdmin: isAdmin,

    }, {
        where: {
            fkSala: idSala,
            fkUsuario: idUser
        }
    })
}

export function verificarUsuarioNaSala(idSala, idUser) {
    return Chat.findAll({
        where: {
            fkSala: idSala,
            fkUsuario: idUser
        }
    })
}

export function inserirUser(fkSala, fkUsuario, isAdmin) {
    return Chat.create({
        fkSala: fkSala,
        fkUsuario: fkUsuario,
        isAdmin: isAdmin
    });
}

export function realocarUser(idSala, idUser) {
    return Chat.update({
        isOut: false
    }, {
        where: {
            fkUsuario: idUser,
            fkSala: idSala
        }
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

export function inserirMensagemDoc(idUsuario, idSala, srcDoc, nomeDoc, typeDoc, sizeDoc, dtAgora) {
    return Mensagem.create({
        fkUsuario: idUsuario,
        fkSala: idSala,
        dtMensagem: dtAgora,
        srcDoc: srcDoc,
        nomeDoc: nomeDoc,
        typeDoc: typeDoc,
        sizeDoc: sizeDoc
    });
}

export function listarChats(fkUsuario) {
    return Sala.findAll({
        include: [
            {
                model: Chat,
                attributes: ['fkUsuario', 'fkSala'],
                where: {
                    fkUsuario: fkUsuario,
                    isOut: false
                },
            }
        ],
    });

}

export function listarMensagens(fkSala, limit, skip) {
    return Mensagem.findAll({
        attributes: ['texto', 'dtMensagem', 'fkUsuario', 'srcImage', 'srcDoc', 'nomeDoc', 'typeDoc', 'sizeDoc', 'isAddUser'],
        include: [
            {
                model: Usuario,
                attributes: ['id', 'nome', 'perfilSrc']
            }
        ],
        where: {
            fkSala: fkSala
        },
        order: [
            ['dtMensagem', 'DESC']
        ],
        limit: limit,
        offset: skip,
        raw: true
    })
}


export function verUsuariosDaSala(idSala) {
    return Usuario.findAll({
        attributes: ['id', 'nome', 'perfilSrc'],
        include: [
            {
                model: Chat,
                attributes: ['isAdmin', 'isOut'],
                where: {
                    fkSala: idSala
                }
            },
        ],
        order: [
            ['nome', 'ASC']
        ],
        raw: true
    })
}

