var app=getApp();
Page({
  data: {
    reason:[
      '有事，暂时不需要服务',
      '时间有变，需要更改时间',
      '阿姨更换频繁',
      '阿姨告知本次不能服务，让用户取消'
    ],
    parentUrl:'',
    nIndex:null,
    orderId:'',
    otherContent:'',
    isOrder:null,
    errorTip:'',
    isIphoneX:false
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    wx.getStorage({
      key: 'payData',
      success:res=>{
        this.setData({
          orderId: res.data.orderId,
          isOrder: res.data.isOrder,
        })
      },
    })
  },
  selectIcon(options){
    var index=options.currentTarget.dataset.index;
    this.setData({
      nIndex:index
    })
  },
  backFn() {
    console.log(this.data.isOrder,'======>>>>>')
    if(this.data.isOrder){
      wx.switchTab({
        url: '/pages/order/order',
      })
    }else{
      wx.redirectTo({
        url: '/pages/orderDetail/orderDetail?id=' + this.data.orderId,
      })
    }
  },
  getOtherContent(options){
    this.setData({
      otherContent: options.detail.value
    })
  },
  cancelSubmit(){
    var content;
    if(this.data.nIndex == 'other'){
      content =this.data.otherContent
    }else{
      content = this.data.reason[this.data.nIndex];
    }
    if(content =='' || content == undefined){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择取消订单原因',
      })
      return false;
    }
    if(content.length>50){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '原因内容长度不能超过50个字符',
      })
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '确定要取消定单吗？',
      success:res=>{
        if(res.confirm){
          this.cancelOrder(this.data.orderId, content)
        }
      }
    })
  },
  cancelOrder(id,txt) {
    wx.showLoading({
      title: '请稍后',
    })
    // app.getmstCode(res=>{
      app.req({ "query": 'mutation{customer_order_cancel(pay_order_id:"' + id + '",remark_cancel:"' + txt + '"){status}}' }, res => {
        wx.hideLoading();
        if (res.data.errors && res.data.errors.length > 0) {
          this.setData({
            errorTip: res.data.errors[0].message
          })
          return false;
        } else {
          wx.showToast({
            title: '取消成功，3秒后跳转列表页',
            duration: 3000,
            success: res => {
              wx.switchTab({
                url: '/pages/order/order',
                success: function (e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();
                }
              })
            }
          })
        }
      })
    // })
    
  }
})