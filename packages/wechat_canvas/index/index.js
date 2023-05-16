const app = getApp()

Page({
    data: {
        canvasWidth: 375,
        canvasHight: 467,
        imgUrl: 'https://cn.bing.com/th?id=OIP.geUSJfZRvMHFVz6KSyp8jgHaHa&pid=Api&rs=1'
    },

    onLoad: function () {
        this.dpr = 1;
        this.factor = 1;
        this.currentTransformData = {
            scalex: 1,
            scaley: 1,
            translatex: 0,
            translatey: 0,
        };

        this.canvasWidth = 375;
        this.canvasHight = 467;
        this.drawLinePathList = []
        this.initCanvas()
    },
    initCanvas() {
        const ctx = wx.createCanvasContext('myCanvas')
        this.ctx = ctx;
        this.draw();
    },
    draw() {
        this.applyTrans();
        let that = this;
        let ctx = this.ctx;

        //画个已填充的矩形

        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHight);

        ctx.setFillStyle("red")
        ctx.fillRect(10, 50, 50, 50);

        //画个已填充的矩形
        ctx.setFillStyle("green");
        ctx.fillRect(100, 50, 50, 50);

        if (this.drawLinePathList.length > 0) {
            this.drawLinePathList.forEach((obj,i)=>{
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

                obj.drawLinePath.forEach((o2,j)=>{
                    this.context.lineTo(o2.x1,o2.y1); // 找到终点
                });
                this.context.stroke();
                this.context.closePath();
            })
        }

        this.ctx.draw(false);
    },
    applyTrans() {
        this.ctx.scale(this.dpr * this.factor, this.dpr * this.factor);
        this.ctx.translate(this.currentTransformData.translatex, this.currentTransformData.translatey);
    },



    bindtouchstart1(e) {
        console.log('bindtouchstart', e);
        var that = this;
        this.context = this.ctx;
        this.applyTrans();


        this.drawLinePath = []
        // 获取触摸点坐标
        this.startX = e.changedTouches[0].x
        this.startY = e.changedTouches[0].y
        this.startX = this.startX / ( this.dpr * this.factor) - this.currentTransformData.translatex;//
        this.startY = this.startY / ( this.dpr * this.factor) - this.currentTransformData.translatey;//


        this.drawLinePath = []
        // 画笔配置
        this.context.strokeStyle = 'red'; // 颜色
        this.context.lineWidth = 2; // 粗细
        this.context.lineCap = 'round'; // 线头形状
        this.context.lineJoin = 'round'; // 交叉处形状
        //this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.startX, this.startY);
        this.context.lineTo(this.startX, this.startY);
        this.context.stroke();
        this.ctx.draw(true);
    },

    bindtouchmove1(e) {
        console.log('bindtouchmove', e); //  const {drawColor} = this.data
        // 移动时坐标
        let moveX = e.changedTouches[0].x
        let moveY = e.changedTouches[0].y

        //this.applyTrans();

        moveX = (moveX) / ( this.dpr * this.factor) - this.currentTransformData.translatex;//
        moveY = (moveY) / ( this.dpr * this.factor) - this.currentTransformData.translatey;//

        this.drawLinePath.push({
            x0: this.startX,
            y0: this.startY,
            x1: moveX,
            y1: moveY
        });

        this.context.moveTo(this.startX, this.startY); // 找到起点
        console.log("move to : ", this.startX, this.startY, moveX, moveY);
        this.context.lineTo(moveX, moveY); // 找到终点
        this.context.stroke();

        // 改变起点坐标
        this.startX = moveX;
        this.startY = moveY;
        this.ctx.draw(true);

    },
    bindtouchend1(e) {
        console.log('bindtouchend');
        this.context.closePath();
        this.drawLinePathList.push({
            drawLinePath: this.drawLinePath
        });
        this.drawLinePath = []
    },


    zoomBigger() {
        this.zoom(0.1);
    },
    zoomSmall() {
        this.zoom(-0.1);
    },

    zoom(percent) {
        let w = this.canvasWidth / (this.dpr * this.factor);
        let h = this.canvasHight / (this.dpr * this.factor);

        let changePercent = percent;
        this.factor = this.factor * (1 + changePercent);

        this.currentTransformData.translatex -= (w * 1 / 2) * changePercent;
        this.currentTransformData.translatey -= (h * 1 / 2) * changePercent;

        this.draw();
    },

    up() {
        this.currentTransformData.translatey -= 30;
        this.draw();
        //this.draw();
    },
    down() {
        this.currentTransformData.translatey += 30;
        this.draw();
        //this.draw();
    },

    left() {
        this.currentTransformData.translatex -= 30;
        this.draw();
    },
    right() {
        this.currentTransformData.translatex += 30;
        this.draw();
    },

  toDemo() {
      wx.navigateTo({
        url: '/editTaskImage/index'
      })
  }
})
