// index/index1.js

const realtimeLog = {}
const colorList = ['#F95151', '#000', '#FFC305', '#00C25F', '#2CABF7', '#6369EA']
const {windowWidth, windowHeight} = wx.getSystemInfoSync()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    imageList: [],
    colorList: colorList,
    mode: 'preview', // preview, edit
    currentIndex: 0,
    drawColor: '#F95151',
    editMode: '', // draw, rectangle, text, previewTemp
    canvasWidth: windowWidth - 30,
    canvasHeight: windowHeight - 100,
    showColorPanel: false,
    textValue: '',
    textLineArr: [],
    textValueMaxLength: 0,
    isAddTextChoose: false,
    inputFocus: false,
    textPx: 100,
    textPy: 100
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.query = wx.createSelectorQuery()
    this.canvasBoxWidth = windowWidth - 30 //盒子的宽
    this.canvasBoxHeight = windowHeight - 100 //盒子的高
    this.canvasWHProportion = this.canvasBoxWidth / this.canvasBoxHeight
    this.dpr = 1.0
    this.dpr = Math.min(1300.0 / Math.min(this.canvasBoxWidth, this.canvasBoxHeight), wx.getSystemInfoSync().pixelRatio)
    if (this.dpr > 2) {
      this.dpr = 2.0
    }
    if (this.dpr < 2) {
      this.dpr = 1.0
    }

    this.dpr = 1;
    this.factor = 1;
    this.currentTransformData = {
      translatex: 0,
      translatey: 0,
    };

    this.historyData = []
    this.drawLinePathList = []
    // let recoveryStudentTaskItem = getApp().globalData.recoveryStudentTaskItem

    const picPaths = [
      "https://xeducationfile.leyantech.com/userfile/1004463/recovery_task_img_2065936_5zBbXDzXWC.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004463/recovery_task_img_2065936_ymy8c5dcNG.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004457/recovery_task_img_2065952_pSiEKt5TPH.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004457/recovery_task_img_2065952_sWSierhM3m.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004779/recovery_task_img_2065955_x6fMrwFatw.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004464/recovery_task_img_2065947_yTtyKkMrFH.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004464/recovery_task_img_2065947_DNQNFtitnY.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004464/recovery_task_img_2065947_BExYH5FKZ8.jpg",
      "https://xeducationfile.leyantech.com/userfile/1004456/recovery_task_img_2065951_B46caakW3i.jpg"
    ]

    this.setData({
      // userInfo: recoveryStudentTaskItem.userInfo,
      // momentId: recoveryStudentTaskItem.moment.momentId,
      // toUserId: recoveryStudentTaskItem.moment.userId,
      // imageList: recoveryStudentTaskItem.moment.studentTaskRecords && recoveryStudentTaskItem.moment.studentTaskRecords[recoveryStudentTaskItem.moment.studentTaskRecords.length - 1] ? recoveryStudentTaskItem.moment.studentTaskRecords[recoveryStudentTaskItem.moment.studentTaskRecords.length - 1].picPaths : []
      imageList: picPaths
    }, () => {
      // getApp().globalData.recoveryStudentTaskItem = null
      // wx.setNavigationBarTitle({
      //   title: this.data.userInfo.name
      // })
      this.init(() => {
        this.downloadImageFile(this.initCanvas)
      })
    })
    let _this = this
    wx.getSystemInfo({
      success(res) {
        let {SDKVersion} = res
        let versionArr = SDKVersion.split('.')
        if (versionArr.length > 0) {
          if (versionArr[0] > 2) {
            return
          } else if (versionArr[0] == 2 && versionArr[1] >= 9) {
            return
          } else {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，请先升级微信至最新版本后，继续使用此功能',
              showCancel: false,
              confirmColor: '#1BC9B7',
              confirmText: '我知道了',
            })
            _this.setData({
              lowVersion: true
            })
          }
        }
      }
    })
  },

  onUnload() {
    try {
      let recoveryTaskMomentPage = getCurrentPages().find(p => {
        return p.route === "pages/recoveryTaskMoment/index"
      })
      const teacherComments = (this.momentVoList[0] && this.momentVoList[0].teacherComments) || []
      if (recoveryTaskMomentPage && recoveryTaskMomentPage.doneCorrectImageCb) {
        recoveryTaskMomentPage.doneCorrectImageCb(teacherComments, this.checkedNum, this.unCheckedNum)
      }
    } catch (e) {
    }
    wx.removeSavedFile({
      filePath: this.tempImgPath
    })
  },

  init(cb) {
    wx.showLoading({
      title: '图像处理中',
      mask: true
    })
    this.context = wx.createCanvasContext('canvasIn');
    cb()
    wx.hideLoading()
  },

  downloadImageFile(cb) {
    wx.showLoading({
      title: '图片加载中',
      mask: true
    })
    let {imageList, currentIndex} = this.data
    let imagePath = imageList[currentIndex] + '?x-oss-process=image/resize,l_1100'
    wx.downloadFile({
      url: imagePath,
      success: (res) => {
        if (res.statusCode === 200) {
          this.tempImgPath = res.tempFilePath
          this.setData({
            tempImgPath: res.tempFilePath
          }, () => {
            wx.hideLoading()
            if (cb) {
              cb()
            }
          })
        } else {
          wx.showToast({
            title: '下载图片失败',
            icon: "none"
          })
          realtimeLog.error('downloadFile', res)
          wx.hideLoading()
        }
      },
      fail(e) {
        wx.hideLoading()
        wx.showToast({
          title: '下载图片失败',
          icon: "none"
        })
        realtimeLog.error('downloadFileFail', e)
      }
    })
  },

  completeEdit() {
    let _this = this
    let {imageList, currentIndex} = this.data
    wx.showLoading({
      title: '生成图片',
      mask: true
    })
    wx.canvasToTempFilePath({
      x: this.imageBorderLeft,
      y: this.imageBorderTop,
      width: this.canvasImageWidth,
      height: this.canvasImageHeight,
      canvasId: 'canvasIn',
      quality: 0.9,
      destWidth: this.imageWidth,
      destHeight: this.imageHeight,
      fileType: 'jpg',
      success(res) {
        _this.uploadImage(res.tempFilePath)
      },
      fail(e) {
        console.log(e)
        realtimeLog.error('canvasToTempFilePath fail', e, imageList[currentIndex])
        _this.saveImageWithLowQuality((res) => {
          if (!_this.uploadImage) {
            console.log(_this)
          }
          _this.uploadImage(res.tempFilePath)
        }, () => {
          wx.hideLoading()
        })
      }
    })

  },

  saveImageWithLowQuality(successCb, failCb) {
    console.log('try to save image with low quality')
    wx.canvasToTempFilePath({
      canvasId: 'canvasIn',
      quality: 0.8,
      destWidth: this.imageWidth * 0.7,
      destHeight: this.imageHeight * 0.7,
      success(res) {
        if (successCb) {
          console.log('save image with low quality success, res.tempFilePath', res.tempFilePath)
          successCb(res)
        }
      },
      fail(e) {
        console.log(e)
        realtimeLog.error('saveImageWithLowQuality', e)
        if (failCb) {
          failCb()
        }
      }
    })
  },

  uploadImage(tempFilePath) {
    let fileName = `teacherAnnotate_${this.data.momentId}_${randomString(10)}.jpg`

    uploadFile(tempFilePath, fileName)
        .then(uploadedFilePath => {
          wx.removeSavedFile({
            filePath: tempFilePath
          })
          this.saveAnnotateComment(uploadedFilePath)
          realtimeLog.log('uploadImage File', uploadedFilePath)
        })
        .catch(e => {
          console.log(e)
          realtimeLog.error('uploadImage', e)
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon: "none"
          })
        })
  },

  saveAnnotateComment(uploadedFilePath) {
    clockTask.addComment({
      userId: getApp().globalData.userInfo.userId,
      momentId: this.data.momentId,
      toUserId: this.data.toUserId,
      imgPaths: [uploadedFilePath],
      content: "",
      bizType: "ANNOTATION"
    })
        .then(res => {
          this.momentVoList = res.momentVoList
          this.checkedNum = res.checkedNum
          this.unCheckedNum = res.unCheckedNum
          let {currentIndex, imageList} = this.data
          this.context.clearRect(0, 0, this.canvasBoxWidth, this.canvasBoxHeight)
          this.setData({
            [`imageList[${currentIndex}]`]: `${getApp().globalData.uploadConfig.Domain}/${uploadedFilePath}`,
            currentIndex: currentIndex < imageList.length - 1 ? currentIndex + 1 : currentIndex,
            mode: 'preview',
            editMode: '',
            drawColor: '#F95151',
            showColorPanel: false,
            textValue: '',
            isAddTextChoose: false,
            inputFocus: false,
            textPx: 15,
            textPy: 100,
            tempImgPath: null
          }, () => {
            wx.hideLoading()
            wx.removeSavedFile({
              filePath: this.tempImgPath
            })
            this.downloadImageFile(this.initCanvas)
          })
          this.historyData = []
          this.img = null
        })
        .catch(e => {
          console.log(e)
          realtimeLog.log('saveAnnotateComment', e)
          wx.hideLoading()
          wx.showToast({
            title: '上传失败',
            icon: "none"
          })
        })
  },

  previewImage() {
    wx.previewImage({
      urls: [this.data.imageList[this.data.currentIndex]]
    })
  },
  // 换颜色
  changeColor(e) {
    let color = e.currentTarget.dataset.color
    this.setData({
      drawColor: color
    })
    // this.context.restore();

  },
  // 进入画线模式
  toDrawMode() {
    let prevMode = this.data.mode
    this.setData({
      showColorPanel: true,
      mode: 'edit',
      editMode: 'draw'
      // }, () => {
      //   if (prevMode !== 'edit') {
      //     this.initCanvas()
      //   }
    })
  },

  toPrevImage() {
    this.setData({
      currentIndex: this.data.currentIndex - 1,
    }, () => {
      wx.removeSavedFile({
        filePath: this.tempImgPath
      })
      if (this.context) {
        this.context.clearRect(0, 0, this.canvasBoxWidth, this.canvasBoxHeight)
      }
      this.downloadImageFile(this.initCanvas)
    })
  },

  toNextImage() {
    this.setData({
      currentIndex: this.data.currentIndex + 1,
    }, () => {
      wx.removeSavedFile({
        filePath: this.tempImgPath
      })
      if (this.context) {
        this.context.clearRect(0, 0, this.canvasBoxWidth, this.canvasBoxHeight)
      }
      this.downloadImageFile(this.initCanvas)
    })
  },

  toRectangleMode() {
    let prevMode = this.data.mode
    this.setData({
      showColorPanel: true,
      mode: 'edit',
      editMode: 'rectangle'
      // }, () => {
      //   if (prevMode !== 'edit') {
      //     this.initCanvas()
      //   }
    })
  },

  saveData(data) {
    this.historyData.push(data);
  },

  undo() {
    if (this.historyData.length < 1) return false;
    wx.showLoading({
      title: '撤销中',
      mask: true
    })
    this.historyData.pop()
    this.redraw()
    if (this.data.editMode === 'previewTemp') {
      this.setData({
        editMode: 'draw'
      })
    }
  },

  redraw(cb) {
    // this.context.clearRect(0,0, this.canvasBoxWidth, this.canvasBoxHeight)
    this.context.drawImage(this.tempImgPath, this.imageBorderLeft, this.imageBorderTop, this.canvasImageWidth, this.canvasImageHeight)

    for (let i of this.historyData) {
      switch (i.type) {
        case 'line':
          this.reDrawLine(i)
          break
        case 'rect':
          this.reDrawRect(i)
          break
        case 'text':
          this.reDrawText(i)
          break
        default:
          return
      }
    }
    if (cb) {
      cb()
    }
    this.context.draw(true);
    wx.hideLoading()

  },

  reDrawLine(step) {
    this.context.strokeStyle = step.strokeStyle
    this.context.save()
    this.context.beginPath();
    for (let p of step.paths) {
      this.context.moveTo(p.x0, p.y0);
      this.context.lineTo(p.x1, p.y1);
      this.context.stroke();
    }
    this.context.closePath();
    this.context.restore()
    // this.context.draw(true);
  },

  reDrawRect(step) {
    this.context.strokeStyle = step.strokeStyle
    this.context.save()
    this.context.moveTo(step.x0, step.y0);
    this.context.strokeRect(step.x0, step.y0, step.x1 - step.x0, step.y1 - step.y0);
    this.context.closePath();
    this.context.restore()
    // this.context.draw(true);
  },

  reDrawText(step) {
    this.context.save()
    this.context.fillStyle = step.strokeStyle
    this.context.font = '14px serif'
    for (let l in this.data.textLineArr) {
      this.context.fillText(step.textLineArr[l], step.x, step.y + 15 * l);
    }
    this.context.restore()
    // this.context.draw(true);
  },

  drawStart(e) {
    this.touches = e.touches
    console.log(e.touches, 'drawStart---00001')
    if (e.touches.length === 1) {
      let {x, y} = e.changedTouches[0]
      if (x >= this.imageBorderLeft && x <= this.imageBorderRight && y > this.imageBorderTop && y < this.imageBorderBottom) {
        this.drawStartoutOfBound = false
        switch (this.data.editMode) {
          case 'draw':
            this.drawLineStart(e)
            break
          case 'rectangle':
            this.drawRectangleStart(e)
            break
          default:
            break
        }
      } else {
        this.drawStartoutOfBound = true
      }
    }
  },

  drawMove(e) {
    if (this.drawStartoutOfBound) return
    let {x, y} = e.changedTouches[0]
    if (x < this.imageBorderLeft) {
      x = this.imageBorderLeft
    }
    if (x > this.imageBorderRight) {
      x = this.imageBorderRight
    }
    if (y < this.imageBorderTop) {
      y = this.imageBorderTop
    }
    if (y > this.imageBorderBottom) {
      y = this.imageBorderBottom
    }


    console.log(this.touches, e.touches, e.changedTouches, this.data.editMode, 'drawMove---001')
    if (this.touches.length === 1 && e.touches.length === 1) {
      switch (this.data.editMode) {
        case 'draw':
          this.drawLineMove({x: e.touches[0].x, y: e.touches[0].y})
          break
        case 'rectangle':
          this.drawRectangleMove({x, y})
          break
        default:
          break
      }
    }
    else if (this.touches.length === 2 && e.touches.length === 2 && e.changedTouches.length >= 1) {
      if (this.latestTouches == null) {
        this.latestTouches = e.touches;
        return;
      }

      let ox = this.latestTouches[0].x;
      let oy = this.latestTouches[0].y;
      let ox1 = this.latestTouches[1].x;
      let oy1 = this.latestTouches[1].y;

      //const {ox1, oy1} = this.latestTouches[1];

      const {x, y} = e.touches[0];
      let x1 = e.touches[1].x;
      let y1 = e.touches[1].y;
      //const {x1, y1} = e.touches[1];
      //移动量 :2个手指移动。需要综合计算
      let dx = (x - ox + x1 - ox1) / 2;
      let dy = (y - oy + y1 - oy1) / 2;

      //缩放量：
      let modx = ox1 - ox;
      let mody = oy1 - oy;
      let mdx = x1 - x;
      let mdy = y1 - y;


      let oldDistance = Math.sqrt(Math.pow(modx, 2) + Math.pow(mody, 2));
      let newDistance = Math.sqrt(Math.pow(mdx, 2) + Math.pow(mdy, 2));


      this.changePercent = (newDistance - oldDistance) / oldDistance;

      let w = this.data.canvasWidth / (this.dpr * this.factor);
      let h = this.data.canvasHeight / (this.dpr * this.factor);

      this.factor = this.factor * (1 + this.changePercent);

      console.log(newDistance, oldDistance, newDistance - oldDistance, 999990)
      // console.log(w, h, newDistance, oldDistance, modx, this.latestTouches, this.dpr, this.factor, 8888888)
      this.currentTransformData.translatex -= (w * 1 / 2) * this.changePercent;
      this.currentTransformData.translatey -= (h * 1 / 2) * this.changePercent;

      this.latestTouches = e.touches;

      this.draw();
    }
    else if (this.touches.length === 3 && e.touches.length === 3 && e.changedTouches.length >= 1) {
      if (this.latestTouches == null) {
        this.latestTouches = e.touches;
        return;
      }

      let ox = this.latestTouches[0].x;
      let oy = this.latestTouches[0].y;
      let ox1 = this.latestTouches[1].x;
      let oy1 = this.latestTouches[1].y;

      //const {ox1, oy1} = this.latestTouches[1];

      const {x, y} = e.touches[0];
      let x1 = e.touches[1].x;
      let y1 = e.touches[1].y;
      //const {x1, y1} = e.touches[1];
      //移动量 :2个手指移动。需要综合计算
      let dx = (x - ox + x1 - ox1) / 2;
      let dy = (y - oy + y1 - oy1) / 2;

      //缩放量：
      let modx = ox1 - ox;
      let mody = oy1 - oy;
      let mdx = x1 - x;
      let mdy = y1 - y;


      let oldDistance = Math.sqrt(Math.pow(modx, 2) + Math.pow(mody, 2));
      let newDistance = Math.sqrt(Math.pow(mdx, 2) + Math.pow(mdy, 2));


      this.changePercent = (newDistance - oldDistance) / oldDistance;

      let w = this.data.canvasWidth / (this.dpr * this.factor);
      let h = this.data.canvasHeight / (this.dpr * this.factor);

      this.factor = this.factor * (1 + this.changePercent);

      console.log(newDistance, oldDistance, newDistance - oldDistance, 999990)
      // console.log(w, h, newDistance, oldDistance, modx, this.latestTouches, this.dpr, this.factor, 8888888)
      this.currentTransformData.translatex -= (w * 1 / 2) * this.changePercent;
      this.currentTransformData.translatey -= (h * 1 / 2) * this.changePercent;

      this.latestTouches = e.touches;

      this.draw();
    }
  },

  drawEnd(e) {
    this.latestTouches = null;

    if (this.drawStartoutOfBound) return
    let {x, y} = e.changedTouches[0]
    if (x < this.imageBorderLeft) {
      x = this.imageBorderLeft
    }
    if (x > this.imageBorderRight) {
      x = this.imageBorderRight
    }
    if (y < this.imageBorderTop) {
      y = this.imageBorderTop
    }
    if (y > this.imageBorderBottom) {
      y = this.imageBorderBottom
    }
    switch (this.data.editMode) {
      case 'draw':
        this.drawLineEnd({x, y})
        break
      case 'rectangle':
        this.drawRectangleEnd({x, y})
        break
      default:
        break
    }
  },
  // 画线
  drawLineStart(e) {
    console.log(e.touches, this.dpr, this.factor, this.currentTransformData.translatex, 'drawLineStart')
    const {drawColor} = this.data
    // this.firstDot = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);//在这里储存绘图表面
    // this.saveData(this.firstDot);
    this.drawLinePath = []
    // 获取触摸点坐标
    this.startX = e.touches[0].x
    this.startY = e.touches[0].y

    this.startX = this.startX / (this.dpr * this.factor) - this.currentTransformData.translatex;
    this.startY = this.startY / (this.dpr * this.factor) - this.currentTransformData.translatey;

    this.drawLinePath = []
    // 画笔配置
    this.context.strokeStyle = drawColor;  // 颜色
    this.context.lineWidth = 2;        // 粗细
    this.context.lineCap = 'round';    // 线头形状
    this.context.lineJoin = 'round';   // 交叉处形状
    // this.context.save()
    this.context.beginPath();
    this.context.moveTo(this.startX, this.startY);
    this.context.lineTo(this.startX, this.startY);
    this.context.stroke();
    this.context.draw(true);
  },

  drawLineMove(e) {
    //  const {drawColor} = this.data
    // 移动时坐标
    let moveX = e.x
    let moveY = e.y

    moveX = (moveX) / (this.dpr * this.factor) - this.currentTransformData.translatex;
    moveY = (moveY) / (this.dpr * this.factor) - this.currentTransformData.translatey;

    this.drawLinePath.push({
      x0: this.startX,
      y0: this.startY,
      x1: moveX,
      y1: moveY
    })

    console.log(e, this.startX, this.startY, moveX, moveY, this.currentTransformData, this.dpr, this.factor, 'drawLineMove')

    this.context.moveTo(this.startX, this.startY);  // 找到起点
    this.context.lineTo(moveX, moveY);              // 找到终点
    this.context.stroke();
    // 改变起点坐标
    this.startX = moveX;
    this.startY = moveY;
    this.context.draw(true);
  },

  drawLineEnd() {
    this.saveData({
      strokeStyle: this.data.drawColor,
      type: 'line',
      paths: this.drawLinePath
    })
    console.log(this.touches, this.drawLinePathList, 'drawLineEnd----0003')
    this.drawLinePathList.push({
      drawLinePath: this.drawLinePath
    });
    this.drawLinePath = []
  },

  // 画方框
  drawRectangleStart(e) {
    const {drawColor} = this.data
    // 获取触摸点坐标
    this.startX = e.changedTouches[0].x
    this.startY = e.changedTouches[0].y
    this.drawRectanglePath = {x0: this.startX, y0: this.startY}
    // 画笔配置
    this.context.strokeStyle = drawColor;  // 颜色
    this.context.lineWidth = 2;        // 粗细
    this.context.lineCap = 'round';    // 线头形状
    this.context.lineJoin = 'round';   // 交叉处形状
    this.context.save()
    this.context.beginPath();
    this.context.moveTo(this.startX, this.startY);
    this.context.rect(e.touches[0].x, e.touches[0].y, this.startX - e.touches[0].x, this.startY - e.touches[0].y);
    this.context.closePath();
    this.context.stroke();
    this.context.draw(true);
  },

  drawRectangleMove(e) {
    let moveX = e.x
    let moveY = e.y
    this.redraw(() => {
      this.context.save()
      this.context.strokeStyle = this.data.drawColor
      this.context.beginPath();
      this.context.moveTo(this.startX, this.startY);
      this.context.strokeRect(this.startX, this.startY, moveX - this.startX, moveY - this.startY);
      this.context.closePath();
      this.context.stroke();
      // this.context.draw(false);
    })
  },

  drawRectangleEnd(e) {
    let moveX = e.x
    let moveY = e.y
    this.context.strokeStyle = this.data.drawColor
    this.context.beginPath();
    this.context.moveTo(this.startX, this.startY);
    this.context.strokeRect(this.startX, this.startY, moveX - this.startX, moveY - this.startY);
    this.context.closePath();
    this.context.stroke();
    this.context.draw(true);
    this.drawRectanglePath.x1 = moveX
    this.drawRectanglePath.y1 = moveY
    this.drawRectanglePrevImageData = null
    this.saveData({
      type: 'rect',
      ...this.drawRectanglePath,
      strokeStyle: this.data.drawColor,
    })
  },

  // 把图变成canvas
  initCanvas(cb) {
    let {imageList, currentIndex} = this.data
    let imagePath = imageList[currentIndex]
    wx.showLoading({
      title: '图像处理中',
      mask: true
    })

    wx.getImageInfo({
      src: this.tempImgPath,
      success: (res) => {
        let {width, height} = res
        this.imageWidth = width
        this.imageHeight = height
        let {canvasWidth, canvasHeight} = this.computeCanvasSize(width, height)
        this.canvasImageWidth = canvasWidth
        this.canvasImageHeight = canvasHeight
        this.setData({
          canvasImageWidth: canvasWidth,
          canvasImageHeight: canvasHeight
        })
        this.imageBorderLeft = 0
        this.imageBorderTop = 0
        // 左右居中
        if (canvasWidth < this.canvasBoxWidth) {
          this.imageBorderLeft = (this.canvasBoxWidth - canvasWidth) / 2
        }
        this.imageBorderRight = this.imageBorderLeft + canvasWidth
        this.imageBorderBottom = this.imageBorderTop + canvasHeight
        // this.context.drawImage(this.tempImgPath, this.imageBorderLeft, this.imageBorderTop, canvasWidth, canvasHeight)
        // this.context.draw(true);
        this.draw()
        wx.hideLoading()
        if (cb) {
          cb()
        }
        realtimeLog.log('initCanvas', `momentId ${this.data.momentId} imagePath ${imagePath} width ${width} height ${height}`)
      },
      fail() {
        wx.hideLoading()
      }
    })


  },

  draw() {
    this.context.scale(this.dpr * this.factor, this.dpr * this.factor);
    this.context.translate(this.currentTransformData.translatex, this.currentTransformData.translatey);
    this.context.drawImage(this.tempImgPath, this.imageBorderLeft, this.imageBorderTop, this.canvasImageWidth, this.canvasImageHeight)

    console.log(this.drawLinePathList, 'this.drawLinePathList')
    if (this.drawLinePathList.length > 0) {
      this.drawLinePathList.forEach((obj, i) => {
        if (obj.drawLinePath.length == 0) {
          return;
        }

        this.context.strokeStyle = 'red'; // 颜色
        this.context.lineWidth = 2; // 粗细
        this.context.lineCap = 'round'; // 线头形状
        this.context.lineJoin = 'round'; // 交叉处形状
        //this.context.save();
        this.context.beginPath();
        this.context.moveTo(obj.drawLinePath[0].x0, obj.drawLinePath[0].y0);
        this.context.lineTo(obj.drawLinePath[0].x1, obj.drawLinePath[0].y1);

        obj.drawLinePath.forEach((o2, j) => {
          this.context.lineTo(o2.x1, o2.y1); // 找到终点
        });
        this.context.stroke();
        this.context.closePath();
      })
    }
    this.context.draw(false);
  },

  // 计算canvas大小, 返回展示宽高
  computeCanvasSize(width, height) {
    let {canvasBoxWidth, canvasBoxHeight, canvasWHProportion} = this
    let imageWHProportion = width / height
    if (width === 0 || height === 0) {
      return {
        canvasWidth: 0,
        canvasHeight: 0
      }
    }
    if (imageWHProportion <= canvasWHProportion) {
      return {
        canvasWidth: canvasBoxHeight * width / height,
        canvasHeight: canvasBoxHeight
      }
    } else {
      return {
        canvasWidth: canvasBoxWidth,
        canvasHeight: canvasBoxWidth * height / width
      }
    }
  },
  //点击展示文字调起输入框
  clickTextShow() {
    this.setData({inputFocus: true,})
  },

  textEnd() {
    console.log(this.data.textPx, this.data.textPy)
  },

  //编辑文字
  // textStart(e){
  //     this.touchStart_x = e.touches[0].pageX;
  //     this.touchStart_y = e.touches[0].pageY;
  //     this.boxStartX = this.data.textPx;
  //     this.boxStartY = this.data.textPy;
  // },
  //文字移动
  textMove(e) {
    let {x, y} = e.detail
    this.setData({
      textPx: x,
      textPy: y
    })
  },
  //文字取消
  textCancel() {
    this.setData({
      editMode: 'draw',
      inputFocus: false,
      textValue: '',
      textLineArr: [],
      textValueMaxLength: 0,
      textPx: 15,
      textPy: 100
    })
  },
  //文字完成
  textDone() {
    //如果文字是空则执行取消函数
    if (this.data.textValue == '') {
      this.textCancel();
      return;
    }
    wx.showLoading({title: '保存文字', mask: false})
    this.context.save();//保存绘图上下文
    this.context.fillStyle = this.data.drawColor
    this.context.font = '14px serif'
    for (let l in this.data.textLineArr) {
      this.context.fillText(this.data.textLineArr[l], this.data.textPx, this.data.textPy + 15 * l + 12);
    }
    this.context.restore(); //恢复之前保存的绘图上下文
    this.context.draw(true);
    this.saveData({
      type: 'text',
      textLineArr: this.data.textLineArr,
      x: this.data.textPx,
      y: this.data.textPy + 12,
      strokeStyle: this.data.drawColor
    })
    wx.hideLoading();
    this.setData({
      editMode: 'draw',
      inputFocus: false,
      textValue: '', textPx: 15, textPy: 100
    })
  },

  drawTap(e) {
    if (this.data.mode === 'preview') {
      wx.previewImage({
        urls: [this.data.imageList[this.data.currentIndex]]
      })
    } else if (this.data.editMode === 'text') {
      this.setData({
        textPx: e.detail.x,
        textPy: e.detail.y
      })
    } else if (this.data.editMode === 'previewTemp') {
      wx.showLoading({
        title: '生成图片',
      })
      wx.canvasToTempFilePath({
        x: this.imageBorderLeft,
        y: this.imageBorderTop,
        width: this.canvasImageWidth,
        height: this.canvasImageHeight,
        canvasId: 'canvasIn',
        quality: 0.9,
        destWidth: this.imageWidth,
        destHeight: this.imageHeight,
        fileType: 'jpg',
        success(res) {
          wx.hideLoading()
          wx.previewImage({
            urls: [res.tempFilePath]
          })
        },
        fail(e) {
          console.log(e)
          realtimeLog.error('drawTap canvasToTempFilePath fail', e, imageList[currentIndex])
          wx.hideLoading()
        }
      })
    }
  },

  // 预览模式
  previewTemp() {
    let _this = this
    wx.showLoading({
      title: '生成预览图片',
      mask: true
    })
    wx.canvasToTempFilePath({
      x: this.imageBorderLeft,
      y: this.imageBorderTop,
      width: this.canvasImageWidth,
      height: this.canvasImageHeight,
      canvasId: 'canvasIn',
      quality: 0.9,
      destWidth: this.imageWidth,
      destHeight: this.imageHeight,
      fileType: 'jpg',
      success(res) {
        if (_this.data.currentTempFilePath) {
          wx.removeSavedFile({
            filePath: _this.data.currentTempFilePath
          })
        }
        _this.setData({
          editMode: 'previewTemp',
          currentTempFilePath: res.tempFilePath
        })
      },
      fail(e) {
        console.log('e', e)
      },
      complete() {
        wx.hideLoading()
      }
    })
  },

  previewTempImage() {
    wx.previewImage({
      urls: [this.data.currentTempFilePath]
    })
  },

  //文字改变
  inputChange(e) {
    let textValue = e.detail.value
    let textLineArr = textValue.split('\n')
    let textValueLengthArr = textLineArr.map(t => t.length)
    let textValueMaxLength = Math.max(...textValueLengthArr)
    this.setData({
      textValue,
      textLineArr,
      textValueMaxLength
    })
  },

  //添加文字

  toAddText() {
    let prevMode = this.data.mode
    wx.showLoading({
      title: '添加文字',
      mask: true
    })
    let _this = this
    this.setData({
      // currentTempFilePath: res.tempFilePath,
      showColorPanel: true,
      mode: 'edit',
      editMode: 'text',
      inputFocus: true,
      textPx: 15,
      textPy: 100
    }, () => {
      wx.hideLoading()
    })
  },

  //平面三点定位算法
  locate(x1, y1, x2, y2, x3, y3) {
    let a, b;
    a = (y2 - y1) / (x2 - x1);
    b = y1 - a * x1;

    let xMiddle = (x1 + x2) / 2;
    let yMiddle = (y1 + y2) / 2;
    let c, lastX, lastY;
    if (a != 0) {
      c = yMiddle - (-1 / a) * xMiddle;
      lastX = (Math.pow(x1, 2) + Math.pow(y1, 2) - Math.pow(x3, 2) - Math.pow(y3, 2) - 2 * c * y1 + 2 * c * y3) / (2 * ((x1 - x3) - (1 / a) * (y1 - y3)));
      lastY = (-1 / a) * lastX + c;
    } else {
      lastX = c = xMiddle;
      lastY = (Math.pow(x1, 2) + Math.pow(y1, 2) - Math.pow(x3, 2) - Math.pow(y3, 2) + 2 * lastX * (x3 - x1)) / (2 * (y1 - y3));
    }
    return {lastX, lastY}
  }
})
