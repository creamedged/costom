// pages/login/login.js
var app = getApp();
var utils = require('../../utils/util.js')
Page({
  data: {
    phoneNum: '',
    code: '',
    errorTip: '',
    btnText: '获取验证码',
    isGetCode: true,
    id: '',
    // tokenCode: '',
    dataUserInfo: "",
    url: '',
    skuId: '',
    isIphoneX:false
  },
  onLoad(options) {
    console.log(options,'===========')
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      id: options.id || '',
      url: options.url,
      skuId: options.skuId || ''
    })
  },
  getPhone(options) {
    this.setData({
      phoneNum: options.detail.value
    })
  },
  getCode(options) {
    this.setData({
      code: options.detail.value
    })
  },
  // 检测手机号
  checkPhone() {
    var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (this.data.phoneNum == '') {
      this.setData({
        errorTip: '手机号不能为空'
      })
      return false;
    }
    if (!phoneReg.test(this.data.phoneNum)) {
      this.setData({
        errorTip: '手机号输入错误'
      })
      return false;
    }
    return true;
  },
  backFn() {
    console.log(this.data.id,'================')
    if (this.data.id) {
      wx.redirectTo({
        url:'/'+this.data.url + '?product_id=' + this.data.id + '&skuId=' + this.data.skuId,
      })
    } else {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  // 验证，短信验证码
  checkCode() {
    var reg = /^[0-9]{6}$/;
    if (this.data.code == '') {
      this.setData({
        errorTip: '验证码不能为空'
      })
      return false;
    } else if (!reg.test(this.data.code)) {
      this.setData({
        errorTip: '验证码错误'
      })
      return false;
    }
    return true;
  },
  // 获取验证码
  getAjaxCode() {
    if(!this.checkPhone() || !this.data.isGetCode){return false;}
    this.countDown();
    this.setData({
      isGetCode: true
    })
    this.getToken('code');
  },
  countDown() {
    var s = 60;
    this.setData({
      errorTip: '',
      isGetCode:false
    })
    var timer = setInterval(() => {
      s--;
      if (s == 0) {
        clearInterval(timer);
        this.setData({
          isGetCode: true,
          btnText: '重新获取'
        })
      } else {
        this.setData({
          btnText: s + '秒后重新获取'
        })
      }
    }, 1000)
  },
  resultCode(res){  //获取code的结果函数
    if (res.data.errors == undefined || res.data.errors == null) {
      this.setData({
        isGetCode: false,
        btnText: '60秒后重新获取'
      })
    }
  },

  resultToken(res,time){  //获取token结果函数
    wx.hideLoading();
    if(res.data.error){
      if (res.data.errcode == '10013'){
        this.setData({
          errorTip:'验证码不存在'
        })
        return false;
      } else if (res.data.errcode == "10011"){
        this.setData({
          errorTip: '短信验证码超过次数'
        })
        return false;
      } else if (res.data.errcode == '10012'){
        this.setData({
          errorTip: '短信验证码过期'
        })
        return false;
      }else{
        this.setData({
          errorTip:'接口错误'
        })
        return false;
      }
    }
    app.globalData.uuid=res.data.uuid;
    app.globalData.token = 'Bearer ' + res.data.access_token;
    app.globalData.updateTokenData = res.data.refresh_token,
    // app.globalData.userId = res.data.uuid;
    this.getUserNews();
    clearInterval(app.data.touristTokenTimer)
    wx.setStorage({
      key: app.globalData.saveTokenKey + app.globalData.openId,
      data: {
        "token": {
          "time": app.globalData.serverTime + res.data.expires_in,
          "value": 'Bearer ' + res.data.access_token
        },
        "refresh_token": {
          "time": app.globalData.serverTime+(60*24*60*60),
          "value": res.data.refresh_token
        }
      },
      success:res=>{
        this.backFn()
      }
    })
  },
  getUserNews() {
    app.req({ "query": 'query{customer_info{phone,customer_id}}' }, res => {
      if (res.data.error) {
        return;
      }
      if (res.data.errors && res.data.errors.length > 0) {
        return;
      }
      app.globalData.customerId = res.data.data.customer_info.customer_id
      app.globalData.userPhone = res.data.data.customer_info.phone;
    })
  },
  // 获取token  /  获取验证码  走同一个接口
  getToken(key) {
    this.setData({
      errorTip: ''
    })
    wx.request({
      url: app.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'sms_code',
        phone: this.data.phoneNum,
        code: this.data.code || "",
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": app.globalData.systemInfo
      },
      success: res => {
        console.log(res,'====')
        if(key == 'code'){
          this.resultCode(res);
        }else if(key == 'token'){
          this.resultToken(res);
        }
      }
    })
  },

  // 登录按钮
  login() {
    if (this.checkPhone() && this.checkCode()) {
      this.setData({
        errorTip: ''
      })
      wx.showLoading({
        title: '登录中请稍后',
        mask: true
      })
      this.getToken('token') 
    }
  }
})