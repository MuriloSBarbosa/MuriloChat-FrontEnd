import React, { useState, useRef } from "react";
import axiosInstance from "../config/ipConfig";
import { useNavigate } from "react-router-dom";
import styles from "./Cadastro.module.css"
import Modal from "../components/modal/Modal";
import Avatar from "react-avatar-edit";
import { dataURLtoFile } from "../utils/geral.mjs";

function Cadastro() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');

    const [src, setSrc] = useState(null);
    const [preview, setPreview] = useState(null);

    const navigator = useNavigate();

    const [modal, setModal] = useState({
        title: '',
        text: ''
    });

    const [time, setTime] = useState(3000);
    const [showModal, setShowModal] = useState(false);


    const [form, setForm] = useState(1);

    const inputName = useRef(null);
    const [nomeIndiponivel, setNomeIndiponivel] = useState(false);

    function Cadastrar(e) {
        e.preventDefault();

        if (!preview) return;

        // converter base64 para file
        const file = dataURLtoFile(preview, 'perfilImage.png');

        const formData = new FormData();

        formData.append('perfilImage', file);
        formData.append('nome', nome);
        formData.append('tipo', "perfil");
        formData.append('senha', senha);

        axiosInstance.post('/usuario', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then(() => {
            setModal({
                title: 'Usuário cadastrado com sucesso',
                text: 'Redirecionando...'
            });
            setShowModal(true);
            setTimeout(() => {
                navigator('/');
            }, time);
        }).catch((error) => {
            setModal({
                title: 'Erro',
                text: 'Erro ao cadastrar'
            });
            setShowModal(true);
            console.log(error);
        });
    }

    const verificarNome = (nome) => {
        nome = nome.trim();
        if (nome === "") {
            inputName.current.style.border = "1px solid #ff0000";
            return;
        }
        axiosInstance.get(`/usuario/verificar/${nome}`)
            .then((response) => {
                if (response.data) {
                    inputName.current.style.border = "1px solid #ff0000";
                    setNomeIndiponivel(true);
                } else {

                    inputName.current.style.border = "1px solid #00ff00";
                    setNomeIndiponivel(false);
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    const formInvalido = nome.trim() === "" && senha.trim() === "";

    return (
        <>
            <div className={styles.cadastro}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Cadastre-se</h1>

                    <div className={styles.steps}>
                        <div className={`${styles.step} ${(form === 1 || form === 2) && styles.active}`}>
                            <div className={styles.circle}>
                                <span>1</span>
                            </div>
                            <p>Informações de Conta</p>
                        </div>
                        <div className={`${styles.step} ${form === 2 && styles.active}`}>
                            <div className={styles.circle}>
                                <span>2</span>
                            </div>
                            <p>Foto de Perfil</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => Cadastrar(e)}>
                        {form === 1 &&
                            <div className={styles.stepForm}>
                                <h1>Informações de Conta</h1>
                                <div className={styles.boxes}>
                                    <div className={styles.box}>
                                        <label>Nome ou Tag</label>
                                        <input type="text" ref={inputName} value={nome} onChange={(e) => { setNome(e.target.value); verificarNome(e.target.value) }} />
                                        {nomeIndiponivel && <p>Esse nome está indisponível!</p>}
                                    </div>
                                    <div className={styles.box}>
                                        <label>Senha</label>
                                        <input type="password" value={senha} onChange={(e) => { setSenha(e.target.value) }} />
                                    </div>
                                    <div className={styles.box}>
                                        <button onClick={() => setForm(2)}>Próximo</button>
                                    </div>
                                </div>
                            </div>
                        }

                        {form === 2 &&
                            <div className={styles.stepForm}>
                                <h1>Foto de Perfil</h1>

                                <div className={styles.boxes}>
                                    <Avatar
                                        label="Selecione uma imagem"
                                        labelStyle={{ color: "#9d9d9d", fontSize: "1.2rem", cursor: "pointer", padding: "32% 24%" }}
                                        width={400}
                                        height={300}
                                        src={src}
                                        onClose={() => setPreview(null)}
                                        onCrop={(preview) => setPreview(preview)}
                                    />

                                    <div className={styles.buttons}>
                                        <button onClick={() => setForm(1)}>Anterior</button>
                                        <button disabled={formInvalido}>Cadastrar</button>
                                    </div>
                                </div>

                            </div>
                        }
                    </form>
                </div>
            </div >

            <Modal showModal={showModal} setShowModal={setShowModal} modal={modal} time={time} />

        </>
    )
}

export default Cadastro;