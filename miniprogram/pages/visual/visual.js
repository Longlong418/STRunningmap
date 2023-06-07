// visualization.js
const app = getApp();
const wxCharts = require('../../utils/wxcharts.js');

Page({
  data: {
    username: '未登录',
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    // 其他数据字段...
  },

  onLoad() {
    // 在页面加载时更新用户数据
    this.updateUserData();

    // 构建跑步数据
    let runningData=[];
    let t=app.globalData.user_runningdata
    console.log(t)
    if(t.length>0)
    {
    for(let i=0;i<t.length;i++)
    {
      
       let tdate= t[i].time[0]+t[i].time[1]+t[i].time[2]+t[i].time[4]+t[i].time[5]+t[i].time[6]+t[i].time[7];//格式化日期
       let tdistance=parseFloat(t[i].distance[0]+t[i].distance[1]+t[i].distance[2]+t[i].distance[3])//将距离转换为浮点型
       runningData.push({date: tdate,distance:tdistance})
    }
    }
    else
    {
      runningData=[{date: "您暂时还没有跑过步噢", distance: 0}]
    }
    //构建卡路里数据
     let calstep=0;
     let calkm=0;
     console.log(this)
    //  calstep=Math.ceil(this.calcustep(170,65,app.globalData.totalstep))
    //  calkm=Math.ceil(this.calcukm(170,65,app.globalData.totalkm))
    //  console.log(calstep,calkm)

     if(app.globalData.user_rundata.isdata==true)
     {
       
       calstep=Math.ceil(this.calcustep(app.globalData.user_rundata.height,app.globalData.user_rundata.weight,app.globalData.totalstep))
     }
     else{
       calstep=Math.ceil(this.calcustep(170,70,app.globalData.totalstep))
     }
  
     if(app.globalData.user_rundata.isdata==true)
     {
       calkm=Math.ceil(this.calcukm(app.globalData.user_rundata.height,app.globalData.user_rundata.weight,app.globalData.totalkm))
    }
     else{
       calkm=Math.ceil(this.calcukm(170,70,app.globalData.totalkm))
     }
     console.log(calstep,calkm)

    
    const caloriesData = [
      {  steps: "走路消耗的卡路里(近30天内)", calories: calstep },
      {  steps: "跑步消耗的卡路里", calories: calkm },
      // 其他数据...
    ];
    //构建微信步数数据
    let l=app.globalData.step;
    let stepdata=[];
    if(l.length>0)
    {
    for(let i=0;i<=30;i=i+2)
    {
      //将时间格式化变得正常
      let today=new Date(l[i].timestamp * 1000)
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      let tday=currentYear+"/"+currentMonth+"/"+currentDay
      // console.log(tday)
      stepdata.push({date: tday, steps: l[i].step})
      // console.log(tstep)
    }
  }
  else{
    stepdata=[{date: "您还没走过路噢",  steps: 0 }]
  }


    // 跑步数据可视化展示
    this.renderRunningChart(runningData);

    // 卡路里数据消耗可视化展示
    this.renderCaloriesChart(caloriesData);

    // 微信步数可视化展示
    this.renderStepChart(stepdata);
  },
//根据步数算卡路里：
 calcustep(height, weight, steps) {
  // 步幅的估计值，可以根据需要进行调整
  let stride = 0.6;

  // 体重系数，根据需求进行调整
  let weightCoefficient = 0.5;
  // 计算卡路里
  let calories = steps * stride * weightCoefficient * weight;

  return calories.toFixed(2);
},
 calcukm(height, weight,distance) {
  // 体重系数，根据需求进行调整
  const weightCoefficient = 0.9;
  const heightInMeter = height / 100;

  // 计算卡路里
  const calories = distance * weightCoefficient * weight;

  return calories.toFixed(2);
},


//根据跑步里程数算卡路里：
  updateUserData() {
    // 从全局数据中获取用户数据
    const { cur_user } = app.globalData;
    if (cur_user) {
      this.setData({ 
        username: cur_user.user_name,
        avatarUrl: cur_user.user_photo,
        // 其他数据字段...
      });
    }
  },

 
  renderRunningChart(data) {
    new wxCharts({
      canvasId: 'runningChart',
      type: 'line',
      categories: data.map(item => item.date),
      series: [{
        name: '跑步里程',
        data: data.map(item => item.distance),
        format: (val) => val.toFixed(2),
      }],
      xAxis: {
        disableGrid: true,
        title: '日期',
        type: 'category', // 添加此行
      },
      yAxis: {
        title: '跑步里程 (km)',
        min: 0,
      },
      width: 320,
      height: 200,
    });
  },
  renderCaloriesChart(data) {
    const seriesData = data.map(item => ({
      name: item.steps,
      data: item.calories,
    }));
  
    new wxCharts({
      canvasId: 'caloriesChart',
      type: 'pie',
      series: seriesData,
      width: 320,
      height: 200,
    });
  },

  renderStepChart(data) {
    const categories = data.map(item => item.date);
    const seriesData = data.map(item => item.steps);
  
    new wxCharts({
      canvasId: 'stepChart',
      type: 'column',
      categories: categories,
      series: [{
        name: '步数',
        data: seriesData,
      }],
      xAxis: {
        disableGrid: true,
      },
      yAxis: {
        title: '步数',
        min: 0,
      },
      width: 320,
      height: 200,
    });
  },
  
});
