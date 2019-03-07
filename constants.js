//Configuration server LoginOauth-VerifyToken

const PORTSERVER=3001;

exports.PORTSERVER= PORTSERVER;

exports.CLIENT_ID= "1032746015325-2gjh5pee6ajcg0lni9adh53ih4mn489v.apps.googleusercontent.com",
exports.CLIENT_SECRET  = "nix9S2Ez1G7UO_venNiSGl5i",
exports.CALLBACK_URL ="http://localhost:"+PORTSERVER+"/auth/google/callback"
exports.SECRET_JWT="jwtClave",
exports.TOKEN_EXPIRE=60*60,
exports.URL_LOGIN_GROC="http://172.16.12.42:8081/login"