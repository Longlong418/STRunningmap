const app=getApp()
const wxCharts = require('../../utils/wxcharts.js');
Page({
  data: {
    avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    username: "加载失败",
    totalSteps: 0, // 本月微信总步数
    currentYear: 0, // 当前年份
    currentMonth: 0, // 当前月份
    weekdays: ['日', '一', '二', '三', '四', '五', '六'], // 星期几的标识
    calendarData: [] // 日历数据
  },

  onLoad() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const calendarData = this.generateCalendarData(currentYear, currentMonth);
    let l=app.globalData.step;
    let tempstep=0;
    for(let i=0;i<=30;i++)
    {
        tempstep+=l[i].step;
      // console.log(l[i])
    
    }
    app.globalData.totalstep=tempstep;
   
    this.setData({
      currentYear,
      currentMonth,
      calendarData,
      totalSteps:tempstep,
      avatarUrl: app.globalData.cur_user.user_photo,
      username: app.globalData.cur_user.user_name
     
    });
    // console.log(l)
   
    let stepdata=[]
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
  //  console.log(111)
    // console.log(stepdata)

    //  // 微信步数可视化展示
       this.renderStepChart(stepdata);
  },

  generateCalendarData(year, month) {
    const calendarData = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();
    const lastDay = new Date(year, month, 0);
    const lastDate = lastDay.getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({
        day: '',
        date: '',
        isToday: false,
        steps: ''
      });
    }

    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month - 1, i);
      // console.log(date)
      const isToday = year === currentYear && month === currentMonth && i === currentDay;
      const steps = this.getStepsForDate(date); // 根据日期获取对应的运动步数
      
      calendarData.push({
        day: i,
        date: date.toISOString(),
        isToday,
        steps
      });
    }

    return calendarData;
  },
  //绘制步数图标
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
  getStepsForDate(date) {
    // 根据日期获取对应的运动步数逻辑
    // 返回对应日期的运动步数
    // console.log(app.globalData.step)
    let l=app.globalData.step
    wx.showLoading({
      title: '数据加载中',
  })
   let ans=0;
    for(let i=0;i<=30;i++)
    {
    
      let day = new Date(l[i].timestamp * 1000);
      // console.log(i+":"+day+date)
      if(String(day)==String(date))
      {
        // console.log(l[i].step)
        // return l[i].step
        ans=l[i].step;
        break;
        // return l[i].step;
      }
      // console.log(day)
    }
    wx.hideLoading();
    return ans;
   
    
    
    
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    const calendarData = this.generateCalendarData(currentYear, currentMonth);

    this.setData({
      currentYear,
      currentMonth,
      calendarData
    });
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    const calendarData = this.generateCalendarData(currentYear, currentMonth);

    this.setData({
      currentYear,
      currentMonth,
      calendarData
    });
  },

  selectDate(event) {
    const selectedDate = event.currentTarget.dataset.date;
    // 根据选中日期执行相应操作
    // ...
  }
});
