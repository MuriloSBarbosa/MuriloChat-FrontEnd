import React, { useState } from "react";
import styles from "./Perfil.module.css";
import InfoUsuario from "../components/Perfil/InfoUsuario";

const Perfil = () => {
    const [conteudo, setConteudo] = useState(<InfoUsuario />);
    const [selecionado, setSelecionado] = useState(0);


    return (
        <div className={styles.perfil}>
            <div className={styles.menu}>
                <h1>Configurações</h1>
                <button className={`${styles.menuItem} ${selecionado === 0 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(0) }}>Informações do Usuário</button>
                <button className={`${styles.menuItem} ${selecionado === 1 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(1) }}>Papel de Parede</button>
                <button className={`${styles.menuItem} ${selecionado === 2 && styles.selecionado}`} onClick={() => { setConteudo(<InfoUsuario />); setSelecionado(2) }}>Tema</button>
            </div>
            <div className={styles.conteudo}>
                {conteudo}
            </div>
        </div>
    )
}

export default Perfil;