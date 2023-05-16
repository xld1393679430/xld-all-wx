Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  onTap:function(event){
  //switchTab跳到有tab选项卡的页面，redirctTo和navigateTo不能跳到有tab页面
    wx.switchTab({
      url: '../posts/post',
    });
   
    // wx.redirectTo({
    //   url: '../posts/post',
    // })
  },
})