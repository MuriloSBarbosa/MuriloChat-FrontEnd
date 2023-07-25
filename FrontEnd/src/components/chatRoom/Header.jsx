import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/ipConfig";
import styles from "./Header.module.css";
import tresPontos from "../../assets/tres-pontos.png";
import AdicionarUsuario from "./AdicionarUsuario";


function Header(props) {
    const { idSala, carregarUsuarios, room } = props;

    const [showAddUser, setShowAddUser] = useState(false);
    const [showMenuOptions, setShowMenuOptions] = useState(false);

    const options = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        window.addEventListener("click", (e) => fecharMenuOptions(e))
        return () => {
            window.removeEventListener("click", fecharMenuOptions);
        }
    })

    const sairDaSala = () => {
        axiosInstance.delete(`/chat/sala/sair`, {
            data: {
                idSala: props.idSala
            }
        })
            .then(() => {
                alert("Você saiu da Sala com sucesso!")
                navigate(0);
            })
            .catch((error) => {
                alert("Erro ao sair da Sala!");
                console.log(error);
            });
    }

    useEffect(() => {
        if (showMenuOptions) {
            setTimeout(() => {
                options.current.classList.add(styles.fadeIn);
            }, 100);
        } else {
            options.current.classList.remove(styles.fadeIn);
        }

    }, [showMenuOptions])

    const fecharMenuOptions = (e) => {
        if (e.target.id != "menuOptionsClick" && !e.target.classList.contains(styles.menuOptions)) {
            setShowMenuOptions(false);
        }
    }


    return (
        <>
            <div className={styles.header}>
                <div className={styles.menuOptions} onClick={() => setShowMenuOptions(!showMenuOptions)}>
                    <img src={tresPontos} alt="" id="menuOptionsClick" />
                    <div className={styles.options} style={showMenuOptions ? { display: "flex" } : { display: "none" }} ref={options}>
                        <button className={styles.addUser} onClick={() => setShowAddUser(true)}>Adicionar Usuário</button>
                        <button className={styles.sairSala} onClick={sairDaSala}>Sair da Sala</button>
                    </div>
                </div>
            </div>
            <AdicionarUsuario idSala={idSala} showAddUser={showAddUser} setShowAddUser={setShowAddUser}
                carregarUsuarios={carregarUsuarios} room={room} />
        </>
    )
}

export default Header;