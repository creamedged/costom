// pages/searchAddress/searchAddress.js\
var app=getApp();
var amapFile = require('../../utils/amap-wx.js');
Page({
  data: {
    cityName:'北京',
    open: true,
    mark: 0,
    newmark: 0,
    istoright: false,
    cityList:[],
    nearbyList:[],
    isIphoneX:false,
    timer:null,
    addEditerContent:{},
    noData:false,
    cityCode:0,
    ad_info:{},
    noDataText:'附近没有搜索到地点',
    myAmapFun:null,
    isSearch:false,
  },
  onLoad: function (options) {
    this.data.myAmapFun = new amapFile.AMapWX({ key: '984e2430297ab022bd7762895e64fe01' });
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    wx.getStorage({
      key: 'tdata',
      success: res=> {
        this.setData({
          addEditerContent:res.data
        })
      },
    })
    this.openTips()
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/addEditer/addEditer',
    })
  },
  openTips(){  //获取用户权限设置
    wx.getSetting({
      success:res=>{
        if (res.authSetting['scope.userLocation'] == undefined){ //未授权过
          this.getAddress()
        } else if (!res.authSetting['scope.userLocation']){  //已授权但是false
          wx.showModal({
            title: '提示',
            content: '请开启定位功能，否则只能自己输入搜索',
            success:res=>{
              if(res.confirm){
                this.setting();
              }else{
                this.setData({
                  noData: true,
                  noDataText: '因为没有开启定位，无法搜索到附近的地址',
                  nearbyList:[],
                })
              }
            }
          })
        }else{ //授权了，且是true
          this.getAddress()
        }
      }
    })
  },
  setting(){ //调取权限设置
    wx.openSetting({
      success:res=>{
        this.getAddress();
      }
    })
  },
  getAddress(){ //获取当前地理位置
    wx.showLoading({
      title: '定位中.....',
    })
    this.setData({
      noData:false, 
    })
    wx.getLocation({
      type: 'gcj02',
      altitude:true,
      coord_type:1,
      success: res=> {
        console.log(res,'=====')
        this.setData({
          isSearch:false
        })
        this.convertAddress(res.longitude,res.latitude)
      },
      fail:res=>{
        wx.hideLoading()
        this.setData({
          noData:true,
          noDataText:'因为没有开启定位，无法搜索到附近的地址',
        })
      }
    })
  },
  convertAddress(lat,lng){ //坐标转换地址名称
    this.data.myAmapFun.getRegeo({
      location:lat+','+lng,
      success: data=> {
        console.log(data,'=====<<<>>>>')
        wx.hideLoading()
        //成功回调
        var item = data[0].regeocodeData.addressComponent;
        item.city = typeof item.city == 'string'?item.city:item.province;
        this.setData({
          ad_info:{
            province: item.province,
            city: item.city,
            district: item.district
          },
          cityCode: data[0].regeocodeData.addressComponent.citycode,
          nearbyList: data[0].regeocodeData.pois
        })
      },
      fail:info=> {
        //失败回调
        console.log(info)
      }
    })
  },
  custom(options){
    clearInterval(this.data.timer)
    if (options.detail.value ==''){return false;}
    this.data.timer=setInterval(()=>{
      this.searchByAddress(options.detail.value)
    },500)
  },
  searchByAddress(name){
    this.setData({
      noData:false,
      noDataText:'',
      isSearch:true
    })
    this.data.myAmapFun.getInputtips({
      keywords: name,
      type: '商务住宅|地名地址信息',
      city: this.data.cityCode || '110100',
      // city: 130000,
      citylimit:true,
      size:30,
      datatype:'all',
      success: data=> {
        clearInterval(this.data.timer)
        if(data.tips.length == 0){
          this.setData({
            noData: true,
            noDataText: '无法搜索到相关的地址'
          })
        }
        this.setData({
          nearbyList: data.tips
        })
      },
      fail:res=>{
        this.setData({
          noData: true,
          noDataText: '无法搜索到相关的地址'
        })
      }
    })
  },

  goToOrder(options){
    var index = options.currentTarget.dataset.index;
    var item = this.data.nearbyList[index];
    if(!this.data.isSearch){
      var ceshiAddress = '';
      if (this.data.ad_info.province == this.data.ad_info.city){
        ceshiAddress = this.data.ad_info.province + this.data.ad_info.district+item.name;
      }else{
        ceshiAddress = this.data.ad_info.province + this.data.ad_info.city + this.data.ad_info.district+ item.name;
      }
    }

    var address = this.data.isSearch ? item.district + item.name : ceshiAddress;
  
    // 省市区组合信息
    this.data.addEditerContent.address = address;  //带省市区
    this.data.addEditerContent.allAddress=item.name  //名称
    // 省市区信息
    this.data.addEditerContent.ad_info = this.data.ad_info
    // 解析经纬度
    var locaArr=item.location.split(',');
    var location={
      lat:locaArr[1],
      lng: locaArr[0]
    }
    // 坐标数据
    this.data.addEditerContent.location = location
    console.log(this.data.addEditerContent)
    wx.setStorage({
      key: 'tdata',
      data: this.data.addEditerContent,
    })
    wx.redirectTo({
      url: '/pages/addEditer/addEditer',
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindSelected(options) {
    var cid = options.currentTarget.dataset.id;
    var price = 'detailData.price_first';
    var pricev = 'detailData.pricev_first';
    for (var i = 0; i < this.data.actionSheetItems.length; i++) {
      var pid = this.data.actionSheetItems[i]['psku_id'];
      if (pid == cid) {
        var name = this.data.actionSheetItems[i].name;
        this.setData({
          selected: cid,
          actionSheetHidden: !this.data.actionSheetHidden,
          selectedItem: name,
          isStart: false,
          [price]: this.data.actionSheetItems[i].price,
          [pricev]: this.data.actionSheetItems[i].pricev
        })
        break;
      }
    }
  },

  tap_ch: function (e) {
    if (this.data.open) {
      this.setData({
        open: false
      });
    } else {
      this.setData({
        open: true
      });
    }
  },
  tap_start: function (e) {
    // touchstart事件
    this.data.mark = this.data.newmark = e.touches[0].pageX;
  },
  tap_drag: function (e) {

    this.data.newmark = e.touches[0].pageX;
    if (this.data.mark < this.data.newmark) {
      this.istoright = true;
    }

    if (this.data.mark > this.data.newmark) {
      this.istoright = false;
    }
    this.data.mark = this.data.newmark;

  },
  tap_end: function (e) {
    // touchend事件
    this.data.mark = 0;
    this.data.newmark = 0;
    if (this.istoright) {
      this.setData({
        open: true
      });
    } else {
      this.setData({
        open: false
      });
    }
  }
})