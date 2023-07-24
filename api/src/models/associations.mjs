import Sala from "./Sala.mjs";
import Chat from "./Chat.mjs";
import Usuario from "./Usuario.mjs";

Usuario.hasMany(Chat, { foreignKey: 'fkUsuario' });
Sala.hasMany(Chat, { foreignKey: 'fkSala' });
