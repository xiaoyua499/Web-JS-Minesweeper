window.addEventListener('load', function () {
    function Mine(tr, td, mineNum) {
        this.tr = tr; //行数
        this.td = td; //列数
        this.mineNum = mineNum; //雷数
        this.squares = []; // 储存所有方块的信息
        this.tds = []; //存储所有单元格的DON
        this.surplusMine = mineNum; //剩余雷的数量
        this.allRight = false; // 判断右击标记的小红旗是否全是雷, 以此来判断游戏是否成功
        this.parent = document.querySelector('.gameBox');
    }

    //生成n个不重复的数字
    Mine.prototype.randomNum = function () {
        var square = new Array(this.tr * this.td);
        for (var i = 0; i < square.length; i++) {
            square[i] = i;
        }
        square.sort(function () { return 0.5 - Math.random() }); // 生成随机排序的数组
        return square.slice(0, this.mineNum); // 截取随机数组中 0~雷数 中的的数字
    }

    // 初始化
    Mine.prototype.init = function () {
        var mineLocation = this.randomNum(); // 雷的位置
        var index = 0; //格子对应的索引
        for (var i = 0; i < this.tr; i++) {
            this.squares[i] = [];
            for (var j = 0; j < this.td; j++) {
                index++;
                if (mineLocation.indexOf(index) != -1) {
                    this.squares[i][j] = {
                        type: 'mine',
                        x: j,
                        y: i
                    };
                } else {
                    this.squares[i][j] = {
                        type: 'number',
                        x: j,
                        y: i,
                        value: 0
                    };
                }
            }
        }
        this.parent.oncontextmenu = function () {
            return false;
        }
        this.updateNum();
        this.createDom();
        //剩余雷数
        this.mineNumDom = document.querySelector('.mineNum');
        this.mineNumDom.innerHTML = this.surplusMine;
    }

    //创建表格
    Mine.prototype.createDom = function () {
        var This = this; // This 指的是实例对象
        var table = document.createElement('table');
        for (var i = 0; i < this.tr; i++) { // 行
            var domTr = document.createElement('tr');
            this.tds[i] = [];
            for (var j = 0; j < this.td; j++) { // 列
                var domTd = document.createElement('td');
                // domTd.innerHTML = 0;
                domTd.pos = [i, j]; // 存储对应格子的行与列, 通过这个数组去到相应的数据
                domTd.onmousedown = function () {
                    This.play(event, this); // this 指的是当前点击的td
                }
                this.tds[i][j] = domTd;
                // if (this.squares[i][j].type == 'mine') {
                //     domTd.className = 'mine';
                // }
                // if (this.squares[i][j].type == 'number') {
                //     domTd.innerHTML = this.squares[i][j].value;
                // }
                domTr.appendChild(domTd);
            }
            table.appendChild(domTr);
        }
        this.parent.innerHTML = ''; // 清空之前的棋盘
        this.parent.appendChild(table);
    }

    //找到某个方格周围的8个格子
    Mine.prototype.getAround = function (square) {
        var x = square.x;
        var y = square.y;
        var result = []; // 用来返回格子的坐标
        //通过坐标循环九宫格
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || (i == x && j == y) || this.squares[j][i].type == 'mine') {
                    continue;
                }
                result.push([j, i]); // 以行与列的形式返回回去
            }
        }
        return result;
    }

    //更新所有的数字
    Mine.prototype.updateNum = function () {
        for (var i = 0; i < this.tr; i++) {
            for (var j = 0; j < this.td; j++) {
                if (this.squares[i][j].type == 'number') { // 只给雷周围的数字更新
                    continue;
                }
                var num = this.getAround(this.squares[i][j]);
                for (var k = 0; k < num.length; k++) {
                    this.squares[num[k][0]][num[k][1]].value += 1;
                }
            }
        }
    }

    // 游戏玩法
    Mine.prototype.play = function (event, obj) {
        if (event.which == 1 && obj.className != 'flag') { // 判断鼠标点击的是否为左键
            var This = this;
            var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
            var numColor = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eigth'];
            if (curSquare.type == 'number') {
                obj.innerHTML = curSquare.value;
                obj.className = numColor[curSquare.value];
                if (curSquare.value == 0) { // 判断是否点到零
                    obj.innerHTML = '';
                    // 递归 显示相邻且为零的格子
                    function getAllZero(square) {
                        // 寻找 0 四周的格子
                        var around = This.getAround(square);
                        for (var i = 0; i < around.length; i++) {
                            var x = around[i][0]; // 行
                            var y = around[i][1]; // 列
                            This.tds[x][y].className = numColor[This.squares[x][y].value];
                            if (This.squares[x][y].value == 0) { // 如果格子的值为0 则调用函数递归
                                if (!This.tds[x][y].check) { // 给找过的格子添加check属性,以避免重复寻找
                                    This.tds[x][y].check = true;
                                    getAllZero(This.squares[x][y]);
                                }
                            } else {
                                This.tds[x][y].innerHTML = This.squares[x][y].value;
                            }
                        }
                    }
                    getAllZero(curSquare);
                }
            } else {
                this.gameOver(obj);
            }
        }
        //用户点击右键
        if (event.which == 3) {
            //如果点击数字的位置则不能点击
            if (obj.className && obj.className != 'flag') {
                return;
            }
            obj.className = obj.className == 'flag' ? '' : 'flag'; //取消flag
            //判断标记小红旗的位置是否全是雷
            if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
                this.allRight = true;
            } else {
                this.allRight = false;
            }
            // 更新剩余雷数
            if (obj.className == 'flag') {
                this.surplusMine--
                this.mineNumDom.innerHTML = this.surplusMine;
            } else {
                this.surplusMine++
                this.mineNumDom.innerHTML = this.surplusMine;
            }
            //判断游戏结局
            if (this.surplusMine == 0) {
                if (this.allRight) {
                    alert('你赢了');
                } else {
                    alert('游戏结束');
                    this.gameOver();
                }
            }
        }
    }

    //游戏失败
    Mine.prototype.gameOver = function (clickTd) {
        for (var i = 0; i < this.tr; i++) {
            for (var j = 0; j < this.td; j++) {
                if (this.squares[i][j].type == 'mine') {
                    this.tds[i][j].className = 'mine';
                }
                this.tds[i][j].onmousedown = null;
            }
        }
        if (clickTd) {
            clickTd.className = 'gameover';
            alert('游戏结束')
        }
    }

    //按钮功能
    // var level = document.querySelector('.level');
    // var btn = level.querySelectorAll('button');
    // var mine = null;
    // var levelarrs = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];
    // // //排他思想
    // for (var i = 0; i < btn.length-1; i++) {
    //     btn[i].addEventListener('click', function () {
    //         for (var i = 0; i < btn.length - 1; i++) {
    //             btn[i].className = '';
    //         }
    //         this.className = 'active';
    //         mine = new Mine(...levelarrs[i]);
    //         mine.init();
    //     })


    // }
    // btn[0].click();
    var btns = document.querySelectorAll(".level button");
    var mine = null;
    var li = 0;  //上次的索引
    var levelArr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]];  //难度设置

    for (let i = 0; i < btns.length - 1; i++) {
        btns[i].onclick = function () {
            btns[li].className = '';  //清除上次点击的样式
            this.className = 'active';

            mine = new Mine(...levelArr[i]);
            mine.init();

            li = i; //更新状态
        }
    }
    btns[0].onclick();   //初始化
    btns[3].onclick = function () {
        mine.init();
    }

    // var mine = new Mine(arrs[i][0],arrs[i][1],arrs[i][2]);
    // mine.init();
})