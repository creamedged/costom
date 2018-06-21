var app = getApp();
// var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    actionSheetHidden: true,
    actionSheetItems: [],
    selected: null,
    detailData: [],
    couponList: [],
    skuType: [],
    branch:5,
    allPrice:null,
    isIphoneX:false,
    selectedCoupon:[],
    toView: 'des_top',
    describe: [],
    selectedItem: '',
    skuPrice:'',
    pricev:'',
    isLogin: true,
    isNav:false,
    isStart: false,
    product_id: '',  //写错应该是pid
    selectedSkuId: '',
    unit: '',
    meUrl: '',
    skuError: '',
    orderId:'',
    url:'',
    isIphoneX:false,
  },

  onLoad: function (options) {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          wh: res.windowHeight
        })
      },
    })
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      product_id: options.product_id,
      selectedSkuId: options.skuId || '',
      orderId:options.orderid ||'',
      url:options.url||''
    })
    this.getDetailData(options.product_id);  
    this.getBrand(options.product_id);
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      meUrl: currentPage.route
    })
  },
  backFn() {
    if(this.data.url){
      if(this.data.orderId){
        wx.navigateTo({
          url: '/'+this.data.url+'?id='+this.data.orderId,
        })
        return false;
      }
      wx.switchTab({
        url: this.data.url,
      })
    }else{
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  scrollTopView(options){
    var top = parseInt(options.detail.scrollTop);
    var arr = this.data.arr;
    this.setData({
      toView: ''
    })
    if (top < arr[0]) {
      this.setData({
        ind: 0
      })
    } else if (arr[1] < top && top < arr[2]) {
      this.setData({
        ind: 1
      })
    } else if (arr[2] < top && top < arr[3]) {
      this.setData({
        ind: 2
      })
    } else if (arr[3] < top) {
      this.setData({
        ind: 3
      })
    }
    if(top >30){
      this.setData({
        isNav:true
      })
    }else{
      this.setData({
        isNav: false
      })
    }
  },
  jumpTo(options) {
    var id = options.currentTarget.dataset.id;
    this.setData({
      toView: 'des_' + id
    })
    if(id == 'top') {
      this.getDetailData(this.data.product_id);
    }
  },
  getCouponFn(options){
    // 判断是否登录了
    if (!app.globalData.userPhone) {
      wx.showModal({
        title: '用户提示',
        content: '请先登录',
        showCancel: false,
        confirmColor: '#00a0e9',
        success: res => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login?id=' + this.data.product_id + '&url=' + this.data.meUrl + '&skuId=' + this.data.selectedSkuId,
            })
          }
        }
      })
      return false;
    }
    if(options.currentTarget.dataset.status ==2){
      return false;
    }
    var arr = this.data.selectedCoupon;
    var id=options.currentTarget.dataset.id,index=options.currentTarget.dataset.index;
    var str ="couponList["+index+"].status";
    app.req({ "query":"mutation{customer_get_coupons(coupon_id:"+id+"){status,extra}}"},res=>{
      if(res.data.errors && res.data.errors.length > 0){
        wx.showToast({
          title: '领取失败',
          icon:"none"
        })
      }else{
        wx.showToast({
          title: '领取成功',
          icon: "none"
        })
        this.setData({
          [str]:2
        })
      }
    })
  },
  getDetailData(id) {
    app.req({
      "query": 'query{customer_product_detail(product_id:"' + id + '"){product{product_id,serviceitem_id,name,descript,images,image_first,lite_image,price_first,pricev_first,base_buyed,base_buyed,content,psku_id_first,lite_image},proSkus{psku_id,name,buy_multiple,buy_multiple_min,buy_multiple_max,unit,buy_multiple_o2o,price,buy_limit,pricev},couponResponse {name,value,programme_type,coupon_id,status},productTags{id,tag,url}}}'},res=>{
      this.setData({
        detailData: res.data.data.customer_product_detail.product,
        actionSheetItems: res.data.data.customer_product_detail.proSkus,
        isStart: res.data.data.customer_product_detail.proSkus.length > 1,
        couponList: res.data.data.customer_product_detail.couponResponse,
        describe: res.data.data.customer_product_detail.productTags
      })
      var desc = this.data.describe
      var _this = this,arr = [];
      for(var i=0;i<desc.length;i++){
        var query = wx.createSelectorQuery()
        query.select('#des_' + desc[i].id).boundingClientRect(function (res) {
          arr.push(res.top)
          _this.setData({
            arr: arr
          })
        }).exec()
      }
      // this.setData({
      //   selectedSkuId: this.data.actionSheetItems[0].psku_id,
      //   selectedItem: this.data.actionSheetItems[0].name,
      //   skuPrice: this.data.actionSheetItems[0].price,
      //   selected: this.data.actionSheetItems[0].psku_id
      // })
      var arrSku = res.data.data.customer_product_detail.proSkus;
      if (this.data.selectedSkuId) {  //回显，因为跳到登录之后返回要回显示
        for (let i = 0; i < arrSku.length; i++) {
          if (this.data.selectedSkuId == arrSku[i].psku_id) {
            this.setData({
              selectedItem: arrSku[i].name,
              selected: arrSku[i].psku_id,
              skuPrice: arrSku[i].price,
              pricev: arrSku[i].pricev,
              unit: arrSku[i].unit,
              'detailData.price_first': arrSku[i].price
            })
            break;
          }
        }
      }else{
        for (var i = 0; i < res.data.data.customer_product_detail.proSkus.length; i++){
          if (arrSku[i].psku_id == this.data.detailData.psku_id_first){
            this.setData({
              selectedSkuId: this.data.actionSheetItems[i].psku_id,
              selectedItem: this.data.actionSheetItems[i].name,
              skuPrice: this.data.actionSheetItems[i].price,
              pricev: this.data.actionSheetItems[i].pricev,
              selected: this.data.actionSheetItems[i].psku_id,
              unit: this.data.actionSheetItems[i].unit,
            })
          }
        }
      }
      // this.getSkuName(this.data.detailData.psku_id_first)
      // WxParse.wxParse('article', 'html', res.data.data.customer_product_detail.product.content, this, 0);
    })
  },

  getSkuName(skuId) {
    if (this.data.actionSheetItems.length != 1) {
      return false;
    }
    for (let i = 0; i < this.data.actionSheetItems.length; i++) {
      if (skuId == this.data.actionSheetItems[i].psku_id) {
        this.setData({
          selectedItem: this.data.actionSheetItems[i].name,
          selected: this.data.actionSheetItems[i].psku_id
        })
        break;
      }
    }
  },
  hideDolog() {
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
  bindSelected(options) {
    var cid = options.currentTarget.dataset.id;
    this.setData({
      selectedSkuId: cid
    })
    for (var i = 0; i < this.data.actionSheetItems.length; i++) {
      var pid = this.data.actionSheetItems[i]['psku_id'];
      if (pid == cid) {
        var name = this.data.actionSheetItems[i].name;
        this.setData({
          selected: cid,
          selectedItem: name,
          skuPrice: this.data.actionSheetItems[i].price,
          pricev: this.data.actionSheetItems[i].pricev,
          unit: this.data.actionSheetItems[i].unit,
          isStart: false,
        })
        break;
      }
    }
  },
  getInfo() {
    app.req({ "query": 'query{customer_info{customer_id}}' }, res => {
      if (res.data.errors && res.data.errors.length > 0) {
        this.setData({
          isLogin: false
        })
      } else {
        this.setData({
          isLogin: true
        })
      }
    })
  },

  skuBtn(options) {
    // sku列表里面的确定按钮
    if (this.data.selected == null || this.data.selected == '') {
      this.setData({
        skuError: '请选择服务类型'
      })
      return false;
    }
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden,
    })
    this.submitOrder(options)
  },
  submitBtn(options) {
    if (this.data.selected == null || this.data.selected == '') {
      this.actionSheetbindchange();
      return false;
    }
    this.submitOrder(options)
  },
  submitOrder(options) {
    this.setData({
      skuError: ''
    })
    if (!app.globalData.userPhone) {
      wx.showModal({
        title: '用户提示',
        content: '请先登录',
        showCancel: false,
        confirmColor: '#00a0e9',
        success: res => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login?id=' + this.data.product_id + '&url=' + this.data.meUrl + '&skuId=' + this.data.selectedSkuId,
            })
          }
        }
      })
      return false;
    }
    var term = null;
    for (var i = 0, n = this.data.actionSheetItems.length; i < n; i++) {
      var item = this.data.actionSheetItems[i];
      if (item.psku_id == this.data.selected) {
        term = {
          'buy_multiple': item.buy_multiple,
          'buy_multiple_max': item.buy_multiple_max,
          'buy_multiple_min': item.buy_multiple_min,
          'buy_multiple_o2o': item.buy_multiple_o2o
        }
      }
    }

    wx.setStorage({
      key: "detail_" + app.globalData.customerId,
      data: {
        productId: options.currentTarget.dataset.id,
        imgUrl: this.data.detailData.lite_image,
        pskuId: this.data.selected,
        pName: this.data.detailData.name,
        price: this.data.skuPrice,
        allPrice:{
          payPrice: this.data.skuPrice,
          totalPrice: this.data.pricev,
        },
        skuName: this.data.selectedItem,
        term: term,
        unit: this.data.unit || this.data.actionSheetItems[0].unit
      }
    })
    wx.navigateTo({
      url: '/pages/subOrder/subOrder',
    })
  },
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  getBrand(id){
    app.req({ "query": 'query{customer_productEvaluateBase(product_id:"'+id+'",num:0){avgScore,total,percent,percentStr}}'},res=>{
        if(res.data.data.customer_productEvaluateBase){
          res.data.data.customer_productEvaluateBase.avgScore = Math.round(res.data.data.customer_productEvaluateBase.avgScore)
          this.setData({
            score:res.data.data.customer_productEvaluateBase
          })
        }
    })
  },
  // 触摸移动事件
  touchMove: function (e) {
    var touchMove = e.touches[0].pageX;
    // 向左滑动   
    if (touchMove - touchDot <= -40 && time < 10) {
      if (tmpFlag && nth < nthMax) { //每次移动中且滑动时不超过最大值 只执行一次
        var tmp = this.data.menu.map(function (arr, index) {
          tmpFlag = false;
          if (arr.active) { // 当前的状态更改
            nth = index;
            ++nth;
            arr.active = nth > nthMax ? true : false;
          }
          if (nth == index) { // 下一个的状态更改
            arr.active = true;
            name = arr.value;
          }
          return arr;
        })
        this.getNews(name); // 获取新闻列表
        this.setData({ menu: tmp }); // 更新菜单
      }
    }
    // 向右滑动
    if (touchMove - touchDot >= 40 && time < 10) {
      if (tmpFlag && nth > 0) {
        nth = --nth < 0 ? 0 : nth;
        var tmp = this.data.menu.map(function (arr, index) {
          tmpFlag = false;
          arr.active = false;
          // 上一个的状态更改
          if (nth == index) {
            arr.active = true;
            name = arr.value;
          }
          return arr;
        })
        this.getNews(name); // 获取新闻列表
        this.setData({ menu: tmp }); // 更新菜单
      }
    }
    // touchDot = touchMove; //每移动一次把上一次的点作为原点（好像没啥用）
  },
  // 触摸结束事件
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval
    time = 0;
    tmpFlag = true; // 回复滑动事件
  }
})