import React, { useState, useEffect } from "react";
import styles from "./Perfil.module.css";
import InfoUsuario from "../components/Perfil/InfoUsuario";
import { useNavigate } from "react-router-dom";
import voltar from "../assets/voltar.png"
import Deslogar from "../components/Deslogar";

const Perfil = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [conteudo, setConteudo] = useState(<InfoUsuario />);
    const [selecionado, setSelecionado] = useState(0);

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, []);

    return (
        <div className={styles.perfil}>
            <div className={styles.menu}>
                <h1>Configurações</h1>
                <button className={styles.voltarImg} onClick={() => navigate(-1)}>
                    <img src={voltar} alt="voltar" />
                </button>
                <Deslogar styles={styles} />
                <div className={styles.menuList}>
                    <div className={`${styles.menuItem} ${selecionado === 0 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(0) }}>Informações do Usuário</div>
                    <div className={`${styles.menuItem} ${selecionado === 1 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(1) }}>Papel de Parede</div>
                    <div className={`${styles.menuItem} ${selecionado === 2 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(2) }}>Tema</div>
                </div>

            </div>
            <div className={styles.conteudo}>
                {conteudo}
            </div>
        </div>
    )
}

export default Perfil;