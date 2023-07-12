import moment from "moment-timezone";

export const formatarDataChat = (data) => {
    let dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY");

    if (moment().tz("America/Sao_Paulo").format("DD/MM/YYYY") == dtMensagem) {
        dtMensagem = "Hoje, às " + moment(data).tz("America/Sao_Paulo").format("HH:mm");
    } else {
        dtMensagem = moment(data).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
    }

    return dtMensagem;
}

export const dataURLtoFile = (dataurl, filename) => {

    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}