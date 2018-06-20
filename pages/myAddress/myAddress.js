var app = getApp();
Page({
  data: {
    list: [],
    saveDefault: '',
    isSelected: '',
    isMine:true,
    noData:false,
    isLoading:false,
    isIphoneX:false
  },
  onLoad: function (options) {
    this.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    setTimeout(()=>{
      this.getDataList();
    },1000)
  },
  backFn() {
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },
  
  // 获取地址列表
  getDataList() {
    this.setData({
      isLoading:true
    })
    app.req({ "query": 'query{customer_address_list{customer_address_id,default_address,province,city,area,customer_id,username,phone,address,lbs_lat,lbs_lng,sub_address}}'},res=>{
      this.setData({
        isLoading: false
      })
      if (res.data.error != undefined || res.data.data == null || res.data.errors && res.data.errors.length > 0) {
        console.log('接口出错')
        this.setData({
          noData: true,
        })
      } else if (res.data.data.customer_address_list.length == 0) {
        this.setData({
          noData: true,
        })
      } else {
        for (let i = 0; i < res.data.data.customer_address_list.length; i++) {
          var item = res.data.data.customer_address_list[i];
          if (item.default_address == 1) {
            this.setData({
              saveDefault: item.customer_address_id,
            })
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
  goToAttr(options) {
    var num = options.currentTarget.dataset.type
    var id = options.currentTarget.dataset.nid
    wx.setStorage({
      key: 'type',
      data: { type: num, isMine:this.data.isMine },
    })
    for (let i = 0; i < this.data.list.length; i++) {
      if (id == this.data.list[i].customer_address_id) {
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
  selectAddress(options) {
    
  },
  setDefault(options) {
    var id = options.currentTarget.dataset.id;
    app.req({ "query": 'mutation{customer_set_default_address(customer_address_id:"' + id + '"){status}}'},res=>{
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
    var nid = options.currentTarget.dataset.nid;
    wx.showModal({
      title: '提示',
      content: '确认删除当前地址？',
      success: res => {
        if (res.confirm) {
          this.delAddressFn(nid)
        }
      }
    })
  },
  delAddressFn(id) {
    app.req({ "query": 'mutation{customer_address_delete(customer_address_id:"' + id + '"){status}}' }, res => {
      if (typeof res.data.data.customer_address_delete.status != undefined && res.data.data.customer_address_delete.status == 0) {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          success: res => {
            var vPage = getCurrentPages().pop()
            if (vPage == undefined || vPage == null) return false;
            vPage.onLoad();
          }
        })
        wx.getStorage({ //如果用当前地址下过单，则删除缓存
          key: 'selectedAddress_' + app.globalData.customerId,
          success: res => {
            if (res.data.customer_address_id == this.data.addressId) {
              wx.removeStorage({
                key: 'selectedAddress_' + app.globalData.customerId,
                success: function (res) { },
              })
            }
          }
        })
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