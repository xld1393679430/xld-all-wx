
var util = require('../../utils/utils.js')
var myData = require('../../data/post-data.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ineaters: {},
    comingSoon: {},
    top250: {},
    containerShow:true,
    searchPanelShow:false,
    searchResult:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var ineatersUrl = app.globalData.doubanBase + "/v2/movie/in_theaters" + "?start=0&count=3";
    var comingSoonUrl = app.globalData.doubanBase + "/v2/movie/coming_soon" + "?start=0&count=3";
    var top250Url = app.globalData.doubanBase + "/v2/movie/top250" + "?start=0&count=3";
    that.processDoubanData(myData.ineaters, "ineaters","正在热映")
    that.processDoubanData(myData.comingSoon, "comingSoon","即将上映")
    that.processDoubanData(myData.top250, "top250","豆瓣Top250")
    // this.getMovieListData(ineatersUrl, "ineaters");
    // this.getMovieListData(comingSoonUrl, "comingSoon");
    // this.getMovieListData(top250Url, "top250");
  },
  getMovieListData: function (url, settedKey, categoryTitle) {
    var that = this;
    wx.request({
      url: url,
      data: {},
      method: "GET",
      header: {
        'Content-Type': 'json'
      },
      success: function (res) {
        that.processDoubanData(res.data, settedKey,categoryTitle)
      },
      fail: function (res) {
      },
      complete: function () {

      }
    })
  },
  processDoubanData: function (moviesDouban, settedKey,categoryTitle) {
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;

      if (title.length >= 6) {
        title = title.substring(0, 6) + '...';
      };
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp)
    }
    var readyData = {};
    readyData[settedKey] = {
      categoryTitle:categoryTitle,
      movies: movies
    };
    this.setData(readyData)
  },
  onMoreTap:function(event){
    var category = event.currentTarget.dataset.category
    wx.navigateTo({
      url: 'more-movie/more-movie?category=' + category,
    })
  },
  onCancelImgTap:function(){
    this.setData({
      containerShow: true,
      searchPanelShow: false,
      // searchResult:{}
    })
  },
  onBindFocues:function(){
    // console.log("onBindFocues")
    this.setData({
      containerShow:false,
      searchPanelShow:true,
    })
  },
  onBindBlur:function(event){
    var text= event.detail.value;
    var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text;
    this.getMovieListData(searchUrl,"serachResult","")
  },
  onMovieTap:function(event){
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: 'movie-detail/movie-detail?id=' + movieId,
    })
  },
})