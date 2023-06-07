const app=getApp()
let rundata={};
const db=wx.cloud.database();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
Page({
  data: {
    steps: 1, // 当前步骤
    gender: '', // 选择的性别
    height: '', // 输入的身高
    weight: '', // 输入的体重
    kcal: '', // 输入的卡路里
    km:'',//输入的里程数
    planGenerated: false, // 是否生成了运动计划
    generatedPlan: '', // 生成的运动计划
    heightPicker: [], // 身高选项
    weightPicker: [], // 体重选项
    kcalPicker: [], // 卡路里选项
    kmPicker:[],//里程数选项
    isdata:false,//是否登记过
    avatarUrl: defaultAvatarUrl,
    username: '未登录',
    todayCalories:0,
    todaykm:0,
    progresskm:0,
    progresskal:0
    
   
  },
 
  onLoad() {
    //微信不让request未备案的域名呜呜呜
    // wx.request({
    //   url: 'https://openai.api2d.net/v1/chat/completions',
    //   method: 'POST',
    //   header: {
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer fk205', // <-- 把 fkxxxxx 替换成你自己的 Forward Key，注意前面的 Bearer 要保留，并且和 Key 中间有一个空格。
    //   },
    //   data: {
    //     model: 'gpt-3.5-turbo',
    //     messages: [{ role: 'user', content: '你好！给我讲个笑话。' }],
    //   },
    //   success: function (res) {
    //     console.log('statusCode:', res.statusCode);
    //     console.log('data:', res);
    //   },
    //   fail: function (err) {
    //     console.error(err);
    //   },
    // });
    // console.log( app.globalData.user_rundata);
    console.log(this.data.isdata);
    wx.showLoading({
      title: '加载中',
      mask: true, // 是否显示透明蒙层，防止用户操作
    });
    //检测是否登记过：
      this.setData({
        isdata:app.globalData.user_rundata.isdata,
        avatarUrl: app.globalData.cur_user.user_photo,
        username: app.globalData.cur_user.user_name
      })
      //如果登记过，则赋予值,以及调取数据库，计算卡路里等等操作
      if(this.data.isdata===true)
      {
        this.setData({
        
          height: app.globalData.user_rundata.height, 
          weight: app.globalData.user_rundata.weight, 
          kcal: app.globalData.user_rundata.kcal, 
          km:app.globalData.user_rundata.km

         
        })
           //将从数据库中找到今日跑的里程数：
    let that=this
    db.collection('users').doc(app.globalData.cur_user._id).get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data)
        //获取今天的日期
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString();
        const day = currentDate.getDate().toString();
        const today=year+month+day
        // console.log(today)
        let n=res.data.runningdata.length;
      //从数据库里找今日的信息
          for(let i=0;i<n;i++)
          {
            //统一格式方便查找
            let tempday=res.data.runningdata[i].time.toString()
            let tyear=tempday[0]+tempday[1]+tempday[2]+tempday[3];
            let tmonth=tempday[5];
            let tday=tempday[7];
            let ansday=tyear+tmonth+tday;
            //  console.log(today===ansday)
            if(today===ansday)//找到
            {
              //计算进度条的progress值，将数据转换为浮点型
              let t=res.data.runningdata[i].distance
              let todaydistance=parseFloat(t[0]+t[1]+t[2]+t[3])
              // console.log(todaydistance)
              let ttkm=parseFloat(app.globalData.user_rundata.km)
              // console.log(ttkm)
              that.setData({
                todaykm:todaydistance,
                progresskm: todaydistance/ttkm*100
              })
             
            }
          
          }
      }
    })
    //计算今日的卡路里消耗以及卡路里进度条的progress
    let hei=parseFloat(this.data.height)
    let wei=parseFloat(this.data.weight)
    let dist=parseFloat(this.data.todaykm)
    // console.log(app.globalData.step[30])
    let ste=parseFloat(app.globalData.step[30].step)
    let sskcal=this.calculatecal(hei,wei,dist,ste)
    // console.log(hei,wei,dist, ste)
    // console.log(sskcal)
    let proeskcal=sskcal/parseFloat(this.data.kcal)*100
    
    this.setData({
      progresskal:proeskcal,
      todayCalories:sskcal.toFixed(2)
    })

      }

    
    // 初始化身高选项
    const heightPicker = [];
    for (let i = 130; i <= 230; i++) {
      heightPicker.push(i.toString());
    }

    // 初始化体重选项
    const weightPicker = [];
    for (let i = 30; i <= 300; i++) {
      weightPicker.push(i.toString());
    }

    // 初始化卡路里选项
    const kcalPicker = [];
    for (let i = 100; i <= 10000; i += 100) {
      kcalPicker.push(i.toString());
    }
    //初始化里程数
   
    const kmPicker = [];
    for (let i =1; i <= 100; i += 1) {
      kmPicker.push(i.toString());
    }

    this.setData({
      heightPicker,
      weightPicker,
      kcalPicker,
      kmPicker
    });
    // 隐藏加载提示
  wx.hideLoading();
  },
  //计算卡路里
  calculatecal(height,weight,distance,steps){
    const caloriePerKg = 0.7; // 每公斤体重消耗的卡路里数
    const caloriePerStep = 0.05; // 步行每步消耗的卡路里数
  
    // 将体重从千克转换为克
    const weightGrams = weight * 1000;
  
    // 将里程数从公里转换为米
    const distanceMeters = distance * 1000;
  
    // 计算卡路里消耗量
    const runningCalories = (weightGrams / 1000) * distanceMeters * caloriePerKg;
    const walkingCalories = steps * caloriePerStep;
    const totalCalories = runningCalories + walkingCalories;
  
    // 返回卡路里消耗量
    return totalCalories;
  },
  goToRunPage() {
    wx.navigateTo({
      url: '/pages/run/run',
    });
  },
  selectGender(event) {
    const gender = event.currentTarget.dataset.gender;
    this.setData({ gender });
    
  },
 

  selectHeight(event) {
    const index = event.detail.value;
    const height = this.data.heightPicker[index];
    this.setData({ height });
  },

  selectWeight(event) {
    const index = event.detail.value;
    const weight = this.data.weightPicker[index];
    this.setData({ weight });
  },

  selectKcal(event) {
    const index = event.detail.value;
    const kcal = this.data.kcalPicker[index];
    this.setData({ kcal });
  },
  selectKm(event) {
    const index = event.detail.value;
    const km = this.data.kmPicker[index];
    this.setData({ km});
  },

  next() {
    const { steps, gender, height, weight, kcal,km } = this.data;

    if (steps === 1 && gender === '') {
      wx.showToast({
        title: '请选择性别',
        icon: 'none',
      });
      return;
    }

    if (steps === 2 && (height === '' || weight === '')) {
      wx.showToast({
        title: '请输入身高和体重',
        icon: 'none',
      });
      return;
    }

    if (steps === 3 && kcal === '') {
      wx.showToast({
        title: '请输入每天想要消耗的卡路里',
        icon: 'none',
      });
      return;
    }

    if (steps === 3) {
      // 生成运动计划
      const plan = this.generatePlan();
      //将用户数据存到本地全局
      rundata={
        gender: this.data.gender, 
        height: this.data.height, 
        weight: this.data.weight, 
        kcal: this.data.kcal, 
        km:this.data.km,
        isdata:true

      
       }
       app.globalData.user_rundata=rundata;
      
       console.log( app.globalData.user_rundata);
      this.setData({
        planGenerated: true,
        generatedPlan: plan,
        isdata:true

      });
      wx.redirectTo({
        url: '/pages/plan/plan',
      });
    
    }

    this.setData({
      steps: steps + 1,
    
    });
  },
  selectstep(){
    this.setData({
  
    });
  },
  previous() {
    const { steps } = this.data;
    
    if (steps === 1) {
      return;
    }
    
    this.setData({
      steps: steps - 1,
  
    });
  },

  generatePlan() {
    // 在此处根据用户选择的数据生成运动计划
    return "";
  },
  
});
