//bindtap不会阻止事件冒泡，catchtap可以阻止事件冒泡
var postsData = require('../../data/post-data.js')
Page({
  data: {
  },
  onPostTap:function(event){
    var postId = event.currentTarget.dataset.postid;
    wx.navigateTo({
      url: 'post-detail/post-detail?id=' + postId,
    })
  },
  // onSwiperItemTap: function (event){
    // var postId = event.currentTarget.dataset.postid;
    // wx.navigateTo({
    //   url: 'post-detail/post-detail?id=' + postId,
    // })
  // },
  onSwiperTap:function(event){
    //target 和 currentTarget
    //targets指的是当前点击的组件，currentTarget指的是事件捕获的组件
    //target这里指的是image,而currentTarget指的是swiper
    var postId = event.target.dataset.postid;
    wx.navigateTo({
      url: 'post-detail/post-detail?id=' + postId,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      postList: postsData.postList
    })
  },
})