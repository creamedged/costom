var app=getApp();
Page({
  data: {
    detailContent:null,
    actionSheetHidden:true,
    isIphoneX:false,
  },
  backFn() {
    wx.removeStorageSync('coupon_' + app.globalData.customerId);
    wx.removeStorageSync('time_' + app.globalData.customerId)
    // wx.removeStorageSync('time_' + app.globalData.customerId)
    wx.removeStorageSync('detail_' + app.globalData.customerId)
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + this.data.detailContent.productId + '&skuId=' + this.data.detailContent.pskuId,
    })
  },
  onLoad: function () {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    this.getDetailStorage()
    // this.getDefaultAddress();
    // this.getTImeStorage()
    this.getAddressStorage()

  },
// 获取缓存
  getDetailStorage(){
    wx.getStorage({
      key: 'detail_' + app.globalData.customerId,
      success: res => {
        res.data.count=1;
        this.setData({
          detailContent:res.data
        })
        this.setDefaultConunt(res.data)
        this.getBestCount()
      }
    })
  },
  setDefaultConunt(obj){
    var countRedult=obj.term;
    if(countRedult.buy_multiple == 0){
      // 不允许购买多个
      return false;
    }
    this.setData({
      "detailContent.count":countRedult.buy_multiple_min
    })
  },
  
  getBestCount(){
    app.req({ "query": "{customer_best_coupon(psku_id:" + this.data.detailContent.pskuId + ",num:" + this.data.detailContent.count + ") {coupon_receive_id,name,value,unit,condition,useStartTime,useEndTime,expire,programme_type,coupon_id,status,programme}}" }, res => {
      this.setData({
        couponNews: res.data.data.customer_best_coupon
      })
      this.totalPrice();
    })
  },
  totalPrice(){
    console.log('+++++')
    app.req({ "query": 'query{customer_recalculate_price_v2(psku_id:"' + this.data.detailContent.pskuId + '",coupon_receive_id:"' + this.data.couponNews.coupon_receive_id + '",num:' + this.data.detailContent.count + '){payPrice,totalPrice,discountPrice}}' }, res => {
      console.log(res.data.data.customer_recalculate_price_v2,'=====')
      this.setData({
        allPrice: res.data.data.customer_recalculate_price_v2
      })
    })
  },

  // 地址部分
  getAddressStorage() {
    // wx.getStorage({ //地址缓存
    //   key: 'selectedAddress_' + app.globalData.customerId,
    //   success: res => {
    //     if (res.errMsg == 'getStorage:ok') {
    //       this.setData({
    //         isAddress: true,
    //         userName: res.data.username,
    //         phone: res.data.phone,
    //         address: res.data.address + res.data.sub_address,
    //         addressId: res.data.customer_address_id
    //       })
    //     }
    //   }, fail: res => {
        
    //     this.getDefaultAddress();
    //   }
    // })
    console.log(wx.getStorageSync('selectedAddress_' + app.globalData.customerId),'000000')
    var stroageAddress = wx.getStorageSync('selectedAddress_' + app.globalData.customerId);
    console.log(Boolean(stroageAddress),'====bol')
    if(!stroageAddress){
      console.log('getAddress')
      this.getDefaultAddress();
    }
    
  },
  getDefaultAddress() {
    console.log('======')
    app.req({ "query": 'query{customer_get_default_address {customer_address_id,customer_id,username,phone,address,default_address,sub_address}}' }, res => {
      if (res.data.errors && res.data.errors.length > 0 || res.data.data.customer_get_default_address == null) {
        this.setData({
          isAddress: false
        })
      } else {
        console.log(res, '========address')
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
})