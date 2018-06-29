var view = function(req,res,next){

  return new Promise(function(resolve,reject){
    resolve(req.payload);
  });
}

module.exports = view;