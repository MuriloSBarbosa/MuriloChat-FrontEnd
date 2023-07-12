import * as model from "../models/usuarioModel.mjs"
import { gerarTokenUsuario } from "../config/jwtConfig.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
    console.log(caminho);

    return res.sendFile(caminho, { headers: { 'Content-Type': 'image/jpeg' } });
}