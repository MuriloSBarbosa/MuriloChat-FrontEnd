import * as service from "../services/usuarioService.mjs"
import { gerarTokenUsuario } from "../config/jwtConfig.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

const moduleURL = new URL(import.meta.url);
const modulePath = dirname(fileURLToPath(moduleURL));

export function cadastrarUsuario(req, res) {
    let { nome, senha } = req.body;
    let { filename: perfilSrc } = req?.file || {};

    service.cadastrarUsuario(nome, senha, perfilSrc)
        .then(() => {
            res.status(201).send("Usuário cadastrado com sucesso!");
        }).catch((erro) => {
            res.status(500).send("Erro ao cadastrar Usuário: " + erro);
        });
}

export function verificarUsuario(req, res) {
    let { login, senha } = req.body;

    service.verificarUsuario(login, senha)
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

    service.verificarNome(nome)
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

    const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'perfil', decodeURI(nomeImagem));

    return res.sendFile(caminho, { headers: { 'Content-Type': 'image/jpeg' } });
}

export function alterarNome(req, res) {
    const { id } = req.usuario;
    const { nome } = req.body;

    if (!nome) {
        res.status(404).send("Nome não foi informado");
        return;
    }

    service.alterarNome(id, nome)
        .then(() => {
            service.atualizarToken(id)
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

    service.verificarSenha(id, senha)
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

    service.alterarSenha(id, senha)
        .then(() => {
            service.atualizarToken(id)
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

    service.alterarImagem(id, newPerfilSrc)
        .then(() => {
            if (perfilSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'perfil', perfilSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            service.atualizarToken(id)
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
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}

export function removerImagem(req, res) {
    const { id, perfilSrc } = req.usuario;

    service.alterarImagem(id, null)
        .then(() => {
            if (perfilSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'perfil', perfilSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            service.atualizarToken(id)
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
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}

export function buscarWallpaper(req, res) {
    const { wallpaperSrc } = req.usuario;


    if (!wallpaperSrc) {
        res.status(204).send();
        return;
    }

    const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'wallpaper', decodeURI(wallpaperSrc));


    // adicionar luminosidade ao caminho
    return res.sendFile(caminho, { headers: { 'Content-Type': 'image/jpeg' } });

}

export function alterarWallpaper(req, res) {
    const { id, wallpaperSrc } = req.usuario;
    const { filename: newWallpaperSrc } = req.file;

    if (!newWallpaperSrc) {
        res.status(404).send("Imagem não foi informada");
        return;
    }

    service.alterarWallpaper(id, newWallpaperSrc)
        .then(() => {
            if (wallpaperSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'wallpaper', wallpaperSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            service.atualizarToken(id)
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
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}

export function removerWallpaper(req, res) {
    const { id, wallpaperSrc } = req.usuario;

    service.removerWallpaper(id)
        .then(() => {
            if (wallpaperSrc) {
                // Remover imagem antiga
                const caminho = path.join(modulePath, '..', '..', 'public', 'uploads', 'wallpaper', wallpaperSrc);

                fs.unlink(caminho, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                })
            }

            service.atualizarToken(id)
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
            res.status(500).send("Erro ao alterar imagem: " + erro);
        });
}

export function alterarLuminosidade(req, res) {
    const { id } = req.usuario;
    const { luminosidade } = req.body;

    if (!luminosidade) {
        res.status(404).send("Luminosidade não foi informada");
        return;
    }

    service.alterarLuminosidade(id, luminosidade)
        .then(() => {
            service.atualizarToken(id)
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
            res.status(500).send("Erro ao alterar luminosidade: " + erro);
        });
}