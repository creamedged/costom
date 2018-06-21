var app=getApp();
var amapFile = require('../../utils/amap-wx.js');
Page({
  data: {
    type:'',
    userName:'',
    phone:'',
    address:'',
    addressId:'',
    ad_info:{},
    location:{},
    defaultPhone:'',
    isMine:null,
    isDefault:true,
    allAddress:'',
    isIphoneX:false,
    errorTip:'',
    detailed:'',
    nType: '',
    requestOK:false
  },
  onLoad: function (options) {
    // console.log(app.globalData.)
    // 保存当前用户所填信息
    this.data.myAmapFun = new amapFile.AMapWX({ key: '984e2430297ab022bd7762895e64fe01' });
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      defaultPhone: app.globalData.userPhone
    })
    this.setData({
      nType: wx.getStorageSync('type')
    })
    wx.getStorage({   //选择地址返回时提取缓存填充信息
      key: 'tdata',
      success: res => {
        this.setData({
          userName: res.data.userName,
          phone: res.data.phone,
          addressId:res.data.addressId,
          address: res.data.address,
          allAddress: res.data.allAddress,
          isDefault: res.data.isDefault,
          detailed: res.data.detailed||'',
          ad_info: res.data.ad_info||'',
          location: res.data.location,
          isMine:res.data.isMine
        })
        wx.removeStorageSync('tdata')
      },fail:res=>{       
        this.getAddressType()
      }
    })
  },
  backFn() {
    wx.removeStorageSync('editer')
    wx.removeStorageSync('tdata')
    wx.removeStorageSync('type')
    if (this.data.isMine) {
      wx.redirectTo({
        url: '/pages/myAddress/myAddress',
      })
    } else {
      wx.redirectTo({
        url: '/pages/addressList/addressList',
      })
    } 
  },
  getAddressType(){
    this.setData({
      type: this.data.nType.type ? this.data.nType.type : 0,
      isMine: this.data.nType.isMine
    })
    if (this.data.nType.type ==1){
      var editerAddress = wx.getStorageSync('editer');
      this.setData({
        addressId: editerAddress.customer_address_id,
        userName: editerAddress.username,
        phone: editerAddress.phone,
        allAddress:editerAddress.address,
        address: editerAddress.address,
        isDefault: editerAddress.default_address,
        detailed: editerAddress.sub_address,
        location:{
          lat: editerAddress.lbs_lat,
          lng: editerAddress.lbs_lng
        }
      })
    }else{
      this.openTips()
    }
  },
  getLength(str){
    console.log(str,'=====')
    var l = str.length; 
    var unicodeLen = 0; 
    for(let i = 0; i<l; i++) { 
      if ((str.charCodeAt(i) > 127)) {
        unicodeLen++;
      }
      unicodeLen++;
    }
    return unicodeLen; 
  },
  getUserName(options){
    this.setData({
      userName: options.detail.value
    })
    return false;
  },
  getPhone(options){
    this.setData({
      phone:options.detail.value
    })
  },
  getAddressContent(options){
    this.setData({
      detailed:options.detail.value
    })
  },
  check(){
    var reg = /^1(3|4|5|7|8)\d{9}$/;
    // 联系人
    if(this.data.userName ==''){
      this.setData({
        errorTip:'联系人不能为空'
      })
      return false;
    } else if (this.getLength(this.data.userName) >30){
      this.setData({
        errorTip: '请填写长度30个字符以内的联系人'
      })
      return false;
    }
    // 手机号
    if(this.data.phone == ''){
      if(this.data.defaultPhone ==''){
        this.setData({
          errorTip: '手机号不能为空'
        })
        return false;
      }else{
        this.setData({
          // errorTip: '手机号不能为空'
          phone: this.data.defaultPhone
        })
      }
      
    } else if (!reg.test(this.data.phone)){
      this.setData({
        errorTip:'手机号格式不正确'
      })
      return false;
    }
    if (this.data.address ==''){
      this.setData({
        errorTip: '服务地址不能为空'
      })
      return false;
    }
    if (this.data.detailed == ''){
      this.setData({
        errorTip: '详细地址不能为空'
      })
      return false;
    }
    return true;
  },
  goToAdd(){
    wx.setStorage({
      key: 'tdata',
      data: this.data,
    })
    wx.redirectTo({
      url: '/pages/searchAddress/searchAddress',
    })
  },
  add(){
    if (!this.check() && !this.data.requestOK){return false;}
    this.setData({
      requestOK:true
    })
    app.getmstCode(res=>{
      this.addFn(res.data.data.apicode.code)
    })
  },
  addFn(mtsCode){
    var addressJson={
      customer_address_id:'',
      default_address: Number(this.data.isDefault),
      customer_id:'',
      username: this.data.userName,
      phone: this.data.phone,
      address:this.data.address,
      lbs_lat: this.data.location.lat ,
      lbs_lng: this.data.location.lng,
      sub_address: this.data.detailed
    }
    app.req({ "query": 'mutation{customer_address_add (customer_address_input:{username:"' + this.data.userName + '",phone:"' + this.data.phone + '",province:"' + this.data.ad_info.province + '",city:"' + this.data.ad_info.city + '",district:"' + this.data.ad_info.district + '",address:"' + this.data.address + '",lbs_lat:"' + this.data.location.lat + '",lbs_lng:"' + this.data.location.lng + '",default_address:0,sub_address:"' + this.data.detailed + '"}){customer_address_id,customer_id,username,phone,address,sub_address}}' }, res => {
      if (res.data.errors && res.data.errors.length > 1) {
        console.log('新增失败')
        this.setData({
          requestOK: false
        })
      } else {
        wx.removeStorage({
          key: 'address',
          success: function (res) { },
        })
        wx.removeStorage({
          key: 'tdata',
          success: function (res) { },
        })
        wx.removeStorageSync('type')
        this.setData({
          addressId: res.data.data.customer_address_add.customer_address_id
        })
        addressJson.customer_address_id = res.data.data.customer_address_add.customer_address_id;
        if (this.data.isMine) {
          wx.redirectTo({
            url: '/pages/myAddress/myAddress',
          })
        } else {
          this.updateSelectedAddress(res.data.data.customer_address_add);
          wx.redirectTo({
            url: '/pages/subOrder/subOrder',
          })
        }
      }
    }, { "mts": mtsCode})
  },
  switch1Change(options){
    this.setData({
      isDefault:options.detail.value
    })
  },
  clearPhone(){
    this.setData({
      phone:'',
      defaultPhone:''
    })
  },
  editerSave() {
    if (!this.check() && !this.data.requestOk) { return false; }
    this.setData({
      requestOK: true
    })
    this.editerSaveFn()
  },
  editerSaveFn(mstCode){
    
    app.req({ "query": 'mutation{customer_address_update (customer_address_input:{customer_address_id:"' + this.data.addressId + '",username:"' + this.data.userName + '",phone:"' + this.data.phone + '",province:"' + this.data.ad_info.province + '",city:"' + this.data.ad_info.city + '",district:"' + this.data.ad_info.district + '",address:"' + this.data.address + '",lbs_lat:"' + this.data.location.lat + '",lbs_lng:"' + this.data.location.lng + '",default_address:' + Number(this.data.isDefault) + ',sub_address:"' + this.data.detailed + '"}){customer_address_id,customer_id,username,phone,address,sub_address}}'}, res => {
      if (res.data.errors && res.data.errors.length > 0 || res.data.data == null) {
        this.setData({
          requestOk: false
        })
      } else {
        wx.removeStorage({
          key: 'tdata',
          success: function (res) { },
        })
        wx.removeStorage({
          key: 'editer',
          success: function (res) { },
        })
        this.setData({
          addressId: res.data.data.customer_address_update.customer_address_id
        })
        // wx.setStorage({
        //   key: 'addressId',
        //   data: res.data.data.customer_address_update.customer_address_id,
        // })
        this.updateSelectedAddress(res.data.data.customer_address_update);
        if (this.data.isMine) {
          wx.redirectTo({
            url: '/pages/myAddress/myAddress',
          })
        } else {
          wx.redirectTo({
            url: '/pages/subOrder/subOrder',
          })
        }
      }
    })
  },
  updateSelectedAddress(data){
    wx.setStorage({
      key: 'selectedAddress_' + app.globalData.customerId,
      data: { 
        "customer_address_id": data.customer_address_id, 
        "username": data.username, 
        "phone": data.phone,
        "address": data.address, 
        "allAddress": data.address,
        "sub_address": data.sub_address 
        },
    })
  },
  // 定位
  openTips() {  //获取用户权限设置
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation'] == undefined) { //未授权过
          this.getAddress()
        } else if (!res.authSetting['scope.userLocation']) {  //已授权但是false
          wx.showModal({
            title: '提示',
            content: '请开启定位功能，否则只能自己输入搜索',
            success: res => {
              if (res.confirm) {
                this.setting();
              } else {
                this.setData({
                  noData: true,
                  noDataText: '因为没有开启定位，无法搜索到附近的地址',
                  nearbyList: [],
                })
              }
            }
          })
        } else { //授权了，且是true
          this.getAddress()
        }
      }
    })
  },
  setting() { //调取权限设置
    wx.openSetting({
      success: res => {
        this.getAddress();
      }
    })
  },
  getAddress() { //获取当前地理位置
    wx.showLoading({
      title: '定位中.....',
    })
    this.setData({
      noData: false,
    })
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      coord_type: 1,
      success: res => {
        this.setData({
          isSearch: false
        })
        this.convertAddress(res.longitude, res.latitude)
      },
      fail: res => {
        wx.hideLoading()
        this.setData({
          noData: true,
          noDataText: '因为没有开启定位，无法搜索到附近的地址',
        })
      }
    })
  },
  convertAddress(lat, lng) { //坐标转换地址名称
    this.data.myAmapFun.getRegeo({
      location: lat + ',' + lng,
      success: data => {
        wx.hideLoading()
        var item = data[0].regeocodeData.addressComponent;
        item.city = typeof item.city == 'string' ? item.city : item.province;
        var locaArr = data[0].regeocodeData.pois[0].location.split(',');
        var location = {
          lat: locaArr[1],
          lng: locaArr[0]
        }
        var str = item.province == item.city ? item.province + item.district + data[0].regeocodeData.pois[0].name : item.province + item.city + item.district + data[0].regeocodeData.pois[0].name;
          this.setData({
          address: str,
          allAddress: data[0].regeocodeData.pois[0].name,
          ad_info: {
            province: item.province,
            city: item.city,
            district: item.district
          },
          location: location,
        })
      },
      fail: info => {
        //失败回调
        console.log(info)
      }
    })
  }
})