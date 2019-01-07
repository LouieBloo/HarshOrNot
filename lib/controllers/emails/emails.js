const sendGrid = require('@sendgrid/mail');
const sendGridConfig = require('config').get('sendgrid');
const crypto = require('crypto');

const config = require('config').get("support");

sendGrid.setApiKey(sendGridConfig.apiKey);

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

exports.sendSupportFeedback = async(feedback,type,firstName,userID)=>{
  sendGrid.send({
    to:config.feedbackAndBugEmail,
    from:"info@harsh.com",
    templateId:"d-9a7d367df4a54460b6c207644baca1c9",
    dynamic_template_data:{
      feedback:feedback,
      firstName:firstName,
      type:type,
      userID:userID
    }
  })
}

exports.getRegisterToken = async()=>{
  return crypto.randomBytes(16).toString('hex');
}