module.exports=function encrypt(text,crypto) {
    var cipher = crypto.createCipher('aes-256-ctr', 'mariobros1')
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
};