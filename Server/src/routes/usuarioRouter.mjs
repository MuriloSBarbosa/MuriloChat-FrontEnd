import express from "express";
import * as controller from "../controllers/usuarioController.mjs";
import { upload } from "../utils/multerConfig.mjs";
import { autenticarTokenUsuario } from "../config/jwtConfig.mjs";

const userRouter = express.Router()

userRouter.post("/", upload.single("perfilImage"), (req, res) => {
    controller.cadastrarUsuario(req, res);
});

userRouter.post("/login", (req, res) => {
    controller.verificarUsuario(req, res);
});

userRouter.get("/verificar/:nome", (req, res) => {
    controller.verificarNome(req, res);
});

userRouter.get("/imagem/:nomeImagem", (req, res) => {
    controller.buscarImagem(req, res);
})

userRouter.get("/config", autenticarTokenUsuario, (req, res) => {
    res.json(req.usuario);
})

userRouter.patch("/nome", autenticarTokenUsuario, (req, res) => {
    controller.alterarNome(req, res);
})

userRouter.get("/verificarSenha/:senha", autenticarTokenUsuario, (req, res) => {
    controller.verificarSenha(req, res);
})

userRouter.patch("/senha", autenticarTokenUsuario, (req, res) => {
    controller.alterarSenha(req, res);
})

userRouter.patch("/imagem", autenticarTokenUsuario, upload.single("perfilImage"), (req, res) => {
    controller.alterarImagem(req, res);
})

userRouter.patch("/imagem/remover", autenticarTokenUsuario, (req, res) => {
    controller.removerImagem(req, res);
})

userRouter.get("/wallpaper", autenticarTokenUsuario, (req, res) => {
    const wallpaper = req.usuario.wallpaperSrc;
    const luminosidade = req.usuario.wallpaperLuminosidade;
    res.send({ wallpaper, luminosidade });
})

userRouter.get("/wallpaper/:wallpaperSrc", (req, res) => {
    controller.buscarWallpaper(req, res);
})

userRouter.patch("/wallpaper", autenticarTokenUsuario, upload.single("wallpaperImage"), (req, res) => {
    controller.alterarWallpaper(req, res);
})

userRouter.patch("/wallpaper/remover", autenticarTokenUsuario, (req, res) => {
    controller.removerWallpaper(req, res);
})

userRouter.patch("/wallpaper/luminosidade", autenticarTokenUsuario, (req, res) => {
    controller.alterarLuminosidade(req, res);
})

export default userRouter;  