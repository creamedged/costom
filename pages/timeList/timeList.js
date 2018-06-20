// pages/timeList/timeList.js
var app=getApp();
Page({
  data: {
    times:[],
    list:[],
    cookie:{},
    selectDay:0,
    selectTime:null,
    startTime:'',
    endTime:'',
    widthBox:0,
    date:'',
    isTime:false,
    noData:false,
    count1: 0,
    startm: 6,
    dt:'',
    sta1:true,
    sta2:false,
    distance:0,
    bol:false,
    isIphoneX:false
  },
  onLoad: function (options) {
    let curd = new Date();
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      count1: curd.getMonth() - this.data.startm + 1,
      dateTime: new Date(curd).format("yyyy-MM-dd"),
      dt: new Date(curd).format("yyyy-MM-dd")
    })
    wx.getStorage({
      key: 'detail_' + app.globalData.customerId,
      success: res=> {
        this.setData({
          cookie:res.data
        })
        this.getTimeList(res.data);
      }
    })
    this.triggerEvent('onChangeDate',{});
  },
  onChangeDate(event) {
    this.setData({
      dateTime: event.detail.currentDate,
      selectTime: null,
      sta1: true,
      sta2: false
    });
    let d = Math.ceil((new Date(this.data.dateTime).getTime() - new Date()) / 86400000)
    this.setData({
      distance: d
    });
    let bol = this.data.sta1 && this.data.sta2
    this.setData({
      bol: bol
    });
    let list = this.data.times;
    for(let i=0,len=list.length;i<len;i++){
      if(list[i].dateTime == this.data.dateTime){
        this.setData({
          list: list[i].models
        })
        break;
      }else {
        this.setData({
          list: []
        })
      }
    }
    if(this.data.list.length !== 0){
      this.setData({
        con:true
      })
    }else {
      this.setData({
        con: false
      })
    }
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/subOrder/subOrder',
    })
    // wx.navigateBack({
    //   data:1
    // })
  },
  selected(options){
    var index = options.currentTarget.dataset.index
    this.setData({
      selectDay:index,
      list: this.data.times[index].models
    })
    this.setData({
      sta1: true,
      sta2: false
    })
    let bol = this.data.sta1 && this.data.sta2
    this.setData({
      bol: bol
    });
  },
  bespeak(options){
    var index=options.currentTarget.dataset.index;
    this.setData({
      selectTime:index,
      startTime:options.currentTarget.dataset.start,
      endTime:options.currentTarget.dataset.end,
      date: this.data.dateTime
    })
    this.setData({
      sta2: true
    })
    let bol = this.data.sta1 && this.data.sta2
    this.setData({
      bol: bol
    });
  },
  goToOrder(){
    if(!this.data.isTime){
      if (this.data.startTime == '' || this.data.endTime == '') {
        wx.showToast({
          title: '请选择上门时间',
          icon: 'none'
        })
        return false;
      }
    }
    wx.setStorage({
      key: 'time_' + app.globalData.customerId,
      data:{
        startTime:this.data.startTime,
        endTime:this.data.endTime,
        date:this.data.date,
        dIndex: this.data.selectDay,
        tIndex: this.data.selectTime
      }
    })
    wx.redirectTo({
      url: '/pages/subOrder/subOrder',
    })
  },
  getTimeList(data){
    app.req({ "query": 'query{customer_product_available_times(product_id:"' + data.productId + '",psku_id:"' + data.pskuId + '",customer_address_id:"' + data.addressId + '",num:' + data.count + '){dateTime,date,models{start,end,active,dateStart,dateEnd,dateTime},active}}'},res=>{
      if (res.data.errors && res.data.errors.length > 0) {
        this.setData({
          noData: true
        })
        return false;
      } else if (res.data.data.customer_product_available_times.length == 0) {
        this.setData({
          noData: true
        })
        return false;
      } else {
        
        var vData = res.data.data.customer_product_available_times;
        this.setData({
          start: '' + new Date().format('yyyy-MM-dd'),
          end: vData[vData.length-1].dateTime
        })
        this.setData({
          widthBox: (vData.length * 220) + 'rpx'
        })
        for (let i = 0; i < vData.length; i++) {
          vData[i].nIndex = '' + i;
          for (let a = 0; a < vData[i].models.length; a++) {
            vData[i].models[a].nIndex = '' + i + '-' + a;
            if (vData[i].models[a].end == null) {
              vData[i].models[a].showTime = vData[i].models[a].start
            } else {
              vData[i].models[a].showTime = vData[i].models[a].start + '-' + vData[i].models[a].end;
            }
          }
        }

        this.setData({
          times: vData
        })
      }
    })
  }
})