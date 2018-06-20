var app=getApp();
Page({
  data: {
    isLoading:false,
    noData:false,
    data:[],
    title:'',
    isIphoneX:false
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    this.getList(options.cid);

  },
  getIndex(options) {
    var id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + id,
    })
  },
  backFn() {
    wx.navigateBack({
      data:1
    })
  },
  getList(id){
    this.setData({
      isLoading:true
    })
    aqq.req({ "query": 'query{customer_product_list_by_category_level_code(category_level_code:"' + id + '",page_index:1,count:3000){product_id,name,image_first,price_first,pricev_first,base_buyed}}'},res=>{
      this.setData({
        isLoading: false
      })
      if (res.data.errors != undefined && res.data.errors != null) {
        this.setData({
          noData: true
        })
      } else if (res.data.data.customer_product_list_by_category_level_code && res.data.data.customer_product_list_by_category_level_code.length == 0) {
        this.setData({
          noData: true
        })
      } else {
        this.setData({
          data: res.data.data.customer_product_list_by_category_level_code
        })
      }
    })
  }
})