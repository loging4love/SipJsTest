console.log("1223");
var config = {
    uri: 'sip:1009@47.93.117.234:7799',
    ws_servers:'wss://47.93.117.234:7443',
    authorizationUser:'1009',
    password:'710709099'
}
console.log(config);
var ua= new SIP.UA(config);