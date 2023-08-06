import React from "react";
import styles from "./ChatMessage.module.css";
import { ipUse } from "../../config/ipConfig";
import downloadImg from "../../assets/download.png";
import fileImg from "../../assets/file.png";
import { formatarBytes } from "../../utils/geral.mjs";
import axiosInstance from "../../config/ipConfig";

const ChatMessage = ({ msg, index, verImagem, mensagens, usuarios }) => {

    const imageRef = React.useRef(null);
    const docRef = React.useRef(null);

    const verificarExibicaoNome = (index, msg) => {
        if (index === 0 || msg.isRemetente) return null;

        if (!mensagens[index - 1].isAddUser) {
            if (msg.nome === mensagens[index - 1].nome) return null;
        }

        const usuario = usuarios.find((usuario) => usuario.id === msg["Usuario.id"]);

        return (
            <div className={styles.userContent}>
                <img src={usuario.perfilSrc} />
                {msg.nome}
            </div>
        );
    };

    React.useEffect(() => {
        if (msg.srcImage) {
            carregarImage();
        }
        if (msg.srcDoc) {
            carregarDoc();
        }
    }, []);

    const carregarImage = () => {
        axiosInstance.get(`/chat/imagem/${encodeURI(msg.srcImage)}`, {
            responseType: 'blob'
        })
            .then((response) => {
                const file = new Blob([response.data], { type: response.data.type });
                const fileURL = URL.createObjectURL(file);
                imageRef.current.src = fileURL;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const carregarDoc = () => {
        axiosInstance.get(`/chat/documento/${encodeURI(msg.srcDoc)}`, {
            responseType: 'blob'
        })
            .then((response) => {
                const file = new Blob([response.data], { type: msg.typeDoc, name: msg.nomeDoc });
                const fileURL = URL.createObjectURL(file);
                docRef.current.href = fileURL;
                docRef.current.download = msg.nomeDoc;
            })
            .catch((error) => {
                console.log(error);
            });
    }


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
                                <img ref={imageRef} className={styles.msgImg} alt="imagem" />
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
                                <a ref={docRef} download={true} className={styles.docDownload} >
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
