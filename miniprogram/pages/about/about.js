// pages/about/about.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app=getApp();
const db=wx.cloud.database();
let user={}
let tempurl="";
let tempuserid="";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogged: false, // 是否登录状态
    avatarUrl: defaultAvatarUrl, // 头像URL
    userId: '', // 用户ID
    usercnt:'',//第几位用户
    todaySteps: 0, // 今日步数
    calories: 0, // 消耗的卡路里
    distance: 0, // 行走距离
    encouragement: '获取中....', // 鼓励话语
  },
  //点击头像换头像
  handleAvatarClick(e){
    console.log(e)
    this.setData({
      
      avatarUrl:e.detail.avatarUrl
    
  })
  wx.cloud.uploadFile({
    cloudPath: this.data.userId+String(this.data.usercnt+1)+this.data.avatarUrl.substring(this.data.avatarUrl.lastIndexOf("."))
    ,//根据用户姓名重命名文件，后边是截取字符串来判断图片的后缀
  filePath: this.data.avatarUrl, // 文件路径
  success:res=>{
    // console.log(app.globalData.cur_user._id)
    // console.log(app.globalData.cur_user.user_photo)
    console.log(res)
    tempurl=res.fileID;//用于下边更新全局变量
    db.collection('users').doc(app.globalData.cur_user._id).update({
      // data 传入需要局部更新的数据
      data: {
        // 更新照片路径
        user_photo: res.fileID
      },
      success: function(res) {
        console.log(res)
        wx.showToast({
          title: '修改成功！',
          icon: 'success',
          duration: 2000
        })
        //作用于全局变量
        
        app.globalData.cur_user.user_photo= tempurl
        // console.log(app.globalData.cur_user.user_photo)
        
      },
      fail:function(res){
        wx.showToast({
          title: '存入数据库失败',
          icon: 'error',
          duration: 1000
        })
      }
    })
  }
  })

  },
//点击名字换名字
handleNameClick: function() {
  wx.showActionSheet({
    itemList: ['更换名字'],
    success: res => {
      if (res.tapIndex === 0) {
        wx.showModal({
          title: '请输入新名字',
          editable:true,
          success: modalRes => {
            if (modalRes.confirm) {
              let newName = modalRes.content;
              if(newName.trim().length>0)
              {
                db.collection('users').doc(app.globalData.cur_user._id).update({
                  data: {
                    // 表示将 done 字段置为 true
                    user_name:newName
                  },
                  success: function(res) {
                    console.log(res)
                    wx.showToast({
                      title: '修改成功！',
                      icon: 'success',
                      duration: 1000
                    })
                    //作用于全局变量
                    app.globalData.cur_user.user_name=newName
                    console.log(app.globalData.cur_user.user_name)
                    
                  },
                  fail:function(res){
                    wx.showToast({
                      title: '存入数据库失败',
                      icon: 'error',
                      duration: 1000
                    })
                  }

                })
                wx.showToast({
                  title: '修改成功!',
                  icon: 'success',
                  duration: 1000
                })
                this.setData({
                  userId: newName // 更新名字数据
                });
              }
              else{
                wx.showToast({
                  title: '名字不能为空!',
                  icon: 'error',
                  duration: 2000
                })
             
              }
             
            }
          },
          fail: err => {
            console.error(err);
          }
        });
      }
    },
    fail: err => {
      console.error(err);
    }
  });
},

  
onLoad: function (options) {
//     通过获得openid检测是否登录
wx.showLoading({
  title: '加载中',
})
wx.cloud.callFunction({
  name: "quickstartFunctions",
          data: {
              type:"getOpenId",
              // weRunData: wx.cloud.CloudID(cloudID)
          },
  success: res => {
    // console.log(this.data)
    let that=this//将这个this保存在临时变量里，后便会换
    console.log('用户的 OpenID：', res.result.openid)  
    //在数据库中查找是否有该openid的人
    db.collection('users').where({
      _openid:res.result.openid
      
    })
    .get({
      success: function(res) {
        //在这里this就换了
        // res.data 是包含以上定义的两条记录的数组
        console.log(res.data)
        if(res.data.length>0){
          console.log(res.data)
          app.globalData.cur_user=res.data[0];
          app.globalData.user_runningdata=res.data[0].runningdata
          app.globalData.isLogged=true;
          // console.log(app.globalData.cur_user._openid)
          let t=res.data[0];
          // console.log(this)
          that.setData({
            avatarUrl:t.user_photo,
            userId:t.user_name,
            isLogged:true
          })
        }
        else{
          wx.showToast({
            title: '请先登录',
            icon: 'error',
            duration: 1000
          })
        }
      }
    })
  }
})

//获取微信步数
wx.getWeRunData({
  success: res => {
      wx.showLoading({
          title: '数据加载中',
      })
      
      const cloudID = res.cloudID
      
      wx.cloud.callFunction({
          name: "quickstartFunctions",
          data: {
              type:"getWeRunData",
              weRunData: wx.cloud.CloudID(cloudID)
          },

          success: runRes => {
              if (runRes.errMsg.includes('ok')) {
                  //  console.log(runRes.result)
                  let result = runRes.result.weRunData.data; //最近一个月的步数数据
                  console.log(result)
                  // console.log(this)
                  app.globalData.step=result.stepInfoList//传到全局变量中
                  // console.log(app.globalData.step)
                  this.setData({
                    todaySteps:result.stepInfoList[30].step,
                    distance:(result.stepInfoList[30].step*0.7/1000).toFixed(2)//保留两位小数
                  })
                 
                    
             
              }
          },

          complete: res => {
              wx.hideLoading()
          }
          
      })
  }
})
//获得数据库用户数量
db.collection('users').get().then(res=>{
  // console.log(this)
this.setData({
  usercnt:res.data.length
})
})
//调取一言api:
let that = this;
wx.request({
  url: 'https://v1.hitokoto.cn/',
  method: 'GET',
  data: {
    c: 'k',
    encode: 'json	'
  },
  success: function(res) {
    // 处理响应数据
    console.log(res.data);
    // console.log(this)
    if(res.data.from_who==null)
    {
      that.setData({
        encouragement:res.data.hitokoto+"——"+res.data.from
      })
    }
    else
    {
      that.setData({
        encouragement:res.data.hitokoto+"——"+res.data.from_who
      })
    }
    
  },
  fail: function(error) {
    // 处理错误信息
    console.log(error);
    that.setData({
      encouragement:"获取失败。"
    })
  }
});
  
  },
  onChooseAvatar(e) {
    console.log(e)
    this.setData({
      
        avatarUrl:e.detail.avatarUrl
      
    })
    tempurl=e.detail.avatarUrl;
   

  },
  
  login: function () {
    let that=this;
    if(tempuserid.trim().length>0&&tempurl.trim().length>0)//名字头像不能为空
    {
      this.setData({
        isLogged:true,
        avatarUrl:tempurl,
        userId:tempuserid
       
      });

      //将用户信息存到数据库中
      wx.cloud.uploadFile({
        cloudPath: this.data.userId+String(this.data.usercnt+1)+this.data.avatarUrl.substring(this.data.avatarUrl.lastIndexOf("."))
        ,//根据用户姓名重命名文件，后边是截取字符串来判断图片的后缀
      filePath: this.data.avatarUrl, // 文件路径
    
      success: res => {
        // get resource ID
        console.log(this.data.usercnt)
        console.log(res.fileID)
        //新增用户道user表(user_name,user_photo,user_regtime)
        user={
          user_name:that.data.userId,
          user_photo:res.fileID,
          user_regtime:new Date(),
          runningdata:app.globalData.user_runningdata
        }
      
        db.collection('users').add({
          // data 字段表示需新增的 JSON 数据
          data:user,
          
        })
        .then(res => {
          console.log(res)
          //保存到全局作用域中
          user._id=res._id
          app.globalData.cur_user=user;
          app.globalData.isLogged=true;
         
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          })
      
        }).catch(error=>{
          wx.showToast({
            title: '您的信息存入数据库失败',
            icon: 'error',
            duration: 2000
          })

        })
        
        
      },
      fail: err => {
        wx.showToast({
          title: '您的信息存入数据库失败',
          icon: 'error',
          duration: 2000
        })
      }
    }) 
    }
    else{
      wx.showToast({
        title: '请选择姓名头像',
        icon: 'error',
        duration: 2000
      })
      
    }
   
  
  },
  bindKeyInput(e) {
    // 表单输入状态事件监听函数
    console.log(e)
      tempuserid=e.detail.value;
   
},
  bindblurFn(e) {
    // 表单失去焦点事件监听函数
    console.log(e)
    tempuserid=e.detail.value;
},
  /**
   * 生命周期函数--监听页面加载
   */

  logout: function() {
    let that=this;
    wx.showModal({
      title: '提示',
      content: '该选项是注销您的账号，您的账号数据会从数据库中移除，您确定要注销账号？',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showModal({
            title: '再次提示',
            content: '再点真的就注销了！是否继续?',
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定') 
              db.collection('users').doc(app.globalData.cur_user._id).remove({
                  success: function(res) {
                    console.log(res.data)
                    wx.showToast({
                      title: '注销成功',
                      icon: 'success',
                      duration: 1000
                    })
                    app.globalData.isLogged=false;
                  }
                })      
            that.setData({
            isLogged: false,
            avatarUrl: defaultAvatarUrl,
            userId:" "
          }); 
        } 
              else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    // 执行退出登录操作，例如清除用户登录状态等
    // 跳转到登录页面或其他逻辑
  },


  gotoLonglongPage: function() {
    wx.navigateTo({
      url: '/pages/Longlong/Longlong'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})