module.exports=function decrypt(text,crypto) {
    var decipher = crypto.createDecipher('aes-256-ctr', 'mariobros1')
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
};