var app=getApp();
Page({
  data: {
    couponList:[],
    couponId:'',
    couponName:'',
    skuId:'',
    num:1,
    isLoading:false,
    isMine:false,
    noData:false,
    isUseCoupon:false,
    isIphoneX: false
  },
  onLoad: function (options) {
    this.setData({
      skuId:options.skuId,
      isIphoneX: app.globalData.isIphoneX
    })
    wx.getStorage({
      key: 'coupon_' + app.globalData.customerId,
      success: res=> {
        this.setData({
          couponId: res.data.id
        })
      },
    })
    this.getCouponList();
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/subOrder/subOrder',
    })
  },
  nouserCoupon(){
    this.setData({
      isUseCoupon : !this.data.isUseCoupon,
      couponId:''
    })
    if(this.data.isUseCoupon){
      wx.removeStorage({
        key: 'coupon_' + app.globalData.customerId,
        success: function(res) {},
      })
    }
  },
  getCouponList(){
    this.setData({
      isLoading:true
    })
    app.req({ "query": 'query{customer_coupon_list_by_product(psku_id:' + this.data.skuId + ',page_index:1,count:300,num:' + this.data.num + '){coupon_receive_id,name,value,condition,useStartTime,useEndTime,expire,unit}}'},res=>{
      this.setData({
        isLoading: false
      })
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
  selected(options){
    this.setData({
      couponId: options.currentTarget.dataset.id,
      isUseCoupon:false
    })
  },
  couponUse(){
    if (this.data.couponId == '' && !this.data.isUseCoupon){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择优惠券',
      })
    }else{
      if(this.data.couponId){
        console.log(this.data.couponList)
        for (let i = 0; i < this.data.couponList.length; i++){
          let item=this.data.couponList[i];
          if (this.data.couponId == item.coupon_receive_id){
            console.log('有')
            this.setData({
              couponName:item.name,
            })
            break;
          }
        }
        wx.setStorage({
          key: 'coupon_'+ app.globalData.customerId,
          data: {
            id: this.data.couponId,
            name: this.data.couponName
          },
        })
      }
      wx.redirectTo({
        url: '/pages/subOrder/subOrder',
        success:res=>{
          console.log('success')
        }
      })
    }
  }
})