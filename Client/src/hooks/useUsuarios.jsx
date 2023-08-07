import React, { useEffect, useState } from 'react'
import axiosInstance from '../config/ipConfig';

const useUsuarios = (idSala) => {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        carregarUsuarios();
    }, [idSala]);

    const carregarUsuarios = (a) => {
        axiosInstance.get("/chat/usuario/" + idSala)
            .then(async (res) => {
                const usuarios = res.data.usuarios;
                setIsAdmin(res.data.isAdmin);

                let colorUsed = []

                const updatedUsuarios = await Promise.all(usuarios.map(async (user) => {
                    if (colorUsed.length === 7) {
                        colorUsed = [];
                    }

                    user.perfilSrc = await carregarPerfilSrc(user.perfilSrc);

                    do {
                        user.color = ramdonColor();
                    } while (colorUsed.includes(user.color));

                    colorUsed.push(user.color);

                    return user;
                }));

                setIsLoadingUsuarios(false);
                setUsuarios(updatedUsuarios);


            }).catch((err) => {
                console.log(err);
            });
    }

    const carregarPerfilSrc = async (perfilSrc) => {

        if (!perfilSrc) return defaultAvatar;

        return axiosInstance.get(`/usuario/imagem/${encodeURI(perfilSrc)}`, {
            responseType: 'blob'
        })
            .then((response) => {
                const file = new Blob([response.data], { type: response.data.type });
                const fileURL = URL.createObjectURL(file);
                return fileURL;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const ramdonColor = () => {
        const colors = ["#ff5e00", "#1FD11F", "#0000ff", "#ff00d4", "#FF2D61", "#00a2ff", "#c30000"];
        const indexSorteado = Math.floor(Math.random() * colors.length);
        const corSorteada = colors[indexSorteado];

        return corSorteada;
    }

    return {
        usuarios,
        isLoadingUsuarios,
        isAdmin,
        carregarUsuarios,
    }

}

export default useUsuarios