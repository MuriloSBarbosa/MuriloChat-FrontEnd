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
    let { nome } = req.params;
    nome = decodeURIComponent(nome);

    if (!nome) {
        res.status(404).send("Nome não foi informado");
        return;
    }

    model.verificarNome(nome)
        .then((usuario) => {
            [usuario] = usuario;
            console.log(usuario);
            if (!usuario) {
                console.log("Não existe");
                return res.status(204).send();
            } else {
                console.log("Existe");
                return res.status(200).json(usuario.id);
            }
        }).catch((erro) => {
            return res.status(500).send("Erro ao verificar Usuário: " + erro);
        });
}
