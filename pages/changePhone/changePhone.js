var app=getApp();
Page({
  data: {
    phone:'',
    code:'',
    errorTip:'',
    timer:null,
    timeTxt:'获取验证码',
    isGetCode:true,
    isIphoneX:false
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
  },
  backFn() {
    wx.switchTab({
      url:'/pages/mine/mine'
    })
  },
  getPhone(options){
    this.setData({
      phone: options.detail.value
    })
  },
  getCode(options) {
    this.setData({
      code: options.detail.value
    })
  },
  downTime(){
    var time=60;
    this.data.timer=setInterval(()=>{
      if(time==0){
        this.setData({
          timeTxt:'重新获取',
          isGetCode:true
        })
        clearInterval(this.data.timer);
        return false;
      }
      time--;
      this.setData({
        timeTxt:time+'秒后重新获取'
      })
    },1000)
  },
  getAjaxCode(){
    if (!this.checkPhone()){return false;}
    if (!this.data.isGetCode){return false;}
    this.setData({
      isGetCode:false
    })
    this.downTime();
    // app.getmstCode(res=>{
      app.req({ "query": 'mutation{customer_n_send_verification_code(phone:"' + this.data.phone + '"){status}}' }, res => {
        if (res.data.data.errors && res.data.data.errors.length > 0) {
          wx.showToast({
            icon: 'none',
            title: '获取验证码失败',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取验证码成功',
          })
        }
      })
    // })
  },
  checkPhone () {
    var reg =/^1[3|4|5|7|8]\d{9}$/;
    if (this.data.phone == '') {
      this.setData({
        errorTip:"手机号不能为空"
      })
      return  false;
    } 
    if (!reg.test(this.data.phone)) {
      this.setData({
        errorTip:'手机号输入不正确'
      })
      return false;
    }
    this.setData({
      errorTip:''
    })
    return  true;
  },
  checkCode () {
    var reg = /\d{4}/;
    if (this.data.code == "") {
      this.setData({
        errorTip:'验证码不能为空'
      })
      return  false;
    } else if (!reg.test(this.data.code)) {
      this.setData({
        errorTip:'验证码不正确'
      })
      return  false;
    }
    this.setData({
      errorTip:''
    })
    return true
  },
  submitOk(){
    if (!(this.checkPhone() && this.checkCode())){return false;}
    wx.showLoading({
      title: '请稍后再提交',
      mask:true
    })
    app.req({ "query": 'mutation{customer_change_phone(phone:"' + this.data.phone + '",code:"' + this.data.code + '"){status}}'},res=>{
      wx.hideLoading()
      if (res.data.errors && res.data.errors.length > 0) {
        if (res.data.errors[0].errcode == '41017') {
          this.setData({
            errorTip: res.data.errors[0].message
          })
        } else {
          this.setData({
            errorTip: '修改失败'
          })
        }
      } else {
        this.setData({
          errorTip: ''
        })
        wx.switchTab({
          url: '/pages/mine/mine',
        })
      }
    })
  }
})