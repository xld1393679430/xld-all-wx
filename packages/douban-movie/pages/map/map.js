// pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markets:[{
      iconPath:'/images/dingwei.jpg',
      id:0,
      latitude:23.099994,
      longitude:113.321520,
      width:30,
      height:30
    }],
    polyline:[{
      points:[{
        longitude:113.3245211,
        latitude:23.10229
      },{
        longitude:113.324520,
        latitude:23.21229
      }],
      color:"#ff0000dd",
      width:5,
      dottedLine:true
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  markertap:function(e){
    wx.openLocation({
      latitude: 23.099994,
      longitude: 113.324521,
    })
  },
})