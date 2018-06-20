var app=getApp();
Page({
  data: {
    phone:'',
    codeTxt:'获取验证码',
    code:'',
    isGetCode:true,
    timer:null,
    pass:'',
    copypass:'',
    isIphoneX:false
  },
  onLoad: function () {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    wx.getStorage({
      key: 'phoneNum',
      success:res=> {
        this.setData({
          phone:res.data
        })
      },
    })
  },
  downTime(){
    var s=60;
    this.data.timer=setInterval(()=>{
      s--;
      if(s==0){
        clearInterval(this.data.timer)
        this.setData({
          codeTxt:'重新获取',
          isGetCode:true
        })
      }else{
        this.setData({
          codeTxt:s+'秒后重新获取'
        })
      }
    },1000)
  },
  getCode(options){
    if(this.data.phone=='' || this.data.phone == undefined){
      wx.showModal({
        title: '提示',
        content: '手机号不能为空',
      })
      return false;
    }
    if(!this.data.isGetCode){return false}
    this.downTime();
    this.setData({
      isGetCode:false
    })
    app.req({ "query": 'mutation{customer_o_send_verification_code(phone:"' + this.data.phone + '"){status}}'},res=>{
      console.log(res)
    })
  },
  getPass(options){
    var value=options.detail.value;
    this.setData({
      pass:value
    })
  },
  passTow(options){
    var value=options.detail.value;
    console.log(value,'passtow')
    this.setData({
      copypass:value
    })
  },
  inputCode(options){
    this.setData({
      code:options.detail.value
    })
  },
  checkPass(){
    var reg=/^[0-9a-zA-Z]{6,20}$/;
    if(this.data.pass == '' ){
      this.setData({
        errorTip:'请输入新密码'
      })
      return false;
    }
    if(!reg.test(this.data.pass)){
      this.setData({
        errorTip:'新密码格式不正确'
      })
      return false;
    }
    if(this.data.copypass == ''){
      this.setData({
        errorTip:'请再次输入密码'
      })
      return false;
    }
    if (this.data.pass != this.data.copypass){
      this.setData({
        errorTip:'两次输入密码不一致'
      })
      return false;
    }
    return true;
  },
  checkCode(){
    var reg = /^[0-9]{4}$/;
    if (this.data.code == '') {
      this.setData({
        errorTip: '验证码不能为空'
      })
      return false;
    }
    if (!reg.test(this.data.code)) {
      this.setData({
        errorTip: '验证码输入不正确'
      })
      return false;
    }
    return true;
  },
  nextBtn(){
    if(!this.checkCode()){return false}
    if(!this.checkPass()){return false}
    this.setData({
      errorTip:''
    })
    app.req({ "query": 'mutation{customer_set_password(password: "' + this.data.pass + '",repeat:"' + this.data.copypass + '", phone: "' + this.data.phone + '", code: "' + this.data.code + '") { status }}'},res=>{
      console.log(res)
      if (res.data.errors && res.data.errors.length > 0) {
        console.log('报错了')
      } else {
        wx.redirectTo({
          url: '/pages/mine/mine',
        })
      }
    })
  }
})