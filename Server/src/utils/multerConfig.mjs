import multer from "multer";
import moment from "moment";

// no cb, o primeiro parametro é o erro, o segundo é o nome do arquivo
// o nome do arquivo é composto pela data e hora atual, e o nome original do arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == "perfilImage") {
            cb(null, "./public/uploads/perfil");
            return;
        } else if (file.fieldname == "wallpaperImage") {
            cb(null, "./public/uploads/wallpaper");
            return;
        } else if (file.fieldname == "chatDoc") {
            cb(null, "./public/uploads/documents");
            return;
        }
        cb(null, "./public/uploads/images");

    }, filename: (req, file, cb) => {
        cb(null, `${moment().format("YYYY-MM-DD-HH[h]-mm[m]-ss[s]-SSS[ml]")}-${file.originalname}`);
    }
});

export const filtro = (req, file, cb) => {

    const formatoAceito = ["image/png", "image/jpg", "image/jpeg"]

    if (file.fildname != "perfilImage" || "wallpaperImage") {
        return cb(null, true);
    }


    formatoAceito.find(
        formato => formato == file.mimetype
    );

    if (formatoAceito) {
        return cb(null, true);
    }

    return cb(null, false);
};

// o upload recebe dois parametros, o primeiro é o storage, que é o local onde o arquivo será salvo	
// e o segundo é o filtro, que é o tipo de arquivo que será aceito    
export const upload = multer({ storage, filtro });