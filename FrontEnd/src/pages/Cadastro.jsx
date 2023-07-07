import React, { useState } from "react";
import axiosInstance from "../config/ipConfig";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css"
import Modal from "../components/Modal";

function Cadastro() {
    const [nome, setNome] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const navigator = useNavigate();

    const [modal, setModal] = useState({
        title: '',
        text: ''
    });
    const [time, setTime] = useState(3000);
    const [showModal, setShowModal] = useState(false);

    function Cadastrar(e) {
        e.preventDefault();
        axiosInstance.post('/usuario', {
            nome: nome,
            login: login,
            senha: senha
        }).then(() => {
            setModal({
                title: 'Sucesso!',
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

    const verificarCampos = nome === '' || login === '' || senha === '';
    return (
        <>
            <div className={styles.login}>
                <form className={styles.content} onSubmit={(e) => Cadastrar(e)}>
                    <h1>Cadastrar</h1>
                    <div className={styles.boxes}>
                        <div className={styles.box}>
                            <label>Nome</label>
                            <input type="text" value={nome} onChange={(e) => { setNome(e.target.value) }} />
                        </div>
                        <div className={styles.box}>
                            <label>Login</label>
                            <input type="text" value={login} onChange={(e) => { setLogin(e.target.value) }} />
                        </div>
                        <div className={styles.box}>
                            <label>Senha</label>
                            <input type="password" value={senha} onChange={(e) => { setSenha(e.target.value) }} />
                        </div>
                        <div className={styles.box}>
                            <button disabled={verificarCampos}>Cadastrar</button>
                        </div>
                    </div>
                </form>
            </div>

            <Modal showModal={showModal} setShowModal={setShowModal} modal={modal} time={time} />

        </>
    )
}

export default Cadastro;