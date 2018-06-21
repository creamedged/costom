var app=getApp();
Page({
  data: {
    list:[],
    saveDefault:'',
    isSelected:'',
    isMine:false,
    isLoading:false,
    noData:false,
    isIphoneX:false,
    setDefault:true
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    this.getDataList();
    wx.getStorage({
      key: 'selectedAddress_' + app.globalData.customerId,
      success: res=> {
        this.setData({
          isSelected: res.data.customer_address_id
        })
      }
    })
  },
  // 获取地址列表
  getDataList(){
    // this.setData({
    //   isLoading:true
    // })
    wx.showLoading({
      title: '加载中.....',
    })
    app.req({ "query": 'query{customer_address_list{customer_address_id,default_address,province,city,area,customer_id,username,phone,address,lbs_lat,lbs_lng,sub_address}}'},res=>{
      // this.setData({
      //   isLoading: false
      // })
      wx.hideLoading()
      if (res.data.error != undefined || res.data.data == null || res.data.errors && res.data.errors.length > 0) {
        console.log('接口出错')
        this.setData({
          noData: true
        })
        return false;
      } else if (res.data.data.customer_address_list && res.data.data.customer_address_list.length == 0) {
        this.setData({
          noData: true
        })
        return false;
      } else {
        for (let i = 0; i < res.data.data.customer_address_list.length; i++) {
          var item = res.data.data.customer_address_list[i];
          if (item.default_address == 1) {
            this.setData({
              saveDefault: item.customer_address_id,
            })
            if (this.data.isSelected == '') {
              this.setData({
                isSelected: item.customer_address_id
              })
            }
            break;
          }
        }
        this.setData({
          list: res.data.data.customer_address_list
        })
      }
    })
  },
  // 进入新增和编辑地址界面
  goToAttr(options){
    var num = options.currentTarget.dataset.type
    var id = options.currentTarget.dataset.nid
    wx.removeStorageSync('time_' + app.globalData.customerId)
    wx.setStorage({
      key: 'type',
      data: { type: num, isMine:this.data.isMine},
    })
    for(let i=0; i<this.data.list.length; i++){
      if (id == this.data.list[i].customer_address_id){
        wx.setStorage({
          key: 'editer',
          data: this.data.list[i],
        })
        break;
      }
    }

    wx.redirectTo({
      url: '/pages/addEditer/addEditer'
    })
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/subOrder/subOrder',
    })
  },
  selectAddress(options){
    this.setData({
      isSelected: options.currentTarget.dataset.id
    })

    for(let i=0; i<this.data.list.length; i++){
      if (this.data.list[i].customer_address_id == options.currentTarget.dataset.id){
        wx.setStorage({
          key: 'selectedAddress_' + app.globalData.customerId,
          data: this.data.list[i]
        })
        wx.removeStorageSync('time_' + app.globalData.customerId)
        wx.redirectTo({
          url: '/pages/subOrder/subOrder',
        })
        break;
      }
    }
  },
  // 设置为默认值
  setDefault(options) {
    if (!this.data.setDefault){return false;}
    this.setData({
      setDefault:false
    })
    var id = options.currentTarget.dataset.id;
    // app.getmstCode(res=>{
      // this.setDefaultFn(res.data.data.apicode.code)
      this.setDefaultFn(id)
    // })
  },
  setDefaultFn(id){
    app.req({ "query": 'mutation{customer_set_default_address(customer_address_id:"' + id + '"){status}}'},res=>{
      this.setData({
        setDefault: true
      })
      if (res.data.data == null || res.data.errors && res.data.errors.length > 0) {
        console.log('不成功')
      } else {
        this.setData({
          saveDefault: id
        })
      }
    })
  },

  delAddress(options) {
    var nid= options.currentTarget.dataset.nid;
    wx.showModal({
      title: '提示',
      content: '确认删除当前地址？',
      success:res=>{
        if (res.confirm){
          this.delAddressFn(nid)
        }
      }
    })
  },
  delAddressFn(id) {
    console.log('=====')
    app.req({ "query": 'mutation{customer_address_delete(customer_address_id:"' + id + '"){status}}' }, res => {
      if (typeof res.data.data.customer_address_delete.status != undefined && res.data.data.customer_address_delete.status == 0) {
        wx.showToast({
          title: '删除成功',
          icon:'none',
          success:res=>{
            var vPage = getCurrentPages().pop()
            if (vPage == undefined || vPage == null) return false;
            vPage.onLoad();
          }
        })
        wx.getStorage({ //如果用当前地址下过单，则删除缓存
          key: 'selectedAddress_' + app.globalData.customerId,
          success: res => {
           
            if (res.data.customer_address_id == id) {
              wx.removeStorage({
                key: 'selectedAddress_' + app.globalData.customerId,
                success: function (res) { },
              })
            }
          }
        })
        
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: this.data.isMine ? '/pages/myAddress/myAddress' : '/pages/addressList/addressList',
        //     success: res => {
        //       var page = getCurrentPages().pop();
        //       if (page == undefined || page == null) return;
        //       page.onLoad();
        //     }
        //   })
        // }, 2000)
        
      } else {
        this.setData({
          requestOk: false
        })
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    })
  }
})