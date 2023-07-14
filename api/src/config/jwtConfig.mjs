import jwt from 'jsonwebtoken';

export function gerarTokenUsuario(usuario) {
    const payload = {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        perfilSrc: usuario.perfilSrc,
        wallpaperSrc: usuario.wallpaperSrc,
        wallpaperLuminosidade: usuario.wallpaperLuminosidade
    };

    const token = jwt.sign(payload, "tokenUserChatMurilo", { expiresIn: '1d' });

    return token;
}

export function autenticarTokenUsuario(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).send("Token não fornecido")
    }

    jwt.verify(token, "tokenUserChatMurilo", (err, decoded) => {

        if (err) {
            return res.status(403).send("Token inválido")
        }

        req.usuario = decoded;
    })

    next();
}

export function decodificarToken(token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            console.log("Token não fornecido");
            reject("Token não fornecido");
        }

        jwt.verify(token, "tokenUserChatMurilo", (err, decoded) => {
            if (err) {
                console.log("Token inválido");
                reject("Token inválido");
            }

            resolve(decoded);
        });
    });
}
