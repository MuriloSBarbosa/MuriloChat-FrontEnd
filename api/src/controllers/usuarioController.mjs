import * as model from "../models/usuarioModel.mjs"
import { gerarTokenUsuario, decodificarToken } from "../config/jwtConfig.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

const moduleURL = new URL(import.meta.url);
const modulePath = dirname(fileURLToPath(moduleURL));

export function cadastrarUsuario(req, res) {
    let { nome, senha } = req.body;
    let { filename: perfilSrc } = req.file;

    model.cadastrarUsuario(nome, senha, perfilSrc)
        .then(() => {
            res.status(201).send("Usuário cadastrado com sucesso!");
        }).catch((erro) => {
            res.status(500).send("Erro ao cadastrar Usuário: " + erro);
        });
}

export function verificarUsuario(req, res) {
    let { login, senha } = req.body;

    model.verificarUsuario(login, senha)
        .then((usuario) => {
            if (usuario == 0) {
                res.status(204).send("Usuário não encontrado!");
            } else if (usuario > 1) {
                res.status(500).send("Erro ao verificar Usuário!");
            } else {
                usuario = usuario[0];
                const token = gerarTokenUsuario(usuario);
                res.status(200).send(token);
            }
        }).catch((erro) => {
            res.status(500).send("Erro ao verificar Usuário: " + erro);
        });
}

export function verificarNome(req, res) {
    let { nome } = req.params;
    nome = decodeURIComponent(nome);

    if (!nome) {
        res.status(404).send("Nome não foi informado");
        return;
    }

    model.verificarNome(nome)
        .then((usuario) => {
            [usuario] = usuario;
            if (!usuario) {
                return res.status(204).send();
            } else {
                return res.status(200).json(usuario);
            }
        }).catch((erro) => {
            return res.status(500).send("Erro ao verificar Usuário: " + erro);
        });
}

export function buscarImagem(req, res) {
    const nomeImagem = req.params.nomeImagem;

    const caminho = path.join(modulePath, '..', '..', 'public', 'perfil', decodeURI(nomeImagem));

    return res.sendFile(caminho, { headers: { 'Content-Type': 'image/jpeg' } });
}


export function alterarNome(req, res) {
    const { id } = req.usuario;
    const { nome } = req.body;

    if (!nome) {
        res.status(404).send("Nome não foi informado");
        return;
    }

    model.alterarNome(id, nome)
        .then(() => {
            model.atualizarToken(id)
                .then((usuario) => {
                    if (usuario == 0) {
                        res.status(204).send("Usuário não encontrado!");
                    } else if (usuario > 1) {
                        res.status(500).send("Erro ao verificar Usuário!");
                    } else {
                        usuario = usuario[0];
                        const token = gerarTokenUsuario(usuario);
                        res.status(200).send(token);
                    }
                }).catch((erro) => {
                    res.status(500).send("Erro ao verificar Usuário: " + erro);
                });
        }).catch((erro) => {
            res.status(500).send("Erro ao alterar nome: " + erro);
        });
}

export function verificarSenha(req, res) {
    const { id } = req.usuario;
    const { senha } = req.params;

    if (!senha) {
        res.status(404).send("Senha não foi informada");
        return;
    }

    model.verificarSenha(id, senha)
        .then((usuario) => {
            if (usuario.length == 0) {
                res.status(204).send(false);
            } else {
                res.status(200).send(true);
            }
        }).catch((erro) => {
            res.status(500).send("Erro ao verificar Usuário: " + erro);
        });
}

export function alterarSenha(req, res) {
    const { id } = req.usuario;
    const { senha } = req.body;

    if (!senha) {
        res.status(404).send("Senha não foi informada");
        return;
    }

    model.alterarSenha(id, senha)
        .then(() => {
            model.atualizarToken(id)
                .then((usuario) => {
                    if (usuario == 0) {
                        res.status(204).send("Usuário não encontrado!");
                    } else if (usuario > 1) {
                        res.status(500).send("Erro ao verificar Usuário!");
                    } else {
                        usuario = usuario[0];
                        const token = gerarTokenUsuario(usuario);
                        res.status(200).send(token);
                    }
                }).catch((erro) => {
                    res.status(500).send("Erro ao verificar Usuário: " + erro);
                });
        }).catch((erro) => {
            res.status(500).send("Erro ao alterar senha: " + erro);
        });
}

export function alterarImagem(req, res) {
    const { id, perfilSrc } = req.usuario;
    const { filename: newPerfilSrc } = req.file;

    if (!newPerfilSrc) {
        res.status(404).send("Imagem não foi informada");
        return;
    }

    model.alterarImagem(id, newPerfilSrc)
        .then(() => {
            if (perfilSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'perfil', perfilSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            model.atualizarToken(id)
                .then((usuario) => {
                    if (usuario == 0) {
                        res.status(204).send("Usuário não encontrado!");
                    } else if (usuario > 1) {
                        res.status(500).send("Erro ao verificar Usuário!");
                    } else {
                        usuario = usuario[0];
                        const token = gerarTokenUsuario(usuario);
                        res.status(200).send(token);
                    }
                }).catch((erro) => {
                    res.status(500).send("Erro ao verificar Usuário: " + erro);
                });
        }).catch((erro) => {
            console.log(erro);
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}

export function removerImagem(req, res) {
    const { id, perfilSrc } = req.usuario;

    model.alterarImagem(id, null)
        .then(() => {
            if (perfilSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'perfil', perfilSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            model.atualizarToken(id)
                .then((usuario) => {
                    if (usuario == 0) {
                        res.status(204).send("Usuário não encontrado!");
                    } else if (usuario > 1) {
                        res.status(500).send("Erro ao verificar Usuário!");
                    } else {
                        usuario = usuario[0];
                        const token = gerarTokenUsuario(usuario);
                        res.status(200).send(token);
                    }
                }).catch((erro) => {
                    res.status(500).send("Erro ao verificar Usuário: " + erro);
                });
        }).catch((erro) => {
            console.log(erro);
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}