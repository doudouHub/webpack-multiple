<template>
    <div :class="previewMode?'preview-mode':''">
        <sidebar
            :selectThemeIndex="questionInfo.selectThemeIndex"
            @selectTheme="selectTheme">
        </sidebar>

        <div class="page-container"
             :style="`background-image:url('assets/img/theme/theme_${questionInfo.selectThemeIndex+1}.png')`">
            <!--  内容编辑区域  -->
            <div class="page-main">
                <div class="content-flag noselect">
                    <img src="assets/img/icon_ele_flag.png"/>
                </div>

                <div class="content-title text-center">
                    <el-input v-model="questionInfo.title" placeholder="请输入内容" v-show="!previewMode"></el-input>
                    <span class="noselect" v-show="previewMode">{{questionInfo.title}}</span>
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
                    <swiper class="word-container" :options="swiperOption" ref="cardSwiper">
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
                                <div class="el-icon-close card-btn-delete click-element" @click="deleteThisCard(index)"
                                     v-show="!previewMode && questionInfo.questionList.length>1">
                                </div>
                                <div class="input-box-types text-center clearfix noselect"
                                     v-show="!previewMode">
                                    <div class="label pull-left">
                                        选择插入填空样式：
                                    </div>
                                    <div class="input-box-list pull-left clearfix">
                                        <div class="item pull-left click-element" @click="insertInputTemp('bracket',1)">
                                            (<span
                                            class="tip">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;答案&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)
                                        </div>
                                        <div class="item pull-left click-element" @click="insertInputTemp('line',1)">
                                            <span class="tip line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;答案&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        </div>
                                        <div class="item pull-left click-element" @click="insertInputTemp('bracket',3)">
                                            (<span class="tip"> 答案 </span>)、
                                            (<span class="tip"> 答案 </span>)、
                                            (<span class="tip"> 答案 </span>)
                                        </div>
                                        <div class="item pull-left click-element" @click="insertInputTemp('line',3)">
                                            <span class="tip line">&nbsp;&nbsp;答案&nbsp;&nbsp;</span>、
                                            <span class="tip line">&nbsp;&nbsp;答案&nbsp;&nbsp;</span>、
                                            <span class="tip line">&nbsp;&nbsp;答案&nbsp;&nbsp;</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="tip-words text-center noselect" v-show="previewMode">请将答案拖动到对应的空格内。</div>
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
                                                aria-palceholder="请输入题目内容，按回车键添加小题目…"
                                                v-model="subItem.value"
                                                :class="subItem.class"
                                                :id="`inputBox_${subItem.id}`"
                                                :data-index="index"
                                                :data-pIndex="pIndex"
                                                :data-subIndex="subIndex"
                                                :contenteditable="!previewMode"
                                                :noNL="true"
                                                :noHTML="subItem.class!=='txtBox'"
                                                @keyup="contentKeyUp($event,index,pIndex,subIndex)"
                                                @keydown="contentKeydown($event,index, pIndex, subIndex)"
                                                @mouseup="getSelectionInfoByMouse($event,index,pIndex,subIndex)"
                                                v-show="!subItem.finish"/>
                                        </div>
                                    </div>
                                </div>

                                <!--  干扰项编辑框  -->
                                <div class="animated fadeInUp" v-show="!previewMode">
                                    <div class="tip-line noselect">
                                        输入干扰项（{{item.disturbanceTags.length}}/{{maxTagLength}}）
                                    </div>
                                    <div class="disturbance-box">
                                        <template v-for="(subItem,subIndex) in item.disturbanceTags">
                                            <el-tag
                                                closable
                                                @click.native="editThisTag(index,subIndex,subItem.content,subItem.id)"
                                                @close="deleteThisTag(index,subIndex)"
                                                :disable-transitions="true"
                                                :key="subItem.id"
                                                v-show="subItem.disabled">
                                                {{subItem.content}}
                                            </el-tag>
                                            <div class="tag-input"
                                                 contenteditable="true"
                                                 spellcheck='false'
                                                 :id="'input_edit_tag_'+subItem.id"
                                                 @blur="confirmTagEdit(index,subIndex)"
                                                 @keyup="boxInputChange($event,index,subIndex,subItem.id)"
                                                 v-show="!subItem.disabled">
                                                {{subItem.content}}
                                            </div>
                                        </template>
                                        <el-input
                                            class="input-new-tag"
                                            v-model="inputTagValue[index]"
                                            ref="saveTagInput"
                                            size="small"
                                            @keydown.native="handleInputConfirm($event,index)"
                                            @blur="handleInputConfirm($event,index)"
                                            placeholder="请输入干扰项，按回车键添加…"
                                            v-show="item.disturbanceTags.length<maxTagLength">
                                        </el-input>
                                    </div>
                                </div>
                                <!--  干扰项标签展示  -->
                                <div class="disturbance-tags noselect"
                                     :class="item.finish?'nopointer finish':''"
                                     v-show="previewMode">
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
                <transition
                    enter-active-class="animated fadeInUp"
                    leave-active-class="animated fadeOutDown">
                    <div class="card-btn-add icon-elements noselect click-element"
                         :class="questionInfo.questionList.length<5?'':'hide'"
                         @click="addNewCard"
                         v-if="!previewMode">
                        <div class="el-icon-plus"></div>
                        添加题目（{{questionInfo.questionList.length}}/5）
                    </div>
                </transition>
            </div>
        </div>
        <transition
            enter-active-class="animated slideInRight"
            leave-active-class="animated slideOutRight">
            <div class="card-btn-side-right noselect"
                 :class="questionInfo.questionList[activeIndex].finish?'':'disabled'"
                 v-if="previewMode">
                <div class="icon-elements card-btn-return click-element"
                     @click="redoThis"></div>
                <div class="icon-elements card-btn-examine click-element"
                     @click="checkAnswer">
                    检查答案
                </div>
            </div>
        </transition>
        <transition
            enter-active-class="animated slideInUp"
            leave-active-class="animated slideOutDown">
            <div class="card-btn-side-right-bottom clearfix noselect" v-if="previewMode&&!screenshotMode">
                <div class="icon-elements card-btn-bacpreview pull-left click-element" @click="goPreview(false)">
                    退出预览
                </div>
                <div class="icon-elements card-btn-insert pull-left click-element"
                     @click="$refs.pageFooter.insertToPPT()">
                    {{isClientMode?'保存至云端':(editAgain?'保存到PPT':'插入PPT')}}
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
        <page-footer
            ref="pageFooter"
            @goPreview="goPreview"
            @goScreenshotMode="goScreenshotMode"
            :questionInfo="questionInfo"
            :isCanPreview="isCanPreview"
            :isClientMode="isClientMode"
            :editAgain="editAgain"
            :savedData="savedData">
        </page-footer>
    </div>
</template>

<script>
    import uuidv1 from 'uuid/v1';
    import {cefMsg} from 'src/callCplus'
    import {getQueryString} from "src/utils";

    const Sidebar = () => import('../components/Sidebar');
    const PageFooter = () => import('../components/Footer');

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
        name: "editBox",
        components: {
            PageFooter,
            Sidebar
        },
        data () {
            return {
                // 预览模式
                previewMode: false,
                // 再次编辑模式
                editAgain: false,
                // 当前是否可预览
                isCanPreview: false,
                // 截图模式
                screenshotMode: false,
                swiperOption: {
                    allowTouchMove: false,
                    slidesPerView: 1.22,
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
                // 当前光标对象
                selection: {
                    index: 0,
                    pIndex: 0,
                    subIndex: 0,
                    start: 0,
                    end: 0,
                    txt: '',
                    endEl: null,
                    className: ''
                },

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
                // 当前轮播索引
                activeIndex: 0,
                // 最大干扰标签数量
                maxTagLength: 5,
                // 干扰项当前编辑内容
                inputTagValue: [],
                // 编辑之前的数据
                savedData: null,

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
                // 客户端模式:1 新建编辑模式，2 预览模式
                isClientMode: 0,

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
                    cefMsg('micro.cotroler', 'getdata', '', 'sendjsdata').then((res) => {
                        console.log('sendjsdata=>', res)
                        this.initData(res.data);
                    });
                })
            } else {
                cefMsg('micro.cotroler', 'getdata', '', 'sendjsdata').then((res) => {
                    this.initData(res.data);
                });
            }

            this.modeTest(false);

            // 轮播结束滚动回调
            this.swiperSlideCallback();
        },
        methods: {
            // 初始化数据
            initData (data) {
                if (data.h5data) {
                    this.savedData = this.$deepClone(data.h5data);
                    this.editAgain = true;
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
                    // 模式检测 - 判断当前是否处于客户端模式
                    this.modeTest(true);
                } else {
                    let _questionInfo = this.$deepClone(this.questionInfo);

                    delete _questionInfo.questionList[0].finishResult;
                    _questionInfo.title = encodeURIComponent(_questionInfo.title);
                    this.savedData = _questionInfo;
                    this.modeTest(false);
                }
            },
            // 模式检测 - 判断当前是否处于客户端模式
            modeTest (bool) {
                let _isClientMode = this.$getQueryString('isClientMode');
                // 如果当前为客户端模式：打开预览，屏蔽插入功能
                if (_isClientMode) {
                    this.isClientMode = _isClientMode ? 2 : 1;
                    if (bool) {
                        this.goPreview(true)
                    }
                }
            },
            // 轮播滚动结束回调
            swiperSlideCallback () {
                this.cardSwiper.on('slideChangeTransitionEnd', () => {
                    this.activeIndex = this.cardSwiper.activeIndex;
                    // 计算当前轮播中空白的位置
                    this.calcBlankPosition();
                })
            },
            // 计算当前轮播中空白的位置
            calcBlankPosition () {
                if (this.previewMode) {
                    let _answerTagRect = null,
                        _blankIndex = 0;
                    // 计算当前轮播中空白的位置
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
                }
            },
            // 光标对象重新初始化
            selectionInit () {
                this.selection = {
                    index: 0,
                    pIndex: 0,
                    subIndex: 0,
                    start: 0,
                    end: 0,
                    txt: '',
                    endEl: null,
                    className: ''
                }
            },
            // 鼠标获取光标所处位置信息：index/pIndex/subIndex - 当前光标所处的数组位置,pIndex 段落索引
            getSelectionInfoByMouse (ev, index, pIndex, subIndex) {
                this.selection = this.$getSelection(ev.target);
                this.selection.index = index;
                this.selection.pIndex = pIndex;
                this.selection.subIndex = subIndex;
                console.log(`0,start:${this.selection.start}，end:${this.selection.end}，pIndex:${this.selection.pIndex}，subIndex:${this.selection.subIndex}，classname:${this.selection.className}`);
            },
            // 系统获取光标所处位置信息：index/pIndex/subIndex - 当前光标所处的数组位置,pIndex 段落索引
            getSelectionInfoByWin () {
                this.selection = this.$getSelection();
                this.selection.index = Number(this.selection.endEl.getAttribute('data-index'));
                this.selection.pIndex = Number(this.selection.endEl.getAttribute('data-pIndex'));
                this.selection.subIndex = Number(this.selection.endEl.getAttribute('data-subIndex'));
                console.log(`1,start:${this.selection.start}，end:${this.selection.end}，pIndex:${this.selection.pIndex}，subIndex:${this.selection.subIndex}，classname:${this.selection.className}`);
            },
            // 手动设置光标位置信息
            setSelectionInfo (target, index, pIndex, subIndex) {
                this.$nextTick(() => {
                    this.selection.start = 0;
                    this.selection.end = 0;
                    this.selection.txt = '';
                    this.selection.index = index;
                    this.selection.pIndex = pIndex;
                    this.selection.subIndex = subIndex;
                    this.selection.endEl = target;
                    this.selection.className = target.className;
                })
                console.log(`2,start:${this.selection.start}，end:${this.selection.end}，pIndex:${this.selection.pIndex}，subIndex:${this.selection.subIndex}，classname:${this.selection.className}`);
            },
            // 判断当前聚焦内容是否为空
            isFocusedNull () {
                try {
                    let _fouseValue = this.questionInfo.questionList[this.selection.index].contentList[this.selection.pIndex][this.selection.subIndex].value;
                    let isNull = (_fouseValue === '' || _fouseValue === undefined || _fouseValue === null);
                    if (isNull) {
                        this.selection.start = 0;
                        this.selection.end = 0;
                    }
                    return isNull;
                } catch (err) {
                    // console.log(err);
                    return false;
                }
            },
            // 编辑标签键盘弹起事件 - 失焦，切入下一段落
            contentKeyUp (ev, index, pIndex, subIndex) {
                if (!this.isFocusedNull()) {
                    this.getSelectionInfoByWin();
                }
                switch (Number(ev.keyCode)) {
                    case 9:
                        // Tab
                        this.setSelectionInfo(ev.target, index, pIndex, subIndex);
                        break;
                    case 13:
                        // Enter
                        event.preventDefault();
                        if (this.selection.className.indexOf('inputBox') > -1) {
                            // inputbox回车
                            let _nextEl = this.selection.endEl.parentElement.nextElementSibling.lastChild;

                            _nextEl.focus();
                            this.selection.subIndex++;
                            this.selection.endEl = _nextEl;
                            this.selection.className = _nextEl.className;
                        } else {
                            // 正常文本回车 - 添加新的题目段落
                            let _currentList = this.questionInfo.questionList[this.selection.index].contentList;

                            _currentList.splice(
                                this.selection.pIndex + 1, 0,
                                [
                                    {
                                        class: 'txtBox',
                                        value: ''
                                    }
                                ]
                            );

                            this.$nextTick(() => {
                                let _nextEl = this.selection.endEl.parentElement.parentElement.nextElementSibling.lastChild.lastChild;

                                _nextEl.focus();
                                this.selection.pIndex++;
                                this.selection.subIndex = 0;
                                this.selection.endEl = _nextEl;
                                this.selection.className = _nextEl.className;
                            })
                        }
                        break;
                }
            },
            // 编辑标签键盘按压事件 - 失焦，切入下一段落
            contentKeydown (ev, index, pIndex, subIndex) {
                let _currentList = this.questionInfo.questionList[this.selection.index].contentList,
                    _currentBox = _currentList[this.selection.pIndex][this.selection.subIndex],
                    _val = _currentBox.value;

                switch (Number(ev.keyCode)) {
                    case 8:
                        // BackSpace
                        // 如果当前光标处于首位但标签位置不是处于段落首位
                        if (this.selection.className.indexOf('inputBox') === -1) {
                            if (this.selection.subIndex && !this.selection.start) {
                                this.selection.subIndex--;
                                _currentList[this.selection.pIndex].splice(this.selection.subIndex, 1);
                                this.mergeTxtBox(_currentList, this.selection.subIndex);
                            }
                        }
                        this.deleteThisBox(ev, _currentList, index, pIndex, subIndex, 'backSpace');
                        break;
                    case 13:
                        event.preventDefault();
                        break;
                    case 46:
                        // Delete
                        // 如果当前光标处于末位但标签位置不是处于段落末位
                        if (this.selection.className.indexOf('inputBox') === -1) {
                            if ((this.selection.subIndex < _currentList[this.selection.pIndex].length - 1) && (this.selection.start === _val.length)) {
                                this.selection.subIndex++;
                                _currentList[this.selection.pIndex].splice(this.selection.subIndex, 1);
                                this.mergeTxtBox(_currentList, this.selection.subIndex);
                            }
                        }
                        this.deleteThisBox(ev, _currentList, index, pIndex, subIndex, 'delete');
                        break;
                }
            },
            // BackSpace/Delete按键删除当前段落/输入框
            deleteThisBox (ev, list, index, pIndex, subIndex, type) {
                if (this.selection.className.indexOf('inputBox') === -1) {
                    if (type === 'backSpace' && list.length > 1 && list[pIndex].length === 1 && !this.selection.start) {
                        // 当前文本框为段落唯一标签，删除该段落
                        let _prevEl = this.selection.endEl.parentElement.parentElement.previousElementSibling.lastChild.lastChild;

                        // 当前光标处于文本位置且所有文本已清空，删除该文本段落
                        list.splice(this.selection.pIndex, 1);
                        // 聚焦到上一层级
                        _prevEl.focus();
                        this.selection.pIndex--;
                        this.selection.subIndex = 0;
                        this.selection.endEl = _prevEl;
                        this.selection.className = _prevEl.className;
                    }
                } else if (this.isFocusedNull()) {
                    // 当前光标处于inputbox位置，删除此输入框
                    list[this.selection.pIndex].splice(this.selection.subIndex, 1);
                    if (subIndex) {
                        this.mergeTxtBox(list, subIndex);
                        this.setSelectionInfo(ev.target, index, pIndex, subIndex - 1);
                    } else {
                        // 重新获取光标所处位置信息
                        this.setSelectionInfo(ev.target, index, pIndex, subIndex);
                    }
                }
            },
            // 合并段落的txtBox,将文本段落连接为一体:subIndex - 标签的位置
            mergeTxtBox (list, subIndex) {
                let _prevTag = list[this.selection.pIndex],
                    _prevLength = _prevTag[subIndex - 1].value.length;

                if (_prevTag[subIndex - 1].class === 'txtBox') {
                    let _parentEL = this.selection.endEl.parentElement.parentElement;

                    _prevTag[subIndex].value = _prevTag[subIndex - 1].value + list[this.selection.pIndex][subIndex].value;
                    list[this.selection.pIndex].splice(subIndex - 1, 1);
                    this.$nextTick(() => {
                        this.$setSelectionPos(_parentEL.children[subIndex - 1].children[0], _prevLength)
                    })
                }
            },
            // 插入输入框模板:type - 模板类型，len - 添加数量
            insertInputTemp (type, len) {
                // 如果当前光标处于inputbox中，无法插入
                if (this.selection.className.indexOf('inputBox') > -1 || !this.selection.endEl) return;
                let _parentEL = this.selection.endEl.parentElement.parentElement;

                // 当前光标所处的可编辑框位置
                let _currentBox = this.questionInfo.questionList[this.selection.index].contentList[this.selection.pIndex],
                    _currentItem = _currentBox[this.selection.subIndex],
                    _currentItemValue = _currentItem.value,
                    // 输入框内容
                    _inputBoxArry = [],
                    i = 0;

                while (i < len) {
                    _inputBoxArry.push({
                        id: uuidv1(),
                        class: `inputBox ${type}`,
                        value: this.selection.txt || ''
                    });
                    i++;
                }
                // 插入模板，将该位置的文字内容分为两个可编辑区域
                let _contentList = [
                    {
                        class: 'txtBox',
                        value: _currentItemValue
                            .replace(/&nbsp;/g, '@')
                            .substring(0, this.selection.start > this.selection.end ? this.selection.end : this.selection.start)
                            .replace(/@/g, '&nbsp;')
                    },
                    {
                        class: 'txtBox',
                        value: _currentItemValue
                            .replace(/&nbsp;/g, '@')
                            .substring(this.selection.start < this.selection.end ? this.selection.end : this.selection.start)
                            .replace(/@/g, '&nbsp;')
                    }
                ]
                // 将输入框内容插入到模板中间
                _inputBoxArry.unshift(1, 0);
                Array.prototype.splice.apply(_contentList, _inputBoxArry);

                // 将拆分后的内容替换原来的内容
                _currentBox.splice(this.selection.subIndex, 1);
                _contentList.unshift(this.selection.subIndex, 0);
                Array.prototype.splice.apply(_currentBox, _contentList);
                // 强制vue更新
                this.$forceUpdate();

                this.$nextTick(() => {
                    this.selection.subIndex++;
                    this.selection.endEl = _parentEL.children[this.selection.subIndex].children[0];
                    this.selection.className = this.selection.endEl.className;
                    this.selection.txt = '';
                    // 光标重新定位输入框内
                    this.selection.endEl.focus();
                })
            },

            // 初始化答题记录
            initSlideLength () {
                // 初始化答题记录
                this.questionInfo.questionList.forEach((item) => {
                    this.slideFinishLength.push(0);
                });
            },
            // 选择主题
            selectTheme (index) {
                this.questionInfo.selectThemeIndex = index;
            },
            // 添加新题目卡片
            addNewCard () {
                this.questionInfo.questionList.splice(this.cardSwiper.activeIndex + 1, 0, defaultQuesTemplate());
                this.$nextTick(() => this.cardSwiper.slideNext(300));
                // 埋点
                cefMsg('micro.report_event', 'pointRecord', JSON.stringify({
                        module: '04',
                        cls: '0074',
                        func: '019'
                    })
                )
            },
            // 删除当前题目卡片
            deleteThisCard (index) {
                this.questionInfo.questionList.splice(index, 1);
            },
            // 切换预览模式
            goPreview (bool) {
                if (!this.verifyCardContent()) {
                    this.isCanPreview = false;
                    return
                } else {
                    this.isCanPreview = true;
                }
                this.previewMode = bool;
                this.cardSwiper.params.slidesPerView = bool ? 1.4 : 1.22;
                this.cardSwiper.update();
                if (bool) {
                    this.$nextTick(() => {
                        // 计算答案合集
                        this.calcAnswerTagGather();
                    });
                    this.initSlideLength();
                } else {
                    this.recoverCards();
                }
            },
            // 预览之前，校验内容是否填写完整
            verifyCardContent () {
                for (let [index, item] of new Map(this.questionInfo.questionList.map((item, index) => [index, item]))) {
                    let _isCardEmpty = true, _isValueEmpty = false;
                    for (let pItem of item.contentList) {
                        if (pItem.length === 1 && !pItem[0].value) {
                            this.$message({
                                message: '请输入题目内容',
                                type: 'warning'
                            });
                            this.cardSwiper.slideTo(index, 300);
                            return false
                        }
                        for (let subItem of pItem) {
                            if (subItem.class !== 'txtBox') {
                                _isCardEmpty = false;
                                if (subItem.value === '' || subItem.value === undefined || subItem.value === null) {
                                    _isValueEmpty = true;
                                    break;
                                }
                            }
                        }
                        if (_isCardEmpty) {
                            this.$message({
                                message: '请添加至少一个填空项',
                                type: 'warning'
                            });
                            this.cardSwiper.slideTo(index, 300);
                            return false
                        }
                        if (_isValueEmpty) {
                            this.$message({
                                message: '请为所有填空项设置答案',
                                type: 'warning'
                            });
                            this.cardSwiper.slideTo(index, 300);
                            return false
                        }
                    }
                    // if (!item.disturbanceTags.length) {
                    //     this.$message({
                    //         message: '请输入至少一个干扰项',
                    //         type: 'warning'
                    //     });
                    //     this.cardSwiper.slideTo(index, 300);
                    //     return false
                    // }
                }
                return true;
            },
            // 打开截图模式
            goScreenshotMode () {
                this.goPreview(true);
                this.screenshotMode = true;
                return 123
            },
            // 退出预览，回复所有状态
            recoverCards () {
                this.questionInfo.questionList.forEach((item, index) => {
                    this.slideFinishLength[index] = 0;
                    item.finish = false;
                    item.finishResult.show = false;
                    item.finishResult.showValue = false;
                    item.finishResult.corner = false;
                    item.contentList.forEach((pItem) => {
                        pItem.forEach((subItem) => {
                            subItem.finish = false;
                            subItem.answerIndex = -1;
                        })
                    });
                    item.answerTagGather.forEach((pItem) => {
                        pItem.finish = false;
                        pItem.hidden = false;
                    })
                });
            },
            /*    编辑干扰项    */
            // 编辑此标签
            editThisTag (index, subIndex, content, id) {
                this.questionInfo.questionList[index].disturbanceTags[subIndex].disabled = false;
                this.editTagCache = content;

                this.$nextTick(function () {
                    let _tag = document.getElementById('input_edit_tag_' + id);
                    _tag.innerText = _tag.innerText.replace(/(\s*$)/g, "");
                    setTimeout(function () {
                        if (window.getSelection) { // ie11 10 9 ff safari
                            _tag.focus(); // 解决ff不获取焦点无法定位问题
                            let range = window.getSelection();// 创建range
                            range.selectAllChildren(_tag);// range 选择obj下所有子内容
                            range.collapseToEnd();// 光标移至最后
                        }
                        else if (document.selection) { // ie10 9 8 7 6 5
                            let range = document.selection.createRange();// 创建选择对象
                            // var range = document.body.createTextRange();
                            range.moveToElementText(_tag);// range定位到obj
                            range.collapse(false);// 光标移至最后
                            range.select();
                        }
                    }, 0);
                })
            },
            // 确认编辑
            confirmTagEdit (index, subIndex) {
                if (this.editTagCache) {
                    this.questionInfo.questionList[index].disturbanceTags[subIndex].disabled = true;
                    this.questionInfo.questionList[index].disturbanceTags[subIndex].content = this.editTagCache;
                    this.editTagCache = '';
                }
            },
            // 标签编辑内容改变时更新缓存内容
            boxInputChange (ev, index, subIndex, id) {
                if (Number(ev.keyCode) === 13) {
                    this.confirmTagEdit(index, subIndex);
                } else {
                    let _tag = document.getElementById('input_edit_tag_' + id);
                    if (Number(ev.keyCode) === 8 && !this.editTagCache) {
                        // 当前标签已经为空，再次回车，删除此标签
                        this.questionInfo.questionList[index].disturbanceTags.splice(subIndex, 1);
                    } else {
                        this.editTagCache = _tag.innerText;
                    }
                }
            },
            // 删除此标签
            deleteThisTag (index, subIndex) {
                this.questionInfo.questionList[index].disturbanceTags.splice(subIndex, 1);
            },
            // 确认添加标签
            handleInputConfirm (ev, index) {
                // console.log('确认添加标签: ' + ev.keyCode);
                if (this.questionInfo.questionList[index].disturbanceTags.length >= 5) return;
                this.showNullTip = false;

                let _inputTagValue = this.inputTagValue[index];
                if (ev.type === 'blur' || Number(ev.keyCode) === 13) {
                    if (_inputTagValue) {
                        this.questionInfo.questionList[index].disturbanceTags.push({
                            id: uuidv1(),
                            content: _inputTagValue,
                            disabled: true
                        });
                        this.inputTagValue[index] = '';
                    }
                } else if (Number(ev.keyCode) === 8 && !_inputTagValue && this.questionInfo.questionList.length) {
                    // 当前内容已清空，删除上一个标签
                    this.questionInfo.questionList[index].disturbanceTags.pop();
                }
            },

            // 跳转到这张卡片
            turnToThisCard (index) {
                if (this.cardSwiper.activeIndex === index) return;
                this.cardSwiper.slideTo(index)
            },
            // 计算答案标签集合位置
            calcAnswerTagGather () {
                console.log('计算答案标签集合位置')
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
    @import "../../../style_scss/config";

    .disturbance-box {
        width            : vw(920);
        height           : vw(80);
        padding          : vw(20) vw(20) vw(15);
        background-color : #fff;
        overflow-y       : auto;
        box-shadow       : 0 vw(2) vw(4) rgba(0, 0, 0, .2);
        .el-tag {
            position         : relative;
            min-width        : vw(80);
            height           : vw(40);
            line-height      : vw(40);
            margin     : {
                right  : vw(5);
                bottom : vw(5);
            }
            padding-right    : vw(30);
            border           : none;
            background-color : #c0e6ff;
            font-size        : vw(18);
            color            : #333;
            white-space      : normal;
            word-break       : break-all;
            .el-tag__close {
                position         : absolute;
                top              : 50%;
                right            : vw(10);
                width            : vw(16);
                height           : vw(16);
                line-height      : vw(16);
                margin-top       : vw(-8);
                background-color : transparent;
                font-size        : vw(18);
                font-weight      : bold;
                color            : #fff;
            }
        }
        .tag-input {
            display        : inline-block;
            min-width      : vw(80);
            max-width      : vw(200);
            height         : vw(40);
            padding        : 0 vw(5);
            margin-right   : vw(10);
            border-bottom  : vw(1) solid #999;
            font-size      : vw(18);
            color          : #333;
            text-align     : center;
            line-height    : vw(40);
            outline        : none;
            vertical-align : top;
            overflow       : hidden;
        }
        .input-new-tag {
            width     : vw(240);
            font-size : vw(13);
            .el-input__inner {
                border           : none;
                padding          : 0;
                background-color : transparent;
                font-size        : vw(18);
                color            : #333;
                height           : vw(40);
                line-height      : vw(40);
            }
        }
    }

    .content-title {
        input {
            display          : block;
            width            : vw(720);
            height           : vw(52);
            margin           : 0 auto;
            background-color : transparent;
            border     : {
                width  : vw(1);
                style  : dashed;
                color  : rgba(255, 255, 255, 0.51);
                radius : vw(5);
            }
            font-size        : vw(24);
            text-align       : center;
            color            : #fff;
        }
    }
</style>
<style lang="scss" scoped>
    @import "../../../style_scss/config";

    .page-container {
        padding    : {
            right  : vw(260);
            bottom : vw(60);
        }
    }

    .word-container {
        .contenteditable-box {
            background-color : #fff;
            overflow-y       : auto;
            box-shadow       : 0 vw(2) vw(4) rgba(0, 0, 0, .2);
            .input-box-container {
                &:only-child {
                    display : block;
                    .txtBox {
                        &:empty {
                            display : block;
                            color   : #999;
                            cursor  : text;
                            &:before {
                                @include stretch(0, 0, 0, 0);
                                content : attr(aria-palceholder);
                            }
                        }
                    }

                }
            }
            .inputBox {
                min-width    : vw(125);
                height       : vw(35);
                line-height  : vw(35);
                color        : #333;
                border-color : $mainColor;
                cursor       : text;
                &:empty {
                    &:before {
                        color   : #999;
                        content : '答案';
                    }
                }
            }
        }
        .card-item {
            &.swiper-slide-active {
                .card-btn-delete {
                    display : block;
                }
            }
            .card-btn-delete {
                display                   : none;
                @include stretch(0, 0, false, false);
                z-index                   : 100;
                width                     : vw(32);
                height                    : vw(32);
                line-height               : vw(32);
                background-color          : rgba(51, 51, 51, 0.5);
                border-bottom-left-radius : vw(5);
                font-size                 : vw(18);
                font-weight               : bold;
                color                     : #fff;
                text-align                : center;
            }
            .card-item-box {
                width  : vw(1040);
                height : vw(520);
            }
        }
        .input-box-types {
            margin      : vw(30) auto;
            line-height : vw(36);
            color       : #555;
            .label {
                font-size : vw(14);
            }
            .input-box-list {
                > .item {
                    position         : relative;
                    min-width        : vw(128);
                    margin-right     : vw(30);
                    padding          : 0 vw(20);
                    background-color : #fff;
                    border-radius    : vw(5);
                    font-size        : vw(14);
                    box-shadow       : 0 vw(2) vw(4) rgba(0, 0, 0, .2);
                    &:last-child {
                        margin-right : 0;
                    }
                    .tip {
                        color : #ababab;
                        &.line {
                            border-bottom : vw(1) solid #555;
                        }
                    }
                }
            }
        }
    }

    .word-swiper-pagination {
        margin-bottom : vw(20);
    }

    .preview-mode {
        .word-container {
            .card-item-box {
                width  : vw(1080);
                height : vw(540);
            }
            .contenteditable-box {
                background-color : transparent;
                overflow         : auto;
                box-shadow       : none;
                .txtBox {
                    &:before {
                        display : none;
                    }
                }
                .inputBox {
                    min-width    : vw(168);
                    height       : vw(44);
                    line-height  : vw(44);
                    border-color : transparent;
                    color        : transparent;
                    cursor       : default;
                    &:before {
                        display : none;
                    }
                }
            }
        }
        .word-swiper-toggle {
            width       : vw(1080);
            margin-left : vw(-540);
        }
        .page-container {
            padding : 0;
        }
        .side-bar {
            -webkit-transform : translate3d(100%, 0, 0);
            transform         : translate3d(100%, 0, 0);
        }
        .page-footer {
            -webkit-transform : translate3d(0, 100%, 0);
            transform         : translate3d(0, 100%, 0);
        }
        .word-swiper-pagination {
            margin-bottom : vw(40);
        }
    }

    .card-btn-add {
        width               : vw(200);
        height              : vw(54);
        padding-left        : vw(5);
        margin              : vw(30) auto 0;
        background-position : vw(5) 0;
        line-height         : vw(45);
        font-size           : vw(14);
        color               : #fff;
        text-align          : center;
        &.hide {
            display : none;
        }
        &.animated {
            animation-duration : .3s;
        }
    }

    .word-swiper-toggle {
        width       : vw(1040);
        margin-left : vw(-520);
    }

    .card-btn-side-right-bottom {
        @include stretch(false, vw(55), vw(30), false);
        z-index    : 100;
        font-size  : vw(14);
        color      : #fff;
        text-align : center;
        &.animated {
            animation-duration : .3s;
        }
        .card-btn-bacpreview, .card-btn-insert {
            width       : vw(124);
            height      : vw(50);
            margin-left : vw(30);
            line-height : vw(44);
        }
        .card-btn-bacpreview {
            background-position : vw(-253) vw(-71);
        }
        .card-btn-insert {
            background-position : vw(-102) vw(-71);
        }
    }
</style>
