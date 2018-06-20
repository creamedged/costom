var app=getApp();
Page({
  data: {
    addressId:'',
    userName:'',
    phone:"",
    address:'',
    time:'',
    isAddress:null,
    count:1,
    productId:'',
    skuId:'',
    remark:'',
    imgUrl:'',
    couponList:'',
    selectCouponIndex:null,
    term:null,
    sumPriceTimer:null,
    unit:'',
    isDisabled:false,
    actionSheetHidden:true,
    isIphoneX:false
  },

  onLoad: function () {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    this.getDetailStorage()
    this.getTImeStorage()
    this.getAddressStorage()

  },
// 获取缓存
  getDetailStorage(){
    wx.getStorage({
      key: 'detail_' + app.globalData.customerId,
      success: res => {
        console.log(res,'========')
        this.setData({
          productName: res.data.pName,
          price: res.data.price,
          imgUrl: res.data.imgUrl,
          skuName: res.data.skuName,
          allPrice:res.data.allPrice,
          productId: res.data.productId,
          skuId: res.data.pskuId,
          remark: res.data.remark || '',
          term: res.data.term,
          unit: res.data.unit
        })
        // 按最低数量计算总价
        if (res.data.count) {
          this.setData({
            count: res.data.count,
            "allPrice.payPrice": res.data.count * res.data.price,
          })
        } else if (res.data.term.buy_multiple == 0) {
          this.setData({
            count: 1,
            allPrice: res.data.allPrice,
          })
        } else {
          this.setData({
            "allPrice.payPrice": res.data.term.buy_multiple_min * res.data.price,
            count: res.data.term.buy_multiple_min,
          })
        }
        this.getBestCoupon();
      }
    })
  },
  getTImeStorage(){
    wx.getStorage({  //时间缓存
      key: 'time_' + app.globalData.customerId,
      success: res => {
        res.data.startDate = res.data.date + ' ' + res.data.startTime;
        if (res.data.endTime == null) {
          res.data.endDate = ''
        } else {
          res.data.endDate = res.data.date + ' ' + res.data.endTime;
        }
        res.data.showTime = res.data.endTime == null ? res.data.date + ' ' + res.data.startTime : res.data.date + ' ' + res.data.startTime + '~' + res.data.endTime;
        this.setData({
          time: res.data
        })
      },
    })
  },
  getAddressStorage(){
    wx.getStorage({ //地址缓存
      key: 'selectedAddress_' + app.globalData.customerId,
      success: res => {
        if (res.errMsg == 'getStorage:ok') {
          this.setData({
            isAddress: true,
            userName: res.data.username,
            phone: res.data.phone,
            address: res.data.address + res.data.sub_address,
            addressId: res.data.customer_address_id
          })
        }
      }, fail: res => {
        this.getDefaultAddress();
      }
    })
  },
  backFn() {
    wx.removeStorageSync('coupon_' + app.globalData.customerId);
    wx.removeStorageSync('time_' + app.globalData.customerId)
    wx.removeStorageSync('detail_' + app.globalData.customerId)
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + this.data.productId + '&skuId=' + this.data.skuId,
    })
  },
  remarkTxt(options) { //备注
    var value = options.detail.value;
    this.setData({
      noteIcon:true,
      remark: value
    })
  },
  getDefaultAddress() { //获取默认址
    app.req({ "query": 'query{customer_get_default_address {customer_address_id,customer_id,username,phone,address,default_address,sub_address}}' }, res => {
      if (res.data.errors && res.data.errors.length > 0 || res.data.data.customer_get_default_address == null) {
        this.setData({
          isAddress: false
        })
      } else {
        var ad = res.data.data.customer_get_default_address;
        this.setData({
          isAddress: true,
          userName: ad.username,
          phone: ad.phone,
          address: ad.address + ad.sub_address,
          addressId: ad.customer_address_id
        })
      }
    })
  },  
  getBestCoupon(){
    app.req({ "query":"{customer_best_coupon(psku_id:"+this.data.skuId+",num:"+this.data.count+") {coupon_receive_id,name,value,unit,condition,useStartTime,useEndTime,expire,programme_type,coupon_id,status,programme}}"},res=>{
      this.setData({
        couponNews:{
          id: res.data.data.customer_best_coupon.coupon_receive_id,
          name: res.data.data.customer_best_coupon.name
        }
      })
      // console.log(this.data.skuId, '======', this.data.couponNews, '=====', this.data.count)
      
    })
  },
    
  sumPrice() {
    // 计算总价格
    app.req({ "query": 'query{customer_recalculate_price_v2(psku_id:"' + this.data.skuId + '",coupon_receive_id:"' + (this.data.couponNews.id || 0) + '",num:' + this.data.count + '){payPrice,totalPrice,discountPrice}}' }, res => {
      clearInterval(this.data.sumPriceTimer)
      this.setData({
        allPrice: res.data.data.customer_recalculate_price_v2
      })
    })
  },
  getCouponList() {
    app.req({ "query": 'query{customer_coupon_list_by_product(psku_id:' + this.data.skuId + ',page_index:1,count:30,num:' + this.data.count + '){coupon_receive_id,name,value,condition,useStartTime,useEndTime,expire,unit,programme}}' }, res => {
      if (res.data.data.customer_coupon_list_by_product && res.data.data.customer_coupon_list_by_product.length > 0) {
        this.setData({
          couponList: res.data.data.customer_coupon_list_by_product
        })
      } else {
        this.setData({
          noData: true
        })
      }
    })
  },
  
  selecteCoupon(options){
    this.setData({
      couponIcon:true
    })
    var index=options.currentTarget.dataset.index
    if(index == 'no'){
      this.setData({
        selectCouponIndex: index,
        couponNews:{
          id:'',
          name:''
        }
        // actionSheetHidden: !this.data.actionSheetHidden
      })
      this.sumPrice()
      return false
    }
    this.setData({
      selectCouponIndex:index,
      couponNews:{
        id: this.data.couponList[index].coupon_receive_id,
        name: this.data.couponList[index].name,
      }
    })
    this.sumPrice()
  },
  skuBtn(){
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  

  
  goToAddress(){ //跳转到地址列表
    this.setStorageDetail();
    wx.redirectTo({
      url: '/pages/addressList/addressList',
    })
  },
  goToTime(){   //跳转到时间列表
    if (this.data.addressId ==''){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请先选择服务地址',
      })
      return false;
    }
    this.setStorageDetail();
    wx.redirectTo({
      url: '/pages/timeList/timeList',
    })
  },
  setStorageDetail(){
    wx.setStorage({
      key: 'detail_' + app.globalData.customerId,
      data: {
        pName: this.data.productName,
        price: this.data.price,
        imgUrl: this.data.imgUrl,
        allPrice: this.data.allPrice,
        skuName: this.data.skuName,
        productId: this.data.productId,
        pskuId: this.data.skuId,
        remark: this.data.remark,
        addressId: this.data.addressId,
        term:this.data.term,
        unit:this.data.unit,
        count:this.data.count
      }
    })
  },

  countAdd(){   //数量加法
    var w=this.data.count;
    if(this.data.term.buy_multiple_max == 0){  //最大值为0时表示没有最大值可以任意加
      w++
    }else{
      if (w == this.data.term.buy_multiple_max){ //如果不为0时则要判断是否到最大值了
        w = this.data.term.buy_multiple_max;
        wx.showToast({
          title: '最大为' + this.data.term.buy_multiple_max + this.data.unit,
        })
        return false;
      }else{
        w++
      }
    }
    if (this.data.term.buy_multiple_o2o == 1) { //
      wx.removeStorage({
        key: 'time',
        success: function (res) {},
      })
      this.setData({
        time: {}
      })
    }
    this.setData({
      count:w
    })
    this.sumPrice()
  },
  countRedut(){  //数量减法
    var n=this.data.count;
    if (n <= this.data.term.buy_multiple_min){
      n = this.data.term.buy_multiple_min
      wx.showToast({
        title: '最小为'+this.data.term.buy_multiple_min+this.data.unit,
      })
      return false;
    }else{
      n--
    }
    this.setData({
      count:n
    })
    if (this.data.term.buy_multiple_o2o == 1) {
      this.setData({
        time: {}
      })
      wx.removeStorage({
        key: 'time',
        success: function (res) { },
      })
    }
    this.sumPrice()
  },
  countChange(options){
    if(isNaN(Number(options.detail.value))){
      options.detail.value = this.data.term.buy_multiple_min
      return false;
    }
    if (options.detail.value == '' || options.detail.value ==0){return false;}
    clearInterval(this.data.sumPriceTimer)
    if (this.data.term.buy_multiple_max != 0) {
      if (options.detail.value >= this.data.term.buy_multiple_max) {
        console.log('+++')
        options.detail.value = this.data.term.buy_multiple_max
        wx.showToast({
          title: '最大为' + this.data.term.buy_multiple_max + this.data.unit,
        })
      } 
    } else if (options.detail.value <= this.data.term.buy_multiple_min) {
      options.detail.value = this.data.term.buy_multiple_min
      wx.showToast({
        title: '最小为' + this.data.term.buy_multiple_min + this.data.unit,
      })
    }
    if (this.data.term.buy_multiple_o2o == 1){
      this.setData({
        time:{}
      })
      wx.removeStorage({
        key: 'time',
        success: function(res) {},
      })
    }
    this.data.sumPriceTimer=setInterval(()=>{
      this.setData({
        count: parseInt(options.detail.value)
      })
      this.sumPrice()
    },500)
  },

  submitBtn(){
    if (this.data.addressId == undefined || this.data.addressId == '') {
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择服务地址信息',
      })
      return false;
    }
    if (this.data.time.startDate == undefined && this.data.time.endDate==undefined){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择上门时间',
      })
      return false;
    }
    
    if(this.data.isDisabled){return false;}
    this.setData({
      isDisabled: true
    })
    
    app.getmstCode(res => {
      app.req({ "query": 'mutation{customer_create_order(order_input:{product_id:"' + this.data.productId + '",psku_id:"' + this.data.skuId + '",begin_datetime:"' + this.data.time.startDate + '",end_datatime:"' + this.data.time.endDate + '",customer_address_id:"' + this.data.addressId + '",coupon_receive_id:"' + (this.data.couponNews.id || 0) + '",num:' + this.data.count + ',remark:"' + this.data.remark.replace(/\s+/g, '') + '"}){pay_order_id,name,uid,price_total,create_datetime,price_discount}}'},res=>{
        if (res.data.errors && res.data.errors.length > 0 || res.data.eror) {
          console.log('接口错误')
          this.setData({
            isDisabled: false
          })
        } else {
          wx.removeStorageSync('time_' + app.globalData.customerId);
          wx.removeStorageSync('detail_'+app.globalData.uuid)
          wx.removeStorageSync('coupon_' + app.globalData.customerId)
          var vData = res.data.data.customer_create_order;
          // 清除所有cookie
          // 设置支付cookie
          wx.setStorage({
            key: 'payData',
            data: {
              orderId: vData.pay_order_id
            },
          })
          // 跳转界面
          wx.redirectTo({
            url: '/pages/payOrder/payOrder',
          })
        }
      }, { 'mts': res.data.data.apicode.code})
    })
  },

  hideDolog() {
    this.getCouponList()
      this.setData({
        actionSheetHidden: !this.data.actionSheetHidden
      })
  },
  fnFasl() {
    return false;
  },
  actionSheetTap: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
})