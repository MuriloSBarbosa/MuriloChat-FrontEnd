import React, { useState, useEffect } from "react";
import styles from "./Perfil.module.css";
import InfoUsuario from "../components/Perfil/InfoUsuario";
import { useNavigate } from "react-router-dom";
import voltar from "../assets/voltar.png"
import Wallpaper from "../components/Perfil/Wallpaper";
import axiosInstance from "../config/ipConfig";
import defaultWallpaper from "../assets/wallpaper-default.jpg";

const Perfil = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [conteudo, setConteudo] = useState(null);
    const [selecionado, setSelecionado] = useState(0);

    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/");
        }

        axiosInstance.get('/usuario/config/')
            .then(async (response) => {
                const usuarioCarregado = response.data;

                let { perfilSrc, wallpaperSrc } = usuarioCarregado;

                if (perfilSrc) {
                    await axiosInstance.get(`usuario/imagem/${encodeURI(perfilSrc)}`, { responseType: 'blob' })
                        .then(res => {
                            usuarioCarregado.perfilSrc = res.data;
                        })
                }
                if (wallpaperSrc) {
                    await axiosInstance.get(`usuario/wallpaper`, { responseType: 'blob' })
                        .then(res => {
                            usuarioCarregado.wallpaperSrc = res.data;
                        })
                }

                setUsuario(usuarioCarregado);

            }).catch((error) => {
                console.log(error);
            });

    }, []);

    useEffect(() => {
        if (!usuario) return;
        console.log(usuario);
        setConteudo(<InfoUsuario usuario={usuario} />);
    }, [usuario]);

    return (
        <div className={styles.perfil}>
            <div className={styles.menu}>
                <h1>Configurações</h1>
                <button className={styles.voltarImg} onClick={() => navigate(-1)}>
                    <img src={voltar} alt="voltar" />
                </button>
                <div className={styles.menuList}>
                    <div className={`${styles.menuItem} ${selecionado === 0 && styles.selecionado}`}
                        onClick={() => {
                            setConteudo(<InfoUsuario usuario={usuario} />);
                            setSelecionado(0)
                        }}>
                        Informações do Usuário
                    </div>
                    <div className={`${styles.menuItem} ${selecionado === 1 && styles.selecionado}`}
                        onClick={() => {
                            setConteudo(<Wallpaper usuario={usuario} />);
                            setSelecionado(1)
                        }}>
                        Papel de Parede
                    </div>
                </div>

            </div>
            <div className={styles.conteudo}>
                {conteudo}
            </div>
        </div>
    )
}

export default Perfil;