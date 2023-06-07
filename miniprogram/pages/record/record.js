const app=getApp()
const db=wx.cloud.database();
Page({
  data: {
    //记录列表
    recordList: [
    
    ],
    totalkm:0
    
  },
  onLoad: function (options) {
    
    //将数据导入到这个页面
    if(app.globalData.isLogged==true)
    {
      console.log(app.globalData.user_runningdata)
      this.setData({
        recordList:app.globalData.user_runningdata
      })
      //计算总里程数
      let t=app.globalData.user_runningdata
    if(t.length>0)
    {
      let total=0;
    for(let i=0;i<t.length;i++)
    {
      
     
       let tdistance=parseFloat(t[i].distance[0]+t[i].distance[1]+t[i].distance[2]+t[i].distance[3]);//将距离转换为浮点型
       total+=tdistance;
    }
    total=total.toFixed(2)
      //存储到全局:
      app.globalData.totalkm=total
      this.setData({
        totalkm:total
      })
    }

    }
  
  },
  
  onShow: function () {
    if(app.globalData.isLogged==false){
      wx.showModal({
        title: '提示',
        content: '请先登陆',
        showCancel: false,
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.switchTab({
              url: '/pages/about/about', // 替换为你的 TabBar 页面路径
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      
    }
  },
  
  goToRunPage() {
    wx.navigateTo({
      url: '/pages/run/run',
    });
  }
});
