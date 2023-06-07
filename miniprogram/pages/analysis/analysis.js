const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:false,
    isData:true
  },
  redirectToReport() {
    wx.navigateTo({
      url: '/pages/report/report',
    });
  },
  redirectToPlan() {
    wx.navigateTo({
      url: '/pages/plan/plan',
    });
  },
  redirectToVisual() {
    wx.navigateTo({
      url: '/pages/visual/visual',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  
  },
  
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})