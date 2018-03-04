
let starMillisecond = 0;//第一次点击时毫秒数
let stopTimer;

/**
 * 初始化数据
 * @returns {Array}
 */
function initData() {
    let fonts = ['bicycle','space-shuttle','bus','car','subway','anchor','twitter','github-alt'];
    let arr = fonts.concat(fonts);
    const ROW = 4, COL = 4;
    let icons = [];
    //打乱数组
    arr.sort(function () {
        return Math.random() - 0.5;
    });
    //生成二维数组
    for (let i = 0; i < ROW; i ++) {
        icons[i] = [];
        for (let j = 0; j < COL; j++) {
            icons[i][j] = arr[i*COL+j];
        }
    }
    return icons;
}

/**
 * 处理星星的状态
 * @param moves
 */
function handleStars(moves) {
    const starDiv = $('.moves');
    //超过10次减少一颗星星
    const starI = $('<i class="fa fa-star-o"></i>');
    if (moves >= 15 && moves < 25) {
        if (starDiv.find('i')[2].className === 'fa fa-star') {
            //实心才进来，空心不用进来
            starDiv.find('i')[2].remove();
            starDiv.find('span').before(starI);
        }
    }else if (moves >=25) {
        if (starDiv.find('i')[1].className === 'fa fa-star') {
            starDiv.find('i')[1].remove();
            starDiv.find('span').before(starI);
        }
    }
}

/**
 * 计时器函数
 */
function timers() {
    if (!stopTimer) {
        let temp = Date.now()-starMillisecond;
        let millisecondStr;
        if (temp % 1000 < 10) {
            millisecondStr = '00' + temp % 1000;
        }else if (temp % 1000 > 10 && temp % 1000 < 100) {
            millisecondStr = '0' + temp % 1000;
        }else if (temp % 1000 > 100 && temp % 1000 < 1000) {
            millisecondStr = temp % 1000;
        }
        if (millisecondStr) {
            //貌似millisecondStr会出现undefined的情况？
            $('h2').html(`${Math.ceil(temp/1000)}.${millisecondStr}`);
        }

        setTimeout("timers()",1);
    }
}

/**
 * 动态构建头部
 * @param container
 */
function makeHeader(container) {
    const title = $('<h1 class="text-center">Matching Game</h1>');
    title.appendTo(container);
    const timerP = $('<h2 class="text-center">0.000</h2>');
    timerP.appendTo(container);
    const starRow = $('<div class="row"></div>');
    starRow.appendTo(container);
    const starDiv = $('<div class="col-6 col-sm-6 text-right moves"></div>');
    starDiv.appendTo(starRow);
    for (let i = 0; i < 3; i++){
        const starI = $('<i class="fa fa-star"></i>');
        starI.appendTo(starDiv);
    }
    const starMoves = $('<span>0Moves</span>');
    starMoves.css("margin-left","5px");
    starMoves.appendTo(starDiv);
    const repeatDiv = $('<div class="col-6 col-sm-6 repeat"></div>');
    repeatDiv.appendTo(starRow);
    const repeatI = $('<i class="fa fa-repeat"></i>');
    repeatI.appendTo(repeatDiv);
}

/**
 * 动态构建卡片
 * @param container
 */
function makeCard(container) {
    let icons = initData();

    let counts = 0, moves = 0;
    let canOpen = true, firstClick = true;
    let all_card = [];
    let prev_card;

    const span = $('span');
    const card_bg = $('<div></div>');
    card_bg.addClass('card-board');
    card_bg.appendTo(container);

    for (let i = 0; i < 4; i++){
        const div_row = $('<div></div>');
        div_row.addClass('row');
        div_row.appendTo(card_bg);
        for (let j = 0; j < 4; j++) {
            const div_col = $('<div></div>');
            div_col.addClass('col');
            div_col.appendTo(div_row);

            const div_flip_container = $('<div></div>');
            div_flip_container.addClass('flip-container text-white');
            div_flip_container.appendTo(div_col);
            const div_flip = $('<div></div>');
            div_flip.addClass('flip');
            div_flip.appendTo(div_flip_container);
            //卡片背面
            const div_front = $('<div></div>');
            div_front.addClass('front');
            div_front.appendTo(div_flip);
            //卡片正面
            const div_back = $('<div></div>');
            div_back.addClass('back');
            div_back.appendTo(div_flip);
            const i_back = $('<i></i>');
            i_back.addClass(`fa fa-${icons[i][j]} fa-2x`);
            i_back.appendTo(div_back);
            div_flip_container.click(function () {
                if (firstClick) {
                    //第一次点击才计时
                    starMillisecond = Date.now();
                    stopTimer = false;
                    timers();
                    firstClick = false;
                }
                if (!div_flip.hasClass('rotate')) {
                    //防止连续点击同一张卡片
                    if (canOpen) {
                        //防止连续点击3张卡片以上
                        canOpen = false;
                        div_flip.addClass('rotate');
                        counts++;
                        if (counts % 2) {
                            //翻开第一张卡片
                            canOpen = true;
                            prev_card = div_flip_container;
                        } else {
                            //翻开第二张卡片
                            moves++;
                            handleStars(moves);
                            span.text(`${moves}Moves`);
                            if (div_back[0].childNodes[0].classList[1] !== prev_card[0].childNodes[0].childNodes[1].childNodes[0].classList[1]) {
                                //卡片不匹配
                                prev_card.find('.back').css('background-color','red');
                                div_back.css('background-color','red');
                                //使用第三方库animate.css实现动画效果
                                div_flip_container.removeClass('wobble animated').addClass('wobble animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                                    $(this).removeClass('wobble animated');
                                });
                                prev_card.removeClass('wobble animated').addClass('wobble animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                                    $(this).removeClass('wobble animated');
                                });
                                //因为上面的动画要一定时间，所以卡片转回去要延时执行
                                setTimeout(function () {
                                    //转回去
                                    prev_card.find('.flip').removeClass('rotate');
                                    div_flip.removeClass('rotate');
                                    //卡片正面颜色变回去
                                    prev_card.find('.back').css('background-color','skyblue');
                                    div_back.css('background-color','skyblue');
                                    canOpen = true;
                                },800);
                            } else {
                                //卡片匹配成功（因为卡片旋转要一定时间，所以下面的动画要延迟执行）
                                setTimeout(function () {
                                    //改变颜色
                                    div_flip_container.find('.back').css('background-color', '#12dfb8');
                                    prev_card.find('.back').css('background-color', '#12dfb8');
                                    //添加动画
                                    div_flip_container.removeClass('bounceIn animated').addClass('bounceIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                                        $(this).removeClass('bounceIn animated');
                                    });
                                    prev_card.removeClass('bounceIn animated').addClass('bounceIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                                        $(this).removeClass('bounceIn animated');
                                    });
                                    canOpen = true;
                                },500);
                                //把匹配成功的icon添加到数组里
                                all_card.push(div_back[0].childNodes[0].classList[1]);
                                if (all_card.length === 8) {
                                    //8对卡片全部匹配成功
                                    stopTimer = true;
                                    setTimeout(function () {
                                        const starDiv = $('.moves');
                                        let stars = 0;
                                        for (let i = 0; i < starDiv.find('i').length; i++) {
                                            if (starDiv.find('i')[i].className === 'fa fa-star') {
                                                stars++;
                                            }
                                        }
                                        container.empty();
                                        const height = $(document).height();
                                        const winText = $('<div></div>');
                                        winText.addClass('text-center vertical-center');
                                        winText.appendTo(container);
                                        winText.height(height);
                                        $(`<div>
                                                <h2>Congratulations! You Won!</h2>
                                                <p>Use for ${Math.ceil((Date.now()-starMillisecond)/1000)} seconds! With ${moves} Moves and ${stars} Stars.</p>
                                                <button class="btn">play again</button>
                                           </div>`).appendTo(winText);
                                        $('button').click(function () {
                                            container.empty();
                                            initGame();
                                        });
                                    },900);
                                }
                            }
                        }
                    }
                }

            });
        }
    }
}

function initGame() {
    stopTimer = true;
    let container = $('.container');
    makeHeader(container);
    makeCard(container);
    let repeat = $('.fa-repeat');
    repeat.click(function () {
        //刷新
        container.empty();
        setTimeout(function () {
            initGame();
        },10);
    });
}

$(window).resize(function() {
    let width = $(this).width();
    let height = $(this).height();
    let textRight = $('.moves');
    if (textRight) {
        if (width < 768) {
            if (textRight.hasClass('text-right')) {
                textRight.removeClass('text-right').addClass('text-center');
            }
        } else {
            if (!textRight.hasClass('text-right')) {
                textRight.removeClass('text-center').addClass('text-right');
            }
        }

    }

});

$(function () {
    initGame();
});