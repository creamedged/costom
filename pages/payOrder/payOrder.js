var app=getApp();
Page({
  data: {
    payData:{},
    time:30,
    CountDown:'',
    timer:null,
    orderId:'',
    cTime:'',
    prepayId:'',
    paySub:null,
    payBtn:'立即支付',
    isIphoneX:false
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    wx.getStorage({
      key: 'payData',
      success: res=> {
        this.setData({
          orderId:res.data.orderId
        })
        this.getOrderData(res.data.orderId);
        this.getPrepayId(res.data.orderId);
      },
    })
  },
  backFn() {
    wx.showModal({
      title: '确认要离开支付界面？',
      content: '您的订单在30分钟内未支付将被取消，请尽快完成支付',
      success:res=>{
        if(res.confirm){
          // 确认离开，跳转到订单列表界面
          wx.switchTab({
            url: '/pages/order/order',
            success:res=>{
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
                page.onLoad();
              }
          })
        }else{
          // 继续支付不跳转
        }
      }
    })
  },
  getOrderData(id){
    app.req({ "query": 'query{customer_get_order_to_pay(pay_order_id:"' + id + '") {pay_order_id,name,uid,channel,price_total,price_discount,price_pay,discount_data,pay_type,pay_status,create_datetime,pay_datetime,r_fee,r_status,r_datetime,r_finish_datetime,cus_username,customer_address_id,cus_phone,cus_province,cus_city,cus_area,cus_address,lbs_lat,lbs_lng,remark,remark_cancel,status_active,expire_datetime}}'},res=>{
      var vData = res.data.data.customer_get_order_to_pay
      this.setData({
        payData: vData
      })
      var expireTime = new Date(vData.expire_datetime);
      var dTime = expireTime.getTime() + new Date().getTimezoneOffset() * 60000;
      console.log(dTime, '====================', vData.expire_datetime)
      this.data.timer = setInterval(() => {
        this.downTime(dTime)
      }, 1000)
    })
  },
  addStr(n){
    return n>9?n:'0'+n;
  },
  downTime(value){
    var now = new Date().getTime();
    console.log(now,'=====>>>>')
    var t = value - now;
    // var t = 1529477294000 - now;
    console.log(value,'==================',now)
    var m = 0;
    var s = 0;
    if (t >= 0) {
      m = Math.floor(t / 1000 / 60 % 60);
      s = Math.floor(t / 1000 % 60);
    }
    if (t <= 0) {
      this.setData({
        CountDown:"订单超时"
      })
      wx.showModal({
        title: '提示',
        content: '订单超时',
        showCancel:false,
        success:res=>{
          if(res.confirm){
            this.goIndex()
          }
        }
      })
      clearInterval(this.data.timer);
    } else {
      this.setData({
        CountDown : '支付剩余时间:' + this.addStr(m) + ":" + this.addStr(s)
      })
    }
  },
  goIndex(){``
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getPrepayId(orderId){
    app.req({ "query": 'query{customer_wx_prepay(openid:"'+app.globalData.openId+'",pay_order_id: "' + orderId + '") {appId,timeStamp,nonceStr,_package,signType,sign}}'},res=>{
      this.setData({
        paySub: res.data.data.customer_wx_prepay
      })
    })
  },
  payNow(){
    if (this.data.CountDown == '订单超时'){
      wx.showModal({
        title: '提示',
        content: '订单超时，是否重新下单',
        success:res=>{
          if(res.confirm){
            this.goIndex();
          }
        }
      })
      return false;
    }
    var _this=this;
    
    wx.requestPayment({
      timeStamp:this.data.paySub.timeStamp,
      nonceStr:this.data.paySub.nonceStr,
      package:this.data.paySub._package,
      signType:this.data.paySub.signType,
      paySign:this.data.paySub.sign,
      success:res=>{
        this.getOrderPayStatus();
        wx.switchTab({
          url: '/pages/order/order',
          success: e => {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      },
      fail: res=> {
        console.log(res,'支付失败')
      },
      complete:res=>{
        console.log(res)
      }
    })
  },
  getOrderPayStatus(){
    app.req({ "query": 'query{customer_confirm_pay_status(pay_order_id: "' + this.data.orderId + '") {pay_order_id,pay_status}}'},res=>{
      console.log('getOrderStatus')
      wx.removeStorageSync('payData')
    })
  }
})