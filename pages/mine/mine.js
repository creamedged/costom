var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    serverNum:'400-0366-333',
    isLogin:false,
    url:{
      phone:'/pages/changePhone/changePhone',
      password:'/pages/setPass/setPass',
      coupon:'/pages/myCoupon/myCoupon',
      address:'/pages/myAddress/myAddress',
      about:'/pages/about/about'
    },
    meUrl:'',
    isIphoneX:false
  },

  onLoad: function (options) {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      meUrl: currentPage.route
    })
    this.getInfo();
  },
  onShow(){
    if (this.data.isLogin){
      this.getInfo();
    }
  },
  onHide(){
    this.setData({
      isLogin:true
    })
  },
  getPhone(options) {
    var phone = options.currentTarget.dataset.phone;
    this.setData({
      phoneNum: phone
    })
    this.calling();
  },
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNum, //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  
  getInfo() {
    // app.req({ "query": 'query{customer_info{customer_id,phone}}'},res=>{
    //   if (res.data.errors && res.data.errors.length > 0) {
        // wx.showModal({
        //   title: '用户提示',
        //   content: '请先登录',
        //   showCancel: false,
        //   confirmColor: '#00a0e9',
        //   success: res => {
        //     if (res.confirm) {
        //       wx.redirectTo({
        //         url: '/pages/login/login?url=' + this.data.meUrl,
        //         // url: '/pages/demo/demo',
        //       })
        //     }
        //   }
        // })
    //   } else {
        // app.globalData.customerId = res.data.data.customer_info.customer_id;
        // this.setData({
        //   phone: res.data.data.customer_info.phone,
        //   isLogin: true
        // })
    //   }
    // })
    if(app.globalData.userPhone){
      this.setData({
        phone: app.globalData.userPhone,
        isLogin: true
      })
    }else{
      wx.showModal({
        title: '用户提示',
        content: '请先登录',
        showCancel: false,
        confirmColor: '#00a0e9',
        success: res => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login?url=' + this.data.meUrl,
              // url: '/pages/demo/demo',
            })
          }
        }
      })
    }
  },
  goToUrl(options){
    var key=options.currentTarget.dataset.key;
    var path=this.data.url[key];
    wx.navigateTo({
      url:path,
    })
  }
})