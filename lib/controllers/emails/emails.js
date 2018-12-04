const sendGrid = require('@sendgrid/mail');
const config = require('config').get('sendgrid');
const crypto = require('crypto');

sendGrid.setApiKey(config.apiKey);

exports.sendRegisterEmail = async(email,token)=>{
  sendGrid.send({
    to:email,
    from:"info@harsh.com",
    templateId:"d-55cd606991b84e08827a3c23bf72c374",
    dynamic_template_data:{
      token:token
    }
  })
}

exports.getRegisterToken = async()=>{
  return crypto.randomBytes(16).toString('hex');
}