import React, { useEffect, useState } from "react";
import styles from "./Usuarios.module.css";
import AdicionarUsuario from "./AdicionarUsuario";

function Usuarios(props) {
    const { usuarios, socket, carregarUsuarios, idSala, room } = props;
    const [idsUsuariosOnline, setIdsUsuariosOnline] = useState({});
    const [showAddUser, setShowAddUser] = useState(false);

    useEffect(() => {
        socket.on("onlineUsers", usuariosOnline)
        socket.on("addUser", carregarUsuarios)
        return () =>
            socket.off('onlineUsers');

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

    return (
        <>
            <div className={styles.usuarios}>
                <div className={styles.listaUser}>
                    {usuarios.map((user, index) => (
                        <div className={styles.user} key={index}>
                            <div className={styles.nomeUser}>{user.nome}</div>
                            <div className={styles.statusUser} style={{ backgroundColor: idsUsuariosOnline[user.id] ? "#00ff00" : "#e73f5d" }}></div>
                        </div>
                    ))}
                    <button className={styles.iconAddUser} onClick={() => setShowAddUser(true)}>+</button>
                </div>
            </div>

            <AdicionarUsuario idSala={idSala} showAddUser={showAddUser} setShowAddUser={setShowAddUser}
                carregarUsuarios={carregarUsuarios} room={room} />

        </>


    )
}

export default Usuarios;