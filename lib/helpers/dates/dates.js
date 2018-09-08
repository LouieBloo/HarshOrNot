exports.calculateAge = async(inputDate)=>{
  var year = new Date().getFullYear();
  console.log(year);
  var returnObj = await Promise.all(inputDate.map(async(date)=>{
    console.log(date);
    return year - date.getFullYear(); 
  }))

  console.log(returnObj);
  return returnObj;
}