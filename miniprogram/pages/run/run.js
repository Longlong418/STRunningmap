const app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
const db=wx.cloud.database();
Page({
  data: {
    username: '未登录',
    avatarUrl: defaultAvatarUrl,
    duration: '00:00:00',
    pace: '00:00',
    distance: '0.00 km',
    calories: '0 kcal',
    longitude: 0, // 经度
    latitude: 0, // 纬度
    isRunning: false,
    isPaused: false,
    timer: null,
    startTime: 0,
    pausedDuration: 0,
    trajectory: [],
   
  },

  onLoad() {},
  
  onShow() {
    if (!app.globalData.isLogged) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.switchTab({
              url: '/pages/about/about', // 替换为你的 TabBar 页面路径
            });
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        },
      });
    }

    this.setData({
      username: app.globalData.cur_user.user_name,
      avatarUrl: app.globalData.cur_user.user_photo,
    });

    // 获取用户当前位置的经度和纬度
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res)
        const latitude = res.latitude;
        const longitude = res.longitude;

        this.setData({
          latitude,
          longitude,
        });
      },
      fail: (error) => {
        console.error('获取位置失败:', error);
      },
    });
  },

  startRun() {
    // 设置开始时间和初始轨迹
    const startTime = Date.now();
    const trajectory = [];

    // 启动定时器更新数据
    this.data.timer = setInterval(() => {
      // 更新运动数据，例如 duration, pace, distance, calories
      const elapsedTime = Date.now() - this.data.startTime - this.data.pausedDuration;
      const formattedTime = this.formatTime(elapsedTime);
      const distance = this.calculateDistance();
      const pace = this.calculatePace(distance, elapsedTime);
      this.setData({
        duration: formattedTime,
        distance: `${distance.toFixed(2)} km`,
        pace: pace
      });

      // 更新地图上的位置
      this.updateMap();
    }, 1000);

    this.setData({
      isRunning: true,
      isPaused: false,
      startTime,
      pausedDuration: 0,
      trajectory,
    });
  },

  // 暂停定时器
  pauseRun() {
    const { timer, startTime } = this.data;
    clearInterval(timer);
    this.setData({
      isPaused: true,
      pausedDuration: Date.now() - startTime,
    });
  },

  resumeRun() {
    const { duration, startTime } = this.data;
    const elapsedTime = Date.now() - startTime;
    const pausedDuration = elapsedTime - this.formatTimeToMilliseconds(duration);
    const trajectory = this.data.trajectory.slice();
  
    this.data.timer = setInterval(() => {
      const currentElapsedTime = Date.now() - startTime - pausedDuration;
      const formattedTime = this.formatTime(currentElapsedTime);
      const distance = this.calculateDistance();
      this.setData({
        duration: formattedTime,
        distance: `${distance.toFixed(2)} km`,
      });
  
      this.updateMap();
    }, 1000);
  
    this.setData({
      isPaused: false,
      isRunning: true,
      pausedDuration,
      trajectory,
    });
  },
  

  stopRun() {
     // 获取当前时间
    let endTime = Date.now();
     // 计算运动时间
     let elapsedTime = endTime - this.data.startTime - this.data.pausedDuration;
     // 计算运动里程和平均配速
    let distance = this.calculateDistance();
    //  console.log(distance)
    let pace = this.calculatePace(distance, elapsedTime);
    if(distance<=0.1)
    {
      let that=this;
      wx.showModal({
        title: '提示',
        content: '该次跑步时间过短，将不会记录',
        showCancel: true,
        cancelText: '继续跑步',
        cancelColor: '#000000',
        confirmText: '放弃跑步',
        confirmColor: '#3CC51F',
        success: function (res) {
          if (res.confirm) {
            // 用户点击了确定按钮
            // 在这里执行结束跑步的操作
              that.setData({
                isRunning: false,
                isPaused: false,
              });
                     // 停止定时器
            clearInterval(that.data.timer);
            // 清空运动数据和地图上的位置
            that.setData({
            duration: '00:00:00',
            pace: '00:00',
            distance: '0.00 km',
            calories: '0 kcal',
            latitude: 0,
            longitude: 0,
            trajectory: [],
          });
          } else if (res.cancel) {
            // 用户点击了取消按钮
        
          }
        }
      });
      
    }
    else{
 // 构造跑步数据对象
            const runData = {
            time: new Date().toLocaleString(),
            duration: this.formatTime(elapsedTime),
            distance: `${distance.toFixed(2)} km`,
            pace: pace,
          };
        
          // 存储跑步数据到全局变量
          app.globalData.user_runningdata.push(runData);
          console.log( app.globalData.user_runningdata);
          //存到云端数据库
          db.collection('users').doc(app.globalData.cur_user._id).update({
            data: {
              // 将runningdata存入数据库
              runningdata:app.globalData.user_runningdata
              
            },
            success: function(res) {
              console.log(res)
              wx.showToast({
                title: '记录成功！',
                icon: 'success',
                duration: 1000
              })
            
           
              
            },
            fail:function(res){
              wx.showToast({
                title: '存入数据库失败',
                icon: 'error',
                duration: 1000
              })
            }

          })
            
          this.setData({
            isRunning: false,
            isPaused: false,
          });
           // 停止定时器
    clearInterval(this.data.timer);
       // 清空运动数据和地图上的位置
       this.setData({
        duration: '00:00:00',
        pace: '00:00',
        distance: '0.00 km',
        calories: '0 kcal',
        latitude: 0,
        longitude: 0,
        trajectory: [],
      });
      wx.redirectTo({
        url: '/pages/record/record',
      });
    
    }
  },

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / 1000 / 60) % 60;
    const hours = Math.floor(milliseconds / 1000 / 60 / 60);
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  },

  formatTimeToMilliseconds(time) {
    const [hours, minutes, seconds] = time.split(':');
    const hoursMilliseconds = parseInt(hours) * 60 * 60 * 1000;
    const minutesMilliseconds = parseInt(minutes) * 60 * 1000;
    const secondsMilliseconds = parseInt(seconds) * 1000;
    return hoursMilliseconds + minutesMilliseconds + secondsMilliseconds;
  },

  padZero(number) {
    return number.toString().padStart(2, '0');
  },

  updateMap() {
    // 在地图上显示跑步轨迹
    // 获取当前位置的经度和纬度
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res)
        const latitude = res.latitude;
        const longitude = res.longitude;

        // 更新地图上的位置
        this.setData({
          latitude,
          longitude,
        });

        // 添加当前位置到轨迹数组
        const { trajectory } = this.data;
        trajectory.push({ latitude, longitude });
        this.setData({ trajectory });
      },
      fail: (error) => {
        console.error('获取位置失败:', error);
      },
    });
  },

  calculateDistance() {
    const { trajectory } = this.data;
    let distance = 0;

    for (let i = 0; i < trajectory.length - 1; i++) {
      const { latitude: lat1, longitude: lon1 } = trajectory[i];
      const { latitude: lat2, longitude: lon2 } = trajectory[i + 1];
      distance += this.calculateDistanceBetweenPoints(lat1, lon1, lat2, lon2);
    }

    return distance;
  },

  calculateDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const radius = 6371; // 地球半径，单位为 km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = radius * c;

    return distance;
  },

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  },
  //计算配速
  calculatePace(distance, elapsedTime) {
    // 将距离转换为公里
    const distanceInKm = distance/100 ;
    
    // 将时间转换为小时
    const elapsedTimeInHours = elapsedTime / 1000 / 60 / 60;
  
    // 计算配速（每公里所需的时间）
   
    let pace = elapsedTimeInHours / distanceInKm;
    // console.log(pace+":"+ distanceInKm+":"+elapsedTimeInHours)
    if(distanceInKm==0)
    {
        pace=0;
    }
    let temp=Math.floor(pace);
    // 将配速转换为分钟和秒钟
    const paceSeconds = Math.round((pace - temp) * 60);
    const paceMinutes = Math.floor(pace/2);
   
   
 
    // 格式化配速
    const formattedPace = `${this.padZero(paceMinutes)}:${this.padZero(paceSeconds)}`;
  
    return formattedPace;
  },
  
  padZero(number) {
    return number.toString().padStart(2, '0');
  }
  
  
  
});