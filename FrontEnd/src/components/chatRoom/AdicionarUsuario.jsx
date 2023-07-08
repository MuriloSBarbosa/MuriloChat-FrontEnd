import React, { useState } from "react";
import axiosInstance from "../../config/ipConfig";
import styles from "./AdicionarUsuario.module.css"
import moment from "moment-timezone";

function AdicionarUsuario(props) {
    const [addUserNome, setAddUserNome] = useState('');
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [isMessageError, setIsMessageError] = useState(true);

    function verificarUser(e) {
        e.preventDefault();
        const regex = /[^a-zA-Z0-9\s]/g;

        if (addUserNome.match(regex)) {
            setMessage("⚠ Nome de usuário inválido");
            setShowMessage(true);
            return;
        }

        const nomeCodificado = encodeURIComponent(addUserNome);
        axiosInstance.get(`/usuario/verificar/${nomeCodificado}`)
            .then((res) => {
                if (res.data) {
                    const id = res.data.id;
                    const nome = res.data.nome;
                    addUser(id,nome);
                } else {
                    setMessage("⚠ Usuário não encontrado");
                    setShowMessage(true);
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    function addUser(idUser, nome) {
        axiosInstance.post("/chat/usuario",
            {
                idUser,
                nomeUser: nome,
                idSala: props.idSala,
                room: props.room,
                dtAdd: moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss")
            })
            .then((res) => {
                setMessage("Usuário adicionado com sucesso");
                setShowMessage(true);
                setIsMessageError(false);
                setTimeout(() => {
                    setMessage("");
                    setShowMessage(false);
                    props.carregarUsuarios();
                    props.setShowAddUser(false);
                }, 2000)
            })
            .catch((err) => {
                if (err.response.status === 409) {
                    setMessage("⚠ Usuário já está na sala");
                    setShowMessage(true);
                }
                console.log(err);
            });
    }

    const fecharModal = (e) => {
        if (e.target.contains(e.currentTarget)) {
            setMessage("");
            setShowMessage(false);
            props.setShowAddUser(false);
        }
    }

    return (
        <>
            {props.showAddUser &&
                <div className={styles.addUserBackground} onClick={(e) => fecharModal(e)}>
                    <form className={styles.addUser} onSubmit={(e) => verificarUser(e)}>
                        <label>Digite o nome do usuário</label>
                        <input type="text" placeholder="Ex: Murilo" value={addUserNome} onChange={(e) => setAddUserNome(e.target.value)} />
                        <p style={!isMessageError ? { color: "green" } : null}>{message}</p>
                        <button>Adicionar</button>
                    </form>
                </div>
            }
        </>

    )
}

export default AdicionarUsuario;