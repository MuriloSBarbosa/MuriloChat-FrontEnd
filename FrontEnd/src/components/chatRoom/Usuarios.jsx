import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/ipConfig";
import styles from "./Usuarios.module.css";
import { ipUse } from "../../config/ipConfig";
import defaultAvatar from "../../assets/default-avatar.jpg";
import { useNavigate } from "react-router-dom";
import coroa from "../../assets/coroa.png";
import Modal from "../Modal/Modal";

function Usuarios(props) {
    const { usuarios, socket, carregarUsuarios, idSala, setUsuarios, room } = props;
    const [idsUsuariosOnline, setIdsUsuariosOnline] = useState({});
    const navigate = useNavigate();

    const [modal, setModal] = useState({
        title: '',
        text: ''
    });
    const [time, setTime] = useState(1500);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        socket.on("onlineUsers", usuariosOnline);
        socket.on("addUser", () => carregarUsuarios());

        return () => {
            socket.off('onlineUsers');
        }
    }, [socket]);

    const usuariosOnline = (idUsuariosOnline) => {

        // Convert array to Set for faster lookup
        const idSockerOnlineSet = new Set(idUsuariosOnline);

        setIdsUsuariosOnline((idOnline) => {
            let idsOnline = { ...idOnline };

            // Set online users
            idSockerOnlineSet.forEach((userId) => {
                // no json, colocar [] é a mesma coisa que colocar ., mas pode ser usado quando o nome da propriedade tem espaço ou é um numero
                idsOnline[userId] = true;
            });

            // Set offline users
            for (let userId in idsOnline) {
                // Quando percorre um json com for in, o valor da variavel é a chave, ou seja, o atributo, que sempre é uma string
                if (!idSockerOnlineSet.has(parseInt(userId))) {
                    idsOnline[userId] = false;
                }
            }

            return idsOnline;
        });
    };

    const abrirOpcoesUser = (e) => {
        if (!props.isAdmin) return;

        const user = e.currentTarget;
        const userOptions = user.querySelector(`.${styles.userOptions}`);

        if (userOptions.classList.contains(styles.fadeInUser)) {
            userOptions.classList.remove(styles.fadeInUser);
            return;
        }

        const AllUserOptions = document.querySelectorAll(`.${styles.userOptions}`);
        AllUserOptions.forEach((userOptions) => {
            if (userOptions != e.currentTarget.querySelector(`.${styles.userOptions}`)) {
                userOptions.classList.remove(styles.fadeInUser);
            }
        });

        setTimeout(() => {
            userOptions.classList.add(styles.fadeInUser);
        }, 100);
    }

    const removerDaSala = (user) => {
        axiosInstance.delete(`/chat/usuario`, {
            data: {
                idSala: props.idSala,
                idUsuario: user.id,
                nomeUsuario: user.nome,
                room: props.room
            }
        })
            .then(() => {
                console.log(error);
            })
            .catch((error) => {
                setModal({
                    title: 'Erro',
                    text: 'Erro ao atualizar usuário'
                });
                setShowModal(true);
                console.log(error);
            });
    }

    const atualizarUsuario = (user, isAdmin) => {
        axiosInstance.patch("/chat/usuario", {
            idSala: idSala,
            idUsuario: user.id,
            nomeUsuario: user.nome,
            isAdmin,
            room: room
        })
            .then(() => {
                carregarUsuarios();
            })
            .catch((error) => {
                setModal({
                    title: 'Erro',
                    text: 'Erro ao atualizar usuário'
                });
                setShowModal(true);
                console.log(error);
            });
    }


    return (
        <>
            <div className={styles.usuarios}>
                <div className={styles.listaUser}>
                    {usuarios.map((user, index) => (
                        <div className={styles.userItem} key={index} onClick={(e) => abrirOpcoesUser(e)}>
                            <div className={styles.user}>
                                <div className={styles.userPerfil} style={{ backgroundColor: idsUsuariosOnline[user.id] ? "#00ff00" : "#e73f5d" }}>
                                    <img src={user.perfilSrc ? `http://${ipUse}:8080/usuario/imagem/${encodeURI(user.perfilSrc)}` : defaultAvatar} alt="" />
                                </div>
                                <span style={user["Chats.isAdmin"] ? { color: "#FFEA00" } : null}>
                                    {user["Chats.isAdmin"] && <img src={coroa} alt="" />}
                                    {user.nome}
                                </span>
                            </div>
                            {
                                props.isAdmin && !user.isRemetente &&
                                <div className={styles.userOptions}>
                                    {user["Chats.isAdmin"] ?
                                        <button className={styles.admin} onClick={() => atualizarUsuario(user, false)}>Remover Administrador</button>
                                        :
                                        <button className={styles.admin} onClick={() => atualizarUsuario(user, true)}>Promover a Admin</button>
                                    }
                                    <button className={styles.removerDaSala} onClick={() => removerDaSala(user)} >Remover da Sala</button>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div >

            <Modal showModal={showModal} setShowModal={setShowModal} modal={modal} time={time} />


        </>


    )
}

export default Usuarios;