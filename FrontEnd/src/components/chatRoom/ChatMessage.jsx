import React from "react";
import styles from "./ChatMessage.module.css";
import { ipUse } from "../../config/ipConfig";

const ChatMessage = ({ msg, index, verImagem, mensagens }) => {

    const verificarExibicaoNome = (index, msg) => {
        if (index === 0 || msg.isRemetente) return null;

        if (!mensagens[index - 1].isAddUser) {
            if (msg.nome === mensagens[index - 1].nome) return null;
        }

        return (
            <div className={styles.userContent}>
                <img src={msg.perfilSrc} alt="Imagem de perfil" />
                {msg.nome}
            </div>
        );
    };

    return (
        <div className={styles.mensagemContent} key={index}>
            {msg.isAddUser ?
                <div className={`${styles.mensagem} ${styles.isAddUser}`}>
                    <p>{msg.texto}</p>
                </div>
                :
                <div className={msg.isRemetente ? `${styles.mensagem} ${styles.remetente}` : styles.mensagem} >
                    <div className={styles.nomeUsuarioMsg} style={{ color: msg.color }}>
                        {verificarExibicaoNome(index, msg)}
                    </div>
                    <div className={styles.textMsg}>
                        {msg.texto}
                        {msg.srcImage &&
                            <button onClick={() => verImagem(msg.srcImage)}>
                                <img src={`http://${ipUse}:8080/chat/imagem/${msg.srcImage}`} alt="imagem" />
                            </button>
                        }
                        <span className={styles.dtMensagem}>{msg.dtMensagem}</span>
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatMessage;
