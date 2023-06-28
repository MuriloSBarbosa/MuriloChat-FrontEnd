import moment from "moment-timezone";

export function formatarDataChat(data) {
    let dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY");

    if (moment().tz("America/Sao_Paulo").format("DD/MM/YYYY") == dtMensagem) {
        dtMensagem = "Hoje, às " + moment(data).tz("America/Sao_Paulo").format("HH:mm");
    } else {
        dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
    }

    return dtMensagem;
}