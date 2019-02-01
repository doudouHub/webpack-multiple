<template>
    <div class="side-bar noselect">
        <div class="side-title text-center">选择主题</div>
        <div class="theme-container">
            <div class="theme-list text-center">
                <dl class="theme-item" :class="selectThemeIndex===index?'active':''" v-for="(item,index) in themeList"
                    :key="item">
                    <dd class="img-container"
                        :style="`background-image:url('assets/img/theme/thumb_${index+1}.png')`"
                        @click="$emit('selectTheme',index)">
                    </dd>
                    <dt class="title">
                        {{item}}
                    </dt>
                </dl>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "sidebar",
        props: ['selectThemeIndex'],
        data () {
            return {
                themeList: ['基础模板', '山高望远', '妙趣横生', '中国风']
            }
        },
        methods: {}
    }
</script>

<style lang="scss" scoped>
    @import "../style_scss/config";

    .side-bar {
        @include stretch(0, 0, 0, false);
        z-index            : 3000;
        width              : vw(260);
        padding-bottom     : vw(60);
        background-color   : #f6f6f6;
        -webkit-transition : transform .2s linear;
        transition         : transform .2s linear;
        .side-title {
            background-color : #fff;
            font-size        : vw(14);
            color            : $mainColor;
            line-height      : vw(36);
            box-shadow       : 0 1px 0 rgba(0, 0, 0, .05);
        }
        .theme-container {
            @include stretch(vw(36), 0, vw(60), 0);
            z-index    : 100;
            padding    : 0 vw(10);
            overflow-y : auto;
        }
        .theme-list {
            margin : 0 auto;
        }
        .theme-item {
            margin : vw(20) auto vw(35);
            &:last-child {
                margin-bottom : 0;
            }
            &.active {
                .title {
                    color : $mainColor;
                }
            }
            .img-container {
                margin : 0 auto vw(10);
                cursor : pointer;
            }
            .title {
                font-size : vw(14);
            }
        }
    }
</style>
