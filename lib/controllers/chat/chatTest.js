var cf = require('config');
var config = cf.get('twilio');

var createUser = require('./createUser');
//const client = require('twilio')(config.accountSID, config.auth);

//var service = client.chat.services(config.serviceID);
//var createChannel = require('./createChannel');

var test = async () => {

  // service.channels
  //   .create({ friendlyName: 'Best Channel <3' })
  //   .then(channel => console.log(channel.sid))
  //   .catch(err=>{ console.log(err)})
  //   .done();

  // client.chat.services(config.serviceID)
  //   .channels
  //   .each(channels => console.log(channels.sid));


  await createUser("luke99999","lukey boy 2");

  // service.channels("CH0472f0458b8a47f59c9032c33b0094f0")
  //   .members
  //   .create({ account_sid: "US96841187fe434cea9d067e4e7c89e6ce",identity:"lukey boy" })
  //   .then(member => console.log(member.sid))
  //   .done();
}

test();
