import Usuario from "../models/Usuario.mjs";

export function cadastrarUsuario(nome, senha, perfilSrc) {
    return Usuario.create({
        nome: nome,
        senha: senha,
        perfilSrc: perfilSrc
    });
}

export async function verificarUsuario(login, senha) {
    const usuario = await Usuario.findAll({
        where: {
            nome: login,
            senha: senha
        },
        raw: true
    })

    return usuario;
}

export function verificarNome(nome) {
    return Usuario.findAll({
        where: {
            nome: nome
        },
        raw: true
    })
}

export function alterarImagem(id, nome) {
    return Usuario.update({
        perfilSrc: nome
    }, {
        where: {
            id: id
        }
    });
}

export function alterarNome(id, nome) {
    return Usuario.update({
        nome: nome,
    }, {
        where: {
            id: id
        }
    })
}

export function verificarSenha(id, senha) {
    return Usuario.findAll({
        senha: senha
    }, {
        where: {
            id: id
        },
        raw: true
    })
}

export function alterarSenha(id, senha) {
    return Usuario.update({
        senha: senha
    }, {
        where: {
            id: id
        }
    })
}

export function atualizarToken(id) {
    return Usuario.findAll({
        where: {
            id: id
        },
        raw: true
    })
}

export function alterarWallpaper(id, nome) {
    return Usuario.update({
        wallpaperSrc: nome
    }, {
        where: {
            id: id
        }
    })
}

export function removerWallpaper(id) {
    return Usuario.update({
        wallpaperSrc: null,
        wallpaperLuminosidade: 100
    }, {
        where: {
            id: id
        }
    })
}

export function alterarLuminosidade(id, luminosidade) {
    return Usuario.update({
        wallpaperLuminosidade: luminosidade
    }, {
        where: {
            id: id
        }
    })
}