import React from "react";
import styles from "./ChatMessage.module.css";
import { ipUse } from "../../config/ipConfig";
import downloadImg from "../../assets/download.png";
import fileImg from "../../assets/file.png";
import { formatarBytes } from "../../utils/geral.mjs";

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
                                <img className={styles.msgImg} src={`http://${ipUse}:8080/chat/imagem/${msg.srcImage}`} alt="imagem" />
                            </button>
                        }

                        {msg.srcDoc &&
                            <div className={styles.documento} >
                                <div className={styles.docContent} >
                                    <img className={styles.docImage} src={fileImg} alt="fileImg" />
                                    <div className={styles.docInfo} >
                                        <p>{msg.nomeDoc}</p>
                                        <div >
                                            <p>{msg.typeDoc}</p>
                                            <p>{formatarBytes(msg.sizeDoc)}</p>
                                        </div>
                                    </div>
                                </div>
                                <a className={styles.docDownload} href={`http://${ipUse}:8080/chat/documento/${encodeURI(msg.srcDoc)}`} >
                                    <img src={downloadImg} alt="download" />
                                </a>
                            </div>
                        }

                        <span className={styles.dtMensagem}>{msg.dtMensagem}</span>
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatMessage;
