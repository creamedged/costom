var app=getApp();
Page({
  data: {
    orderId:"",
    detail:null,
    statusList: {
      'waitService': '待服务',
      'cancel': '已取消',
      'waitPay': '待付款',
      'payed': '已支付',
      'done': '已完成',
      'refused': '已拒单',
      'waitRefund': '待退款',
      'partRefund': '已部分退款',
      'refunded': '已退款'
    },
    cancelContent:'',
    isIphoneX:false
  },
  onLoad: function (options) {
    console.log(options,'=======')
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      orderId:options.id
    })
    wx.getStorage({
      key: 'cancel',
      success: res=> {
        this.setData({
          cancelContent:res.data
        })
      },
    })
    this.getDetail();
  },
  backFn(){
    wx.switchTab({
      url: '/pages/order/order',
    })
  },
  getDetail(){
    this.setData({
      detail:null
    })
    app.req({ "query": 'query{customer_order_detail(pay_order_id:"' + this.data.orderId + '") {pay_order_id,name,price_total,price_discount,price_pay,orderStatus,cus_username,cus_phone,customer_address,unit,customer_address_id,num,create_datetime,serviceStatus,image_first,lite_image,product_id,proSku_id,c_begin_datetime,c_end_datetime,isEvaluate,remark}}'},res=>{
      this.setData({
        detail: res.data.data.customer_order_detail
      })
    })
  },
  goToDetail(options){
    var pid = options.currentTarget.dataset.id;
    var skuid=options.currentTarget.dataset.skuid;
    var orderid=options.currentTarget.dataset.orderid;
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + pid +'&skuId='+skuid+'&orderid='+orderid+'&url=pages/orderDetail/orderDetail',
    })
  },
  // 去评价
  goToStore(){
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: this.data.orderId,
        backUrl:'/pages/orderDetail/orderDetail',
        isOrder:false
      },
    })
    wx.redirectTo({
      url: '/pages/comment/comment',
    })
  },
  // 立即支付
  payNow(){
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: this.data.orderId
      },
    })
    // 跳转界面
    wx.navigateTo({
      url: '/pages/payOrder/payOrder',
    })
  },
  cancelOrder(){
    var payDataCopy={}
    wx.getStorage({
      key: 'payData',
      success: res=> {
        payDataCopy=res.data;
      },
    })
    payDataCopy.orderId = this.data.orderId;
    payDataCopy.isOrder=false;
    console.log(payDataCopy,'======')
    wx.setStorage({
      key: 'payData',
      data: payDataCopy,
      success:res=>{
        wx.redirectTo({
          url: '/pages/cancel/cancel',
        })
      }
    })
    
  },
  okOrder(){
    app.req({ "query": 'mutation{customer_service_complete(pay_order_id:"' + this.data.orderId + '"){status}}'},res=>{
      if (res.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: res.data.errors[0].message,
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '确认成功',
          success: res => {
            this.getDetail();
          }
        })
      }
    })
  }
})