Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onSwitchTap:function(event){
    console.log(event.detail.value)
  },
  onSlideTap:function(event){
    console.log(event.detail.value)
  },
  onRadioTap:function(event){
    console.log(event.detail.value)
  },
  onCheckBoxTap:function(event){
    console.log(event.detail.value)
  },
  fromSubmit:function(event){
   console.log(event.detail)
  },
  fromReset:function(){
    console.log('重置了')
  }
})