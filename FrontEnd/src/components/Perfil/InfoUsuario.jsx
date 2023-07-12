import React, { useState } from "react";
import styles from "./InfoUsuario.module.css";
import Avatar from "react-avatar-edit";
import { dataURLtoFile } from "../../utils/geral.mjs";
import botaoEditar from "../../assets/botao-editar.png";

const InfoUsuario = () => {
    const [src, setSrc] = useState(null);
    const [preview, setPreview] = useState(null);

    const [isEditImage, setIsEditImage] = useState(false);
    const [isEditName, setIsEditName] = useState(false);
    const [isEditSenha, setIsEditSenha] = useState(false);

    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');

    const [isNomeIndiponivel, setIsNomeIndiponivel] = useState(false);
    return (
        <div className={styles.infoUsuario}>
            <h1>Informações do Usuário</h1>
            <div className={styles.content}>
                <div className={`${styles.fotoPerfil} ${styles.block}`}>
                    <h2>Foto de Perfil</h2>
                    {isEditImage ?
                        <>
                            <Avatar
                                label="Selecione uma imagem"
                                labelStyle={{ color: "#9d9d9d", fontSize: "1.2rem", cursor: "pointer", padding: "35% 15%" }}
                                width={300}
                                height={250}
                                src={src}
                                onClose={() => { setPreview(null) }}
                                onCrop={(preview) => setPreview(preview)}
                            />
                            <div className={styles.buttons}>
                                <button className={styles.cancelar} onClick={() => setIsEditImage(false)}>Cancelar</button>
                                <button className={styles.salvar} onClick={() => setIsEditImage(true)}>Salvar</button>
                            </div>
                        </>

                        :
                        <div className={styles.defaultEdit}>
                            <img src="src/assets/default-avatar.jpg" alt="" />
                            <button className={styles.editImage} onClick={() => setIsEditImage(true)}>
                                <img src={botaoEditar} alt="" />
                            </button>
                        </div>
                    }
                </div>
                <hr />
                <div className={`${styles.infoConta} ${styles.block}`}>
                    <h2>Informações da Conta</h2>
                    <div className={styles.boxes}>
                        <div className={styles.box}>
                            <h2>Nome ou Tag</h2>
                            <input disabled={!isEditName} onChange={(e) => setNome(e.target.value)} value={nome} />
                            {isNomeIndiponivel && <p>Esse nome está indisponível!</p>}
                            <div className={styles.buttons}>
                                {isEditName ?
                                    <>
                                        <button className={styles.cancelar} onClick={() => setIsEditName(false)}>Cancelar</button>
                                        <button className={styles.salvar}>Salvar</button>
                                    </>
                                    :
                                    <button className={styles.editIcon} onClick={() => setIsEditName(true)}>
                                        <img src={botaoEditar} alt="" />
                                    </button>
                                }
                            </div>
                        </div>
                        <div className={styles.box}>
                            <h2>Senha</h2>
                            <button className={styles.mudarSenha} onClick={() => setIsEditSenha(true)}>Mudar senha</button>
                        </div>
                    </div>
                </div>
            </div>
            {isEditSenha &&
                <div className={styles.modalSenha}>
                    <div className={styles.modal}>
                        <h2>Mudar Senha</h2>
                        <div className={styles.campo}>
                            <label>Senha Atual</label>
                            <input />

                            <label>Nova Senha</label>
                            <input />

                            <label>Confirmar Senha</label>
                            <input />

                            <div className={styles.buttons}>
                                <button onClick={() => setIsEditSenha(false)}>Cancelar</button>
                                <button>Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default InfoUsuario;