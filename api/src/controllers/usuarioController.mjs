import * as model from "../models/usuarioModel.mjs"
import { gerarTokenUsuario } from "../config/jwtConfig.mjs";

export function cadastrarUsuario(req, res) {
    let { nome, login, senha } = req.body;

    model.cadastrarUsuario(nome, login, senha)
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
    let nomeHash = req.params.nome;
    nomeHash = decodeURIComponent(nomeHash);

    if (!nomeHash) {
        res.status(404).send("Nome não foi informado");
        return;
    }

    let [nome, id] = nomeHash.split(" ");
    id = Number(id.replaceAll("#", ""));

    if (!nome || !id) {
        res.status(204).send("Nome inválido!");
        return;
    }

    model.verificarNome(id, nome)
        .then((usuario) => {
            if (usuario == 0) {
                res.status(204).send(false);
            } else if (usuario > 1) {
                res.status(500).send(false);
            } else {
                res.status(200).send(true);
            }
        }).catch((erro) => {
            res.status(500).send("Erro ao verificar Usuário: " + erro);
        });
}
