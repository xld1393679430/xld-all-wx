var postsData = require('../../../data/post-data.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlayingMusic: false
  },
  // 缓存的上限不超过10MB
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    var globalData = app.globalData;
    var postId = Number(options.id);
    this.data.currentPostId = postId;
    var oPostsData = postsData.postList[postId];
    this.setData({
      oPostsData: oPostsData
    })

    var postsCollected = wx.getStorageSync("posts_collected");
    if (postsCollected) {
      var postCollected = postsCollected[postId];
      this.setData({
        collected: postCollected,
      })
    } else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected)
    };
    if (app.globalData.g_isPlayingMusic 
      && app.globalData.g_currentmusicPostId === postId){
      this.setData({
        isPlayingMusic: true,
      })
    }else{
      this.setData({
        isPlayingMusic: false,
      })
    }
    that.setAudioMonitor();
   
  },
  setAudioMonitor:function(){
    var  that = this;
    wx.onBackgroundAudioPlay(function () {
      that.setData({
        isPlayingMusic: true
      })
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentmusicPostId = that.data.currentPostId;
    });
    wx.onBackgroundAudioPause(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentmusicPostId = null
    })
    wx.onBackgroundAudioStop(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentmusicPostId = null
    })
  },
  onCollectionTap: function (event) {
    // this.getPostCollectedAsy
    this.getPostCollectedSyc();
  },
  //同步缓存
  getPostCollectedAsy: function () {
    var that = this;
    wx.getStorage({
      key: 'posts_collected',
      success: function (res) {
        var postsCollected = wx.getStorageSync("posts_collected");
        var postCollected = postsCollected[this.data.currentPostId];
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        // this.showModal(postsCollected, postCollected);
        this.showToast(postsCollected, postCollected)
      },
    })
  },
  //异步缓存
  getPostCollectedSyc: function () {
    var postsCollected = wx.getStorageSync("posts_collected");
    var postCollected = postsCollected[this.data.currentPostId];
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    // this.showModal(postsCollected, postCollected);
    this.showToast(postsCollected, postCollected)
  },
  onShare: function (event) {
    var itemList = [
      '分享到微信好友',
      '分享到朋友圈',
      '分享到QQ',
      '分享到微博'
    ]
    wx.showActionSheet({
      itemList: itemList,
      itemColor: '#405f80',
      success: function (res) {
        console.log(res)
        //res.cancel 用户是不是点击了取消按钮
        wx.showModal({
          title: '用户' + itemList[res.tapIndex],
          content: '用户是否取消？现在无法实现分享，什么时候能支持呢',
        })
      },
    })
  },
  showModal: function (postsCollected, postCollected) {
    var that = this;
    wx.showModal({
      title: '收藏',
      content: postCollected ? '收藏该文章?' : '取消收藏该文章?',
      showCancel: 'true',
      cancelText: '取消',
      cancelColor: '#333',
      confirmText: '确认',
      confirmColor: '#405f80',
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync('posts_collected', postsCollected);
          that.setData({
            collected: postCollected,
          });
        }

      }
    })
  },
  showToast: function (postsCollected, postCollected) {
    wx.setStorageSync('posts_collected', postsCollected);
    this.setData({
      collected: postCollected,
    });
    wx.showToast({
      title: postCollected ? '收藏成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
  },
  onShareTap: function () {

  },
  onMusicTap: function (event) {
    var isPlayingMusic = this.data.isPlayingMusic;
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId]
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      })
    } else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg
      })
      this.setData({
        isPlayingMusic: true
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})