import React, { useState, useEffect } from "react";
import { deslogar } from "../../utils/geral.mjs";
import styles from "./SalasOption.module.css";
import { useNavigate } from "react-router-dom";
import tresPontos from '../../assets/tres-pontos.png';

const SalasOption = (props) => {
    const navigate = useNavigate();
    const [salaOptions, setSalaOptions] = useState(false);

    useEffect(() => {
        window.addEventListener("click", (e) => fecharMenuOptions(e));

        return () => {
            window.removeEventListener("click", fecharMenuOptions);
        }
    }, [])

    const fecharMenuOptions = (e) => {
        if (e.target.className !== styles.tresPontos) {
            setSalaOptions(false);
        }
    }

    return (
        <div className={`${props.style} ${styles.salaOptions}`}>
            <img src={tresPontos} alt="" onClick={() => setSalaOptions(!salaOptions)} className={styles.tresPontos} />
            <div className={`${styles.content} ${salaOptions ? styles.showOption : null} `}>
                <button onClick={() => props.setShowAddSala(true)}>
                    Adicionar Sala
                </button>
                <button onClick={() => navigate("/perfil")}>
                    Configurações
                </button>
                <button className={styles.deslogar} onClick={deslogar}>
                    Deslogar
                </button>
            </div>

        </div>
    )
}

export default SalasOption;