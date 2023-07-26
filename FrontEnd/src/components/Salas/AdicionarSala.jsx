import React, { useState } from "react";
import axiosInstance from "../../config/ipConfig";
import styles from "./AdicionarSala.module.css";
import { v4 as uuidv4 } from 'uuid';

function AdicionarSala(props) {
    const [nome, setNome] = useState("");
    const [isSalaCriada, setIsSalaCriada] = useState(false);

    function criarSala(e) {
        e.preventDefault();

        const uuid = encodeURI(uuidv4());

        axiosInstance.post("/chat/sala",
            {
                nome: nome,
                identificador: uuid,
            })
            .then((res) => {
                setIsSalaCriada(true);

                const sala = {
                    id: res.data.idSala,
                    identificador: uuid,
                    nome: nome,
                    selecionada: true
                }

                props.setSalaAdd(sala);
                setTimeout(() => {
                    props.setShowAddSala(false);
                }, 1000);

            })
            .catch((err) => {
                console.log(err);
            });
    }

    const fechar = (e) => {
        if (e.target.classList.contains(styles.adicionarSala)) {
            props.setShowAddSala(false);
        }
    }



    return (
        <div className={styles.adicionarSala} onClick={(e) => fechar(e)}>
            <form className={styles.content} onSubmit={(e) => criarSala(e)}>
                <div className={styles.title}>Criar nova Sala</div>
                <div className={styles.box}>
                    <label>Nome</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
                    {isSalaCriada && <span className={styles.salaCriada}>Sala criada com sucesso!</span>}
                </div>
                <div className={styles.buttons}>
                    <button type="button" className={styles.cancelar} onClick={() => props.setShowAddSala(false)}>Cancelar</button>
                    <button type="submit">Adicionar</button>
                </div>
            </form>
        </div>
    )
}

export default AdicionarSala;