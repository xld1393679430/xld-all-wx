var app = getApp();
var myData = require('../../../data/post-data.js')
var util = require("../../../utils/utils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies:{},
    navigateTitle:"",
    ineatersAll:{},
    comingSoonAll:{},
    top250All:{},
    totlaMovies:{},
    isEmpty:true
  },
  onLoad:function(options){
    var that = this;
    var category = options.category;
    this.setData({
      navigateTitle: category
    });
    var dataUrl = "";
    switch (category){
      case "正在热映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
        that.processDoubanData(myData.ineatersAll)
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
        that.processDoubanData(myData.comingSoonAll)
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
        that.processDoubanData(myData.top250All)
        break;
    };
    // util.http(dataUrl, this.processDoubanData)

    

  },
  processDoubanData: function (moviesDouban){
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
    if (!this.data.isEmpty){
      this.data.totlaMovies = this.data.movies.concat(movies);
    }else{
      this.data.totlaMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: this.data.totlaMovies
    })
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReady:function(){
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle,
    })
  },
  //scroll-view与下拉加载冲突，scroll-view改成view，onScrollLower方法改成onReachBottom
  // onScrollLower:function(event){
  onReachBottom: function (event) {
    var that =this;
    var dataUrl = "";
    wx.showNavigationBarLoading()
    setTimeout(function(){
      switch (that.data.navigateTitle) {
        case "正在热映":
          dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
          that.processDoubanData(myData.ineatersAll)
          break;
        case "即将上映":
          dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
          that.processDoubanData(myData.comingSoonAll)
          break;
        case "豆瓣Top250":
          dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
          that.processDoubanData(myData.top250All)
          break;
      };
    },1000)
  },
  onPullDownRefresh:function(){
    var that = this;
    var dataUrl = "";
    that.data.movies = {};
    that.data.isEmpty = true; 
    this.data.totalCount = 0;
    wx.showNavigationBarLoading()
    setTimeout(function () {
      switch (that.data.navigateTitle) {
        case "正在热映":
          dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
          that.processDoubanData(myData.ineatersAll)
          break;
        case "即将上映":
          dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
          that.processDoubanData(myData.comingSoonAll)
          break;
        case "豆瓣Top250":
          dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
          that.processDoubanData(myData.top250All)
          break;
      };
    }, 1000)
  },
  onMovieTap: function (event) {
    console.log(123)
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: '/pages/movies/movie-detail/movie-detail?id=' + movieId,
    })
  },
})