const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async(event, context) =>{
  const wxContext = cloud.getWXContext()
  
  return {
    event,
    openid:wxContext.openid,
    appid:wxContext.appid,
    unionid:wxContext.unionid,
    weRunData:event.weRunData//云开发会自动转换event中的数据
  }
  
}