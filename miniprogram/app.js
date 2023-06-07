App({

  globalData:{
    cur_user:null,
    isLogged: false,
    step:null,
    user_rundata:{
      isdata:false,
      km:"0",
      kacl:'0',
      
    },//存本地的身高体重等
    totalkm: 0,
    totalstep:0,
    user_runningdata:[]//存云端的跑步数据
    


  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    wx.cloud.init({
      env: 'cloud1-0g4gycsq3bf7634c' 
    })

  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
