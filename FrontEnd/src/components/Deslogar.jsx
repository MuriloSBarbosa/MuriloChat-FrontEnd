import React from "react";
import { deslogar } from "../utils/geral.mjs";
import logoutPng from '../assets/logout.png';

const Deslogar = (props) => {
    return (
        <button className={props.styles.logout} onClick={deslogar}>
            <img src={logoutPng} alt="Logout" />
        </button>
    )
}

export default Deslogar;