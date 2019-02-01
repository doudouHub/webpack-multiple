<template>
    <div class="page-footer clearfix noselect">
        <div class="pull-right">
            <!-- 底部内容  -->
            <el-button size="small" @click="shutWindow">关闭</el-button>
            <el-button size="small" @click="$emit('goPreview',true)">预览</el-button>
            <el-button size="small"
                       type="danger"
                       @click="insertToPPT">
                {{isClientMode?'保存至云端':(editAgain?'保存到PPT':'插入PPT')}}
            </el-button>
            <el-checkbox class="savecloud-check pull-right" v-model="saveToCloud" v-if="!isClientMode">保存至云端
            </el-checkbox>
        </div>
    </div>
</template>

<script>
    import {cefMsg} from 'src/callCplus'

    export default {
        name: "page-footer",
        props: ['questionInfo', 'savedData', 'isCanPreview', 'isClientMode', 'editAgain'],
        data () {
            return {
                saveToCloud: true,
                h5data: null
            }
        },
        methods: {
            // 生成随机id
            createUuid: function () {
                let s = [];
                let hexDigits = "0123456789abcdef";
                for (let i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = "4";
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
                s[8] = s[13] = s[18] = s[23] = "-";
                return s.join("");
            },
            // 插入ppt
            insertToPPT () {
                // 向C++发行题目信息
                this.$emit('goScreenshotMode');
                this.$nextTick(() => {
                    if (!this.isCanPreview) return;
                    let _savedData = {
                        worktype: 'all',
                        questype: 'h5',
                        sortid: 'ra.savework',
                        workid: this.createUuid(),
                        workname: 'banked_cloze',
                        type: 'cls',
                        answertime: 0,
                        createdtime: new Date() * 1,
                        questions: [],
                        pic_url: "",
                        ans: 0,
                        h5_url: window.location.href,
                        h5data: this.simpleData(),
                        saveToCloud: String(this.saveToCloud)
                    };

                    setTimeout(function () {
                        // 发送消息，保存截图数据
                        cefMsg('micro.cotroler', 'sendimgurl', JSON.stringify({
                            width: document.body.clientWidth,
                            height: document.body.clientHeight
                        }));

                        let _data = JSON.stringify(_savedData);
                        try {
                            _data = _data.replace(/'/g, '&apos;').replace(/\\"/g, '&quot;');
                        } catch (err) {
                        }
                        // 向C++发行题目信息
                        cefMsg('micro.cotroler', 'setdata', _data.replace(/\"/g, "\\\"").replace(/\'/g, "\\'"));
                    }, 1000)
                })
            },
            // 关闭窗口
            shutWindow () {
                if (!this.isSavedData()) {
                    let _savedData = {
                        worktype: 'all',
                        questype: 'h5',
                        sortid: 'ra.savework',
                        workid: this.createUuid(),
                        workname: 'banked_cloze',
                        type: 'cls',
                        answertime: 0,
                        createdtime: new Date() * 1,
                        questions: [],
                        pic_url: "",
                        ans: 0,
                        h5_url: window.location.href,
                        h5data: this.h5data,
                        saveToCloud: this.saveToCloud
                    };
                    _savedData = JSON.stringify(_savedData);
                    try {
                        _savedData = _savedData.replace(/'/g, '&apos;').replace(/\\"/g, '&quot;');
                    } catch (err) {
                    }
                    // 向C++发行题目信息
                    cefMsg('micro.cotroler', 'closewindow', _savedData.replace(/\\"/g, "\\\"").replace(/\\'/g, "\\'"));
                } else {
                    cefMsg('micro.cotroler', 'closewindow', '');
                }
            },
            // 精简数据，去除多余状态
            simpleData () {
                let _questionInfo = this.$deepClone(this.questionInfo);
                _questionInfo.title = encodeURIComponent(_questionInfo.title);
                _questionInfo.questionList.forEach((item) => {
                    delete item.answerTagGather;
                    delete item.finishResult;
                    if (item.finish) {
                        delete item.finish;
                    }
                    item.contentList.forEach((pItem) => {
                        pItem.forEach((subItem) => {
                            subItem.value = encodeURIComponent(subItem.value);
                            if (subItem.class !== 'txtBox') {
                                delete subItem.answer;
                                delete subItem.answerIndex;
                                delete subItem.finish;
                                delete subItem.result;
                                delete subItem.statu;
                            }
                        })
                    })
                    item.disturbanceTags.forEach((pItem) => {
                        pItem.content = encodeURIComponent(pItem.content);
                    })
                });
                this.h5data = _questionInfo;
                return _questionInfo;
            },
            // 检查是否未编辑
            isSavedData () {
                // 数据检查
                return JSON.stringify(this.simpleData()) === JSON.stringify(this.savedData);
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../style_scss/config";

    .page-footer {
        @include stretch(false, 0, 0, 0);
        z-index            : 4000;
        height             : vw(60);
        padding            : 0 vw(30);
        background-color   : #fff;
        line-height        : vw(60);
        box-shadow         : 0 -1px 1px rgba(0, 0, 0, .1);
        -webkit-transition : transform .2s linear;
        transition         : transform .2s linear;
        .el-button {
            width   : vw(100);
            height  : vw(32);
            padding : 0 vw(15);
            border     : {
                radius : vw(5);
                width  : vw(1);
            }
            &.el-button--default {
                background-color : #f8f8f8;
            }
            &.el-button--danger {
                background-color : #0199ff;
                border-color     : #0199ff;
            }
            span {
                font-size   : vw(12);
                line-height : vw(30);
            }
        }
        .savecloud-check {
            margin-left : vw(20);
            color       : #666;
            .el-checkbox__label {
                position  : relative;
                top       : vw(2);
                font-size : vw(18);
            }
            .el-checkbox__inner {
                width  : vw(24);
                height : vw(24);
                &:after {
                    top    : vw(2);
                    left   : vw(7);
                    width  : vw(7);
                    height : vw(12);
                }
            }
        }
    }
</style>
