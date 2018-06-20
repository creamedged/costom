var app=getApp()
Page({
  data: {
    imgUrls: [],
    assort:[],
    skuList:[],
    isLoading:false,
    isReload:false,
    noData:false,
    groomList:[],
    selectedIndex:0,
    isIphoneX:false
  },
  
  onLoad: function () {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
// wx.clearStorage()
    var timer=setInterval(()=>{
      if (app.globalData.token) {
        clearInterval(timer)
        // 获取首界分类列表
        // this.getTypeList();
        // 获取首页，列表数据
        this.getBanner();
        this.groom();
        this.getSkuList();
        this.getUserNews();
        // app.getmstCode()
      }
    },100)
  },
  swiperChange(event){
    this.setData({
      selectedIndex:event.detail.current
    })
  },
  getUserNews() {
    if(app.globalData.userPhone == ''){
      app.req({"query": 'query{customer_info{phone,customer_id}}'}, res => {
        if (res.data.error) {return;}
        if (res.data.errors && res.data.errors.length > 0) {return;}
        app.globalData.customerId = res.data.data.customer_info.customer_id;
        app.globalData.userPhone = res.data.data.customer_info.phone;
      })
    }
  },
  groom(){
    app.req({ "query":'query{customer_recommendProducts(city_id:"110100"){product_id,name,image_first,lite_image}}'},res=>{
      if ((res.data.errors && res.data.errors.length > 0)) {
        return false;
      }
      if (res.data.data.customer_recommendProducts && res.data.data.customer_recommendProducts.length > 0) {
        this.setData({
          groomList: res.data.data.customer_recommendProducts
        })
      }
    })
  },
  getBanner(){
    app.req({
      "query": 'query{customer_banners(position:""){img_cover,href}}'},res=>{
      if ((res.data.errors && res.data.errors.length > 0)) {
        return false;
      }
      if (res.data.data.customer_banners && res.data.data.customer_banners.length > 0) {
        this.setData({
          imgUrls: res.data.data.customer_banners
        })
      }
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      isReload:true
    })
    this.getBanner();
    this.groom();
    // this.getTypeList();
    this.getSkuList();
  },
  
  bannerProduct(options){

    // native://webView?url=https://www.aobei.com
    // navtive://productDetail?product_id=
    var href = decodeURIComponent(options.currentTarget.dataset.href);   
    if (href.indexOf('productDetail') !=-1){
      var arr=href.split('?');
      var url=arr[1].split('=');
      if(url[0] =='product_id'){
        wx.navigateTo({
          url: '/pages/skuDetail/skuDetail?product_id='+url[1],
        })
      }
    }
  },
  // getTypeList() {  //获取首页产品类型
  //   app.req({ "query": 'query{customer_home_category_list{category_id,name,logo,pid,category_level_code}}'}, res => {
  //     if (this.data.isReload) {
  //       // wx.hideNavigationBarLoading();
  //     }
  //     this.setData({
  //       assort: res.data.data.customer_home_category_list
  //     })
  //   })
  // },
  goToList(options){
    var id = options.currentTarget.dataset.id, name = options.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/typeList/typeList?cid='+id+'&name='+name,
    })
  },
  getSkuList(){
    this.setData({
      isLoading:true
    })
    app.req({ "query": 'query{customer_homePageProducts(city_id:"110100",page_index:1,count:30){product_id,image_first,seo,name,price_first,pricev_first,base_buyed,descript,have,coupon_name,programme_type,recevied,unit,lite_image}}' }, res => {
      wx.hideLoading()
      if (this.data.isReload) {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh()
      }
      this.setData({
        isLoading: false
      })
    if ((res.data.errors && res.data.errors.length > 0) || (res.data.data.customer_homePageProducts && res.data.data.customer_homePageProducts.length == 0)) {
        this.setData({
          noData: true
        })
      } else {
        this.setData({
          skuList: res.data.data.customer_homePageProducts
        })
      }
    })
  },
  tips(){
    wx.showModal({
      title: '提示',
      content: '当前服务范围只限北京',
      showCancel:false,
      confirmColor:"#4196e9"
    })
  },
  getIndex(options){
    var id=options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/skuDetail/skuDetail?product_id='+id,
    })
  }
})
