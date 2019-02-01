<template>
    <div>
        <div class="page-container"
             :style="`background-image:url('assets/img/theme/theme_${questionInfo.selectThemeIndex+1}.png')`">
            <!--  内容编辑区域  -->
            <div class="page-main">
                <div class="content-flag noselect">
                    <img src="assets/img/icon_ele_flag.png"/>
                </div>

                <div class="content-title text-center">
                    <span class="noselect">{{questionInfo.title}}</span>
                </div>

                <div class="word-swiper-pagination text-center noselect"
                     :class="questionInfo.questionList.length>1?'':'transparent'">
                    <div class="swiper-pagination" slot="pagination"></div>
                </div>
                <div class="word-swiper-toggle nopointer" v-show="questionInfo.questionList.length>1">
                    <div class="icon-swiper-toggle swiper-toggle-left click-element pull-left"></div>
                    <div class="icon-swiper-toggle swiper-toggle-right click-element pull-right"></div>
                </div>

                <v-touch
                    tag="div"
                    :pan-options="{directions: 'all',threshold:0}"
                    @panstart="elementPanStart"
                    @panmove="elementPanMove"
                    @panend="elementPanEnd">
                    <swiper class="word-container"
                            :options="swiperOption"
                            ref="cardSwiper">
                        <swiper-slide
                            class="card-item"
                            v-for="(item,index) in questionInfo.questionList"
                            :key="item.id">
                            <div class="card-item-box"
                                 @click="turnToThisCard(index)">
                                <!--  显示最终总评价结果  -->
                                <transition
                                    enter-active-class="animated bounceIn"
                                    leave-active-class="animated fadeOut">
                                    <div class="result-atlast"
                                         :class="item.finishResult.corner?'corner':''"
                                         v-if="item.finishResult.show">
                                        <img class="icon-result-light" src="assets/img/icon_results_light.png"/>
                                        <div class="icon-result-btn" :class="`btn-${item.finishResult.result}`"></div>
                                        <div class="icon-result-btn" :class="`btn-${item.finishResult.result}`"></div>
                                        <div class="icon-result-btn" :class="`btn-${item.finishResult.result}`"></div>
                                    </div>
                                </transition>
                                <div class="tip-words text-center noselect">请将答案拖动到对应的空格内。</div>
                                <div class="contenteditable-box noselect">
                                    <div class="question-item"
                                         ref="questionItem"
                                         :data-index="index"
                                         :data-pIndex="pIndex"
                                         v-for="(pItem,pIndex) in item.contentList"
                                         :key="pIndex">
                                        <div class="input-box-container"
                                             v-for="(subItem,subIndex) in pItem"
                                             :key="subIndex"
                                             :class="`${subItem.statu===1?'hovering':''} ${subItem.finish?'finish':''}`"
                                             :data-class="subItem.class">
                                            <div class="answer-result-icon icon-results animated bounceIn"
                                                 :class="subItem.result?'right':'wrong'"
                                                 v-if="item.finish && subItem.class!=='txtBox'&&!item.finishResult.showValue">
                                            </div>
                                            <div class="answer-box draged-tag"
                                                 :class="subItem.class"
                                                 v-if="subItem.class!=='txtBox'&&subItem.finish">
                                                {{item.finishResult.showValue?subItem.value:subItem.answer}}
                                            </div>
                                            <contenteditable
                                                tag="div"
                                                clas="div-input"
                                                spellcheck='false'
                                                aria-palceholder="点击输入题目内容…"
                                                v-model="subItem.value"
                                                :class="subItem.class"
                                                :id="`inputBox_${subItem.id}`"
                                                :data-index="index"
                                                :data-pIndex="pIndex"
                                                :data-subIndex="subIndex"
                                                :contenteditable="false"
                                                :noNL="true"
                                                :noHTML="subItem.class!=='txtBox'"
                                                v-show="!subItem.finish"/>
                                        </div>
                                    </div>
                                </div>
                                <!--  干扰项标签展示  -->
                                <div class="disturbance-tags noselect"
                                     :class="item.finish?'nopointer finish':''">
                                    <div class="disturbance-tag"
                                         :class="subItem.hidden?'hidden':'onDrag-tag'"
                                         v-for="(subItem,subIndex) in item.answerTagGather"
                                         :key="subItem.id"
                                         :data-index="index"
                                         :data-subIndex="subIndex">
                                        {{subItem.content}}
                                    </div>
                                </div>
                            </div>
                        </swiper-slide>
                    </swiper>
                </v-touch>
            </div>
        </div>

        <transition
            enter-active-class="animated slideInRight"
            leave-active-class="animated slideOutRight">
            <div class="card-btn-side-right noselect"
                 :class="questionInfo.questionList[activeIndex].finish?'':'disabled'">
                <div class="icon-elements card-btn-return click-element"
                     @click="redoThis"></div>
                <div class="icon-elements card-btn-examine click-element"
                     @click="checkAnswer">
                    检查答案
                </div>
            </div>
        </transition>

        <!--  显示移动的模块:响应拖拽动作  -->
        <div class="disturbance-tag draging-tag nopointer noselect"
             :class="dragingTag.animated?'animated':''"
             :style="{
                left:dragingTag.x + 'px',
                top:dragingTag.y + 'px'
              }"
             v-show="isTagDraging">
            {{dragingTagVal}}
        </div>
    </div>
</template>

<script>
    import uuidv1 from 'uuid/v1';
    import {cefMsg} from 'src/callCplus'
    import {getQueryString} from "src/utils";

    // 默认题目模板
    let defaultQuesTemplate = () => {
        return {
            id: uuidv1(),
            // 题目内容列表
            contentList: [
                [
                    {
                        class: 'txtBox',
                        value: ''
                    }
                ]
            ],
            // 干扰项
            disturbanceTags: [],
            // 当前题目最终结果
            finishResult: {
                // 0 - 有对有错，1 - 全对，2 - 全错
                result: 0,
                show: false,
                // 收起到角落
                corner: false,
                // 显示正确答案
                showValue: false
            }
        }
    };

    export default {
        name: "playBox",
        data () {
            return {
                swiperOption: {
                    allowTouchMove: false,
                    slidesPerView: 1.4,
                    noSwiping: true,
                    centeredSlides: true,
                    // keyboard: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<span class="' + className + '">' + (index + 1) + '</span>';
                        }
                    },
                    navigation: {
                        nextEl: '.swiper-toggle-right',
                        prevEl: '.swiper-toggle-left'
                    }
                },
                // 当前轮播索引
                activeIndex: 0,
                // 题目信息
                questionInfo: {
                    title: '选词填空',
                    // 选择的主题
                    selectThemeIndex: 0,
                    // 题目列表
                    questionList: [
                        defaultQuesTemplate()
                    ]
                },
                // 当前空白的位置信息
                blankPosInfo: [],
                // 被悬停的标签
                hoveringTagIndex: -1,
                // 记录标签是否正在拖动
                isTagDraging: false,
                // 记录标签拖动原始起点
                orginPosition: {
                    x: 0,
                    y: 0
                },
                // 被拖动的标签属性
                dragingTag: {
                    index: -1,
                    subIndex: -1,
                    w: 0,
                    h: 0,
                    x: 0,
                    y: 0,
                    animated: false
                },
                // 记录每个轮播题目空白完成情况
                slideFinishLength: [],

                // 获取数据目录
                dataPath: getQueryString('datapath')
            }
        },
        computed: {
            cardSwiper () {
                return this.$refs.cardSwiper.swiper
            },
            // 拖动标签的值
            dragingTagVal () {
                if (this.dragingTag.index === -1 || this.dragingTag.subIndex === -1) return;
                return this.questionInfo.questionList[this.dragingTag.index].answerTagGather[this.dragingTag.subIndex].content;
            }
        },
        mounted () {
            if (this.dataPath) {
                this.$axios.request({
                    baseURL: this.dataPath,
                    url: "/userdata.json",
                    method: 'GET',
                    headers: {'X-Requested-With': 'XMLHttpRequest'},
                    timeout: 30000,
                    transformResponse (data) {
                        data = data.replace(/&apos;/g, '\'').replace(/&quot;/g, '\\"');
                        data = JSON.parse(data.replace(/\\"/g, '"'));

                        return data
                    }
                }).then((res) => {
                    this.initData(res.data);
                }).catch((error) => {
                    console.log(error);
                    this.getDataByClient();
                })
            } else {
                cefMsg('micro.cotroler', 'getdata', '', 'sendjsdata').then((data) => {
                    this.getDataByClient();
                });
            }

            this.swiperSlideCallback();
        },
        methods: {
            // 初始化数据
            initData (data) {
                if (data.h5data) {
                    data.h5data.title = decodeURIComponent(data.h5data.title);
                    data.h5data.questionList.forEach((item) => {
                        this.$set(item, 'finishResult', {
                            // 0 - 有对有错，1 - 全对，2 - 全错
                            result: 0,
                            show: false,
                            // 收起到角落
                            corner: false,
                            // 显示正确答案
                            showValue: false
                        });
                        item.contentList.forEach((pItem) => {
                            pItem.forEach((subItem) => {
                                subItem.value = decodeURIComponent(subItem.value);
                            })
                        })
                        item.disturbanceTags.forEach((pItem) => {
                            pItem.content = decodeURIComponent(pItem.content);
                        })
                    });
                    this.questionInfo = this.$deepClone(data.h5data);
                    this.$nextTick(() => {
                        this.calcAnswerTagGather();
                        this.initSlideLength();
                    })
                }
            },
            // 通过客户端获得数据
            getDataByClient () {
                let _cmd = '';
                if (navigator.userAgent.indexOf('Windows') === -1) {
                    // 获取安卓数据
                    _cmd = 'AndroidCallHtmlData';
                } else {
                    _cmd = 'micro.cotroler'
                }

                cefMsg(_cmd, 'getdata', '', 'sendjsdata').then((data) => {
                    this.initData(data);
                });
            },
            // 轮播滚动结束回调
            swiperSlideCallback () {
                this.cardSwiper.on('slideChangeTransitionEnd', (ev) => {
                    this.activeIndex = this.cardSwiper.activeIndex;
                    // 计算当前轮播中空白的位置
                    this.calcBlankPosition();
                })
            },
            // 计算当前轮播中空白的位置
            calcBlankPosition () {
                let _answerTagRect = null,
                    _blankIndex = 0;

                this.questionInfo.questionList[this.activeIndex].contentList.forEach((pItem) => {
                    pItem.forEach((subItem) => {
                        if (subItem.class !== 'txtBox') {
                            _answerTagRect = document.getElementById(`inputBox_${subItem.id}`).getBoundingClientRect();

                            this.blankPosInfo[this.activeIndex][_blankIndex].x1 = _answerTagRect.left;
                            this.blankPosInfo[this.activeIndex][_blankIndex].x2 = _answerTagRect.left + _answerTagRect.width;
                            this.blankPosInfo[this.activeIndex][_blankIndex].y1 = _answerTagRect.top;
                            this.blankPosInfo[this.activeIndex][_blankIndex].y2 = _answerTagRect.top + _answerTagRect.height;
                            _blankIndex++;
                        }
                    })
                })
            },
            // 初始化答题记录
            initSlideLength () {
                // 初始化答题记录
                this.questionInfo.questionList.forEach(() => {
                    this.slideFinishLength.push(0);
                });
            },
            // 跳转到这张卡片
            turnToThisCard (index) {
                if (this.cardSwiper.activeIndex === index) return;
                this.cardSwiper.slideTo(index)
            },
            // 计算答案标签集合位置
            calcAnswerTagGather () {
                let _answerTagRect = null;
                this.blankPosInfo = [];
                this.questionInfo.questionList.forEach((item, index) => {
                    this.blankPosInfo.push([]);
                    this.$set(item, 'answerTagGather', this.$deepClone(item.disturbanceTags));
                    item.contentList.forEach((pItem, pIndex) => {
                        pItem.forEach((subItem, subIndex) => {
                            if (subItem.class !== 'txtBox') {
                                _answerTagRect = document.getElementById(`inputBox_${subItem.id}`).getBoundingClientRect();
                                item.answerTagGather.push({
                                    id: subItem.id,
                                    content: subItem.value,
                                    disabled: true
                                });
                                this.blankPosInfo[index].push({
                                    x1: _answerTagRect.left,
                                    x2: _answerTagRect.left + _answerTagRect.width,
                                    y1: _answerTagRect.top,
                                    y2: _answerTagRect.top + _answerTagRect.height,
                                    index,
                                    pIndex,
                                    subIndex
                                })
                            }
                        })
                    })
                    // 混合打乱标签集合顺序
                    item.answerTagGather.sort(function () {
                        return 0.5 - Math.random()
                    });
                })
            },
            /* 答题操作，拖动标签 */
            elementPanStart (ev) {
                console.log('panstart');
                // 判断触摸开始的位置是否为标签
                let $tag = this.$parentIndexOf(document.elementFromPoint(ev.center.x, ev.center.y), 'onDrag-tag');

                if ($tag) {
                    this.isTagDraging = true;
                    this.orginPosition = {
                        x: $tag.getBoundingClientRect().left,
                        y: $tag.getBoundingClientRect().top
                    };
                    this.dragingTag = {
                        index: Number($tag.getAttribute('data-index')),
                        subIndex: Number($tag.getAttribute('data-subIndex')),
                        w: $tag.offsetWidth,
                        h: $tag.offsetHeight,
                        x: 0,
                        y: 0
                    };
                    this.$set(this.questionInfo.questionList[this.dragingTag.index].answerTagGather[this.dragingTag.subIndex], 'hidden', true)
                    this.movingTag(ev.deltaX, ev.deltaY);
                }
            },
            elementPanMove (ev) {
                // console.log('panmove');
                if (!this.isTagDraging) return;
                this.movingTag(ev.deltaX, ev.deltaY);
                // 判断当前位置是否可以放下标签
                this.judgePosition();
            },
            elementPanEnd (ev) {
                console.log('panend');
                if (!this.isTagDraging) return;
                this.movingTag(ev.deltaX, ev.deltaY);
                this.judgeAnswerpanend()
            },
            // 移动标签
            movingTag (deltaX, deltaY) {
                this.dragingTag.x = this.orginPosition.x + deltaX;
                this.dragingTag.y = this.orginPosition.y + deltaY;
            },
            // 判断当前位置是否可以放下标签
            judgePosition () {
                let _activeIndex = this.cardSwiper.activeIndex,
                    _blanArry = this.blankPosInfo[_activeIndex];

                this.hoveringTagIndex = -1;
                for (let i = 0; i < _blanArry.length; i++) {
                    this.$set(this.questionInfo.questionList[_activeIndex]
                        .contentList[this.blankPosInfo[_activeIndex][i].pIndex]
                        [this.blankPosInfo[_activeIndex][i].subIndex], 'statu', 0);
                    if (this.dragingTag.x > (_blanArry[i].x1 - this.dragingTag.w) &&
                        this.dragingTag.x < _blanArry[i].x2 &&
                        this.dragingTag.y < _blanArry[i].y2 &&
                        this.dragingTag.y > (_blanArry[i].y1 - this.dragingTag.h)) {
                        this.hoveringTagIndex = i;
                    }
                }
                if (this.hoveringTagIndex !== -1) {
                    this.$set(this.questionInfo.questionList[_activeIndex]
                        .contentList[this.blankPosInfo[_activeIndex][this.hoveringTagIndex].pIndex]
                        [this.blankPosInfo[_activeIndex][this.hoveringTagIndex].subIndex], 'statu', 1);
                }
            },
            // 判断当前标签答案是否可以落下
            judgeAnswerpanend () {
                let _activeIndex = this.cardSwiper.activeIndex,
                    _blanArry = this.blankPosInfo[_activeIndex];
                let _hoveringTag = null,
                    _answerTagGather = this.questionInfo.questionList[_activeIndex].answerTagGather;

                if (this.hoveringTagIndex === -1) {
                    this.dragingTag.x = this.orginPosition.x;
                    this.dragingTag.y = this.orginPosition.y;
                    this.dragingTag.animated = true;
                    setTimeout(() => {
                        this.dragingTag.animated = false;
                        _answerTagGather[this.dragingTag.subIndex].hidden = false;
                        this.isTagDraging = false;
                    }, 200)
                } else {
                    this.isTagDraging = false;

                    _hoveringTag = this.questionInfo.questionList[_activeIndex]
                        .contentList[_blanArry[this.hoveringTagIndex].pIndex]
                        [_blanArry[this.hoveringTagIndex].subIndex];

                    if (typeof _hoveringTag.answerIndex === 'number' && _hoveringTag.answerIndex !== -1) {
                        this.slideFinishLength[_activeIndex]--;
                        _answerTagGather[_hoveringTag.answerIndex].hidden = false;
                    }
                    // 标记当前答案是否正确，2 - 正确，3 - 错误
                    this.$set(_hoveringTag, 'statu', 0);
                    this.$set(_hoveringTag, 'result', _hoveringTag.value === _answerTagGather[this.dragingTag.subIndex].content);
                    this.$set(_hoveringTag, 'finish', true);
                    this.$set(_hoveringTag, 'answer', _answerTagGather[this.dragingTag.subIndex].content);
                    this.$set(_hoveringTag, 'answerIndex', this.dragingTag.subIndex);
                    // 当前题目完成数量+1
                    this.slideFinishLength[_activeIndex]++;
                    this.hoveringTagIndex = -1;

                    if (this.slideFinishLength[_activeIndex] >= this.blankPosInfo[_activeIndex].length) {
                        this.publishResult();
                    }
                }
            },
            // 选词完成，公布结果
            publishResult () {
                let _activeIndex = this.cardSwiper.activeIndex,
                    // 全对
                    _isAllRight = true,
                    // 全错
                    _isAllWrong = true,
                    _activeCard = this.questionInfo.questionList[_activeIndex];

                // 当前轮播题目完成
                this.$set(_activeCard, 'finish', true);

                _activeCard.contentList.forEach((pItem) => {
                    pItem.forEach((subItem) => {
                        if (subItem.class !== 'txtBox') {
                            if (subItem.result) {
                                _isAllWrong = false;
                            } else {
                                _isAllRight = false;
                            }
                        }
                    })
                })
                // 更新最终评价结果，0 - 有对有错，1 - 全对，2 - 全错
                _activeCard.finishResult.result = _isAllRight ? 1 : (_isAllWrong ? 2 : 0);
                _activeCard.finishResult.show = true;
                setTimeout(() => {
                    _activeCard.finishResult.corner = true;
                }, 700)
            },
            // 重做这次题目
            redoThis () {
                let _activeIndex = this.cardSwiper.activeIndex,
                    _activeCard = this.questionInfo.questionList[_activeIndex];

                this.slideFinishLength[_activeIndex] = 0;
                _activeCard.finishResult.show = false;
                _activeCard.finishResult.showValue = false;
                _activeCard.finishResult.corner = false;
                _activeCard.finish = false;
                _activeCard.contentList.forEach((pItem) => {
                    pItem.forEach((subItem) => {
                        subItem.finish = false;
                        subItem.answerIndex = -1;
                    })
                });
                _activeCard.answerTagGather.forEach((item) => {
                    item.finish = false;
                    item.hidden = false;
                })
                this.$nextTick(() => {
                    // 计算当前轮播中空白的位置
                    this.calcBlankPosition();
                })
            },
            // 检查答案,显示正确答案
            checkAnswer () {
                let _activeIndex = this.cardSwiper.activeIndex,
                    _activeCard = this.questionInfo.questionList[_activeIndex];

                _activeCard.finishResult.show = false;
                _activeCard.finishResult.showValue = true;
            }
        }
    }
</script>
<style lang="scss">
    @import "../styles/word_container";
</style>
