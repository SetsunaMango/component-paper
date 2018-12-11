'use strict';
/**
 * @author {mango}
 * 通用表格：
 * 1. 实现传入获取数据，自动渲染分页
 * 2. 渲染分页器的分组数据时保证分组正确
 * 3. 当总页数小于分组时取消翻页箭头
 */

define(['zepto'], function ($) {
    class pager {
        /**
         * 构造器
         * @param {Object} options 扩展参数
         * @param {Object} containner 必选参数:容器
         * @param {Object} data 可选参数:数据(将表单数据传进来)数据格式：
         * data: {
                total: 10,
                data: [1,2,3,4,5,6,7,8,9,10,11]
            },
         * @param {Object} pager
         *  moreCount 可选:分页器每组最大值||3
         *  total 由数据决定: 总页数
         *  stepTo 可选: 当总页数超过此值则出现跳转器
         * 
         * @param {Object} scope 
         * (此参数优先级大于pager和query)
         * 赋值方法参考common-table
         */
        constructor(options) {
            this.const = {
                default: 2,
            }
            this.containner = typeof options.containner === 'string' ? $(options.containner) : options.containner;
            this.scope = Object.assign({
                data: options.data || null,
                pager: Object.assign({
                    moreCount: this.const.default,
                    total: 0,
                    stepTo: 10
                }, options.pager),
                query: Object.assign({
                    currentPage: 1, // 当前页
                }, options.query)
            }, options.scope);
            this.lastPage = options.lastPage || true; //设置是否有最后一页
            // 分页按钮样式
            this.page = {
                up: '<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-180 17 15)" fill="none" fill-rule="evenodd"><rect width="34" height="30" rx="4"/><path d="M14.15 10.8l4.61 4.17-4.59 4.23c-.1.09-.15.2-.15.33s.06.24.15.33c.2.19.53.19.73 0l4.93-4.54.02-.02c.1-.1.15-.2.15-.33a.45.45 0 0 0-.15-.34l-4.97-4.5a.55.55 0 0 0-.73 0c-.1.1-.15.21-.15.34 0 .13.05.24.15.33z" fill="#666" fill-rule="nonzero"/></g></svg>',
                down: '<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="34" height="30" rx="4"/><path d="M14.15 10.8l4.61 4.17-4.59 4.23c-.1.09-.15.2-.15.33s.06.24.15.33c.2.19.53.19.73 0l4.93-4.54.02-.02c.1-.1.15-.2.15-.33a.45.45 0 0 0-.15-.34l-4.97-4.5a.55.55 0 0 0-.73 0c-.1.1-.15.21-.15.34 0 .13.05.24.15.33z" fill="#666" fill-rule="nonzero"/></g></svg>',
                // left:'<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect width="34" height="30" rx="4"/><path d="M16.85 19.2l-4.61-4.17 4.59-4.23c.1-.09.15-.2.15-.33a.45.45 0 0 0-.15-.33.55.55 0 0 0-.73 0l-4.93 4.54-.02.02c-.1.1-.15.2-.15.33s.05.25.15.34l4.97 4.5c.2.18.53.18.73 0 .1-.1.15-.21.15-.34a.45.45 0 0 0-.15-.33zM22.85 19.2l-4.61-4.17 4.59-4.23c.1-.09.15-.2.15-.33a.45.45 0 0 0-.15-.33.55.55 0 0 0-.73 0l-4.93 4.54-.02.02c-.1.1-.15.2-.15.33s.05.25.15.34l4.97 4.5c.2.18.53.18.73 0 .1-.1.15-.21.15-.34a.45.45 0 0 0-.15-.33z" fill="#327BC8" fill-rule="nonzero"/></g></svg>',
                // right:'<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(-1 0 0 1 34 0)" fill="none" fill-rule="evenodd"><rect width="34" height="30" rx="4"/><path d="M16.85 19.2l-4.61-4.17 4.59-4.23c.1-.09.15-.2.15-.33a.45.45 0 0 0-.15-.33.55.55 0 0 0-.73 0l-4.93 4.54-.02.02c-.1.1-.15.2-.15.33s.05.25.15.34l4.97 4.5c.2.18.53.18.73 0 .1-.1.15-.21.15-.34a.45.45 0 0 0-.15-.33zM22.85 19.2l-4.61-4.17 4.59-4.23c.1-.09.15-.2.15-.33a.45.45 0 0 0-.15-.33.55.55 0 0 0-.73 0l-4.93 4.54-.02.02c-.1.1-.15.2-.15.33s.05.25.15.34l4.97 4.5c.2.18.53.18.73 0 .1-.1.15-.21.15-.34a.45.45 0 0 0-.15-.33z" fill="#327BC8" fill-rule="nonzero"/></g></svg>'
                pageup: '<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-180 17 15)" fill="none" fill-rule="evenodd"><rect fill="#327BC8" width="34" height="30" rx="4"/><path d="M14.15 10.8l4.61 4.17-4.59 4.23c-.1.09-.15.2-.15.33s.06.24.15.33c.2.19.53.19.73 0l4.93-4.54.02-.02c.1-.1.15-.2.15-.33a.45.45 0 0 0-.15-.34l-4.97-4.5a.55.55 0 0 0-.73 0c-.1.1-.15.21-.15.34 0 .13.05.24.15.33z" fill="#FFF" fill-rule="nonzero"/></g></svg>',
                pagedown: `<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><rect fill="#327BC8" width="34" height="30" rx="4"/><path d="M14.15 10.8l4.61 4.17-4.59 4.23c-.1.09-.15.2-.15.33s.06.24.15.33c.2.19.53.19.73 0l4.93-4.54.02-.02c.1-.1.15-.2.15-.33a.45.45 0 0 0-.15-.34l-4.97-4.5a.55.55 0 0 0-.73 0c-.1.1-.15.21-.15.34 0 .13.05.24.15.33z" fill="#FFF" fill-rule="nonzero"/></g></svg>`
            }
            if (!this.test()) {
                this._init();
            }
        }

        /**
         * 验证参数
         */
        test() {
            if (!this.containner) {
                console.log('没有容器');
                return false;
            }
            if (this.scope.pager.total <= 0) {
                console.log('error：no data or error total by calculator of common-table');
                return true;
            }
            if (this.scope.moreCount < this.const.default) {
                console.log('moreCount最少为2页');
                this.scope.moreCount = this.const.default;
                return false;
            }
        }

        /**
         * 初始化
         */
        _init() {
            this.render();
            this.fixed();
        }

        /**
         * 渲染分页器
         */
        render() {
            // 加载分页器
            this.loadPager();
            // 渲染分组
            this.renderPager();
            // 注册分页事件
            this.initPagerEvent();
        }

        /**
         * 载入分页器
         */
        loadPager() {
            let {
                total,
                stepTo
            } = this.scope.pager;
            let pagerDom = [`<ul class="pager-con">`]; //分页
            pagerDom.push(` </ul>`); //收尾
            if (total > stepTo) {
                pagerDom.push(`<span class="page">到第<input type="text" value="" /><input class="hiddenText" type="text" style="display:none" />页</span>`)
            }
            this.containner.html(pagerDom.join('')); // 因为此时pagerDom是一个字符串数组,故用join方法把数组合并为字符串
        }

        /**
         * 渲染分组数据
         * @param {pageNo} 传入当前分组的首项！
         */
        renderPager() {
            let {
                moreCount, // 获取每组页数
                total // 获取总页数
            } = this.scope.pager;
            let pagerDom = [];
            let currentPage = this.scope.query.currentPage; // 获取当前页
            let pagerUlEl = this.containner.find(".pager-con"); // 获取ul对象
            let pageNo = ((Math.ceil(currentPage / moreCount)) - 1) * moreCount + 1 // 获取当前页分组位置
            if (total > moreCount) {
                pagerDom.push(`<li class="pager-h l ${pageNo <= 1 ? "disable" : ""}">${this.page.up}</li>`);
                if (pageNo > total / 2) {
                    if (this.lastPage) {
                        pagerDom.push(`<li class="page-no last">1</li>`);
                    }
                    pagerDom.push(`<li class="pager-h more l">...</li>`);
                }
            }
            let holdpageNo = pageNo;
            for (let i = 0; i < moreCount && i < total && pageNo <= total; i++) {
                pagerDom.push(`<li class="${currentPage === pageNo ? "page-no current" : "page-no"}">${pageNo}</li>`);
                pageNo += 1;
            }
            if (total > moreCount) {
                if (holdpageNo <= (total + moreCount - total % moreCount) / 2) {
                    pagerDom.push(`<li class="pager-h more r">...</li>`);
                    if (this.lastPage) {
                        pagerDom.push(`<li class="page-no last">${total}</li>`);
                    }
                }
                pagerDom.push(`<li class="pager-h r ${(currentPage === total || pageNo >= total) ? "disable" : ""}">${this.page.down}</li>`);
            }
            pagerUlEl.html(pagerDom.join(''));
            this.fixed();
        }

        /**
         * 初始化分页器事件
         */
        initPagerEvent() {
            // 点击页数
            let $obj = $(this.containner);
            let that = this;
            $obj.off('click', '.page-no').on('click', '.page-no', function () {
                if ($(this).hasClass('more')) {
                    return false;
                }
                $obj.find(".page-no").removeClass('current');
                $(this).addClass('current'); // 激活此页
                that.scope.query.currentPage = parseInt($(this).html());
                that.renderPager() // 重新渲染分页器
            });

            // 委托翻页事件
            $obj.find('.pager-h').off().on('click', function () {
                if ($(this).hasClass('more')) {
                    // 委托翻组事件 todo 小bug
                    let moreCount = that.scope.pager.moreCount;
                    let pagerUlEl = $obj.find(".pager-con"); // 获取ul节点
                    let start = parseInt(pagerUlEl.find('li.page-no').not('.last').eq(0)
                        .html()); // 获取分页器当前组
                    if ($(this).hasClass('l')) {
                        start = start - moreCount;
                        start < 1? start = 1 : start;
                    } else if ($(this).hasClass('r')) {
                        start = start + moreCount;
                        start > that.scope.pager.total ? start = 1 : start;
                    }
                    // console.log(start)
                    that.scope.query.currentPage = start;
                    that.renderPager() // 重新渲染分页器
                    return ;
                }
                let intValue = that.scope.query.currentPage;
                if ($(this).hasClass('l') && intValue > 1) {
                    intValue = intValue - 1;
                } else if ($(this).hasClass('r') && intValue < that.scope.pager.total) {
                    intValue = intValue + 1;
                }
                that.scope.query.currentPage = intValue;
                that.renderPager() // 重新渲染分页器
            });

            // 回车跳转事件
            $obj.unbind('keyup').keyup(() => {
                if (window.event.keyCode === 13) {
                    let Input = $obj.find('.page').find('input');
                    let intValue = parseInt(Input.val());
                    if (intValue > that.scope.pager.total) {
                        intValue = that.scope.pager.total
                    } else if (intValue < 1) {
                        return;
                    }
                    that.scope.query.currentPage = intValue;
                    that.renderPager(); // 渲染分组
                    Input.val('');
                    Input.blur();
                }
            })

            // 焦点事件
            $obj.on('mouseover', '.more', function () {
                if ($(this).hasClass('l')) {
                    // $(this).html(that.page.left);
                    $(this).html('');
                    $(this).css('background', "url('//img.cnhash.com/ea013942-22f0-4968-9898-ebf92ebcd031.png') no-repeat center ");
                } else if ($(this).hasClass('r') || $(this).hasClass('more')) {
                    $(this).html(''); //that.page.right
                    $(this).css('background', "url('//img.cnhash.com/ccddcb4e-442a-4603-8423-0be94d734f9e.png') no-repeat center ");
                }
            });
            $obj.on('mouseout', '.more', function () {
                // $(this).html('<div>...</div>');
                $(this).css('background', '');
                $(this).html('<div>...</div>');
            });

            $obj.on('mouseover', '.pager-h', function () {
                if ($(this).hasClass('more')) {
                    return false;
                }
                if ($(this).hasClass('l')) {
                    $(this).html('');
                    $(this).css('background', "url('//img.cnhash.com/be1579a4-9dd8-4275-867a-8474e5ac41e7.png') no-repeat center");
                } else if ($(this).hasClass('r')) {
                    $(this).html('');
                    $(this).css('background', "url('//img.cnhash.com/3672fa12-7958-497c-8bcf-13d082333d5f.png') no-repeat center");
                }
            });
            $obj.on('mouseout', '.pager-h', function () {
                if ($(this).hasClass('more')) {
                    return false;
                }
                if ($(this).hasClass('l')) {
                    $(this).html(that.page.up);
                    $(this).css('background', '')
                } else if ($(this).hasClass('r')) {
                    $(this).html(that.page.down);
                    $(this).css('background', '')
                }
            });

            $obj.find('input').focus(function () {
                $(this).css('box-shadow', '0px 0px 10px rgba(60,148,241,0.5)');
                $(this).css('border', '1px solid #327BC8');
            });
            $obj.find('input').blur(function () {
                $(this).css('box-shadow', '');
                $(this).css('border', '1px solid #DDDDDD');
            });
        }

        /**
         * 修正全局样式!!!!
         * 由于全局样式中li的默认宽度是34px
         * 故此当分页器每组最多页数发生变化时,改变ul宽度
         * 以及保证分页器居中
         */
        fixed() {
            //焦点修正
            if (!(this.containner.find('li').hasClass('current'))) {
                this.containner.find('li').eq(1).addClass('current');
            }
            //宽度修正
            let fixwidth = this.containner.find('li').length * 34;
            if (this.scope.pager.total > this.scope.pager.stepTo) {
                fixwidth += 142; // 修复有跳转框时的宽度
            }
            this.containner.width(fixwidth);
            //居中修正
            if (this.containner.parent().height() <= this.containner.height()) {
                return;
            }
            let fixCenter = (this.containner.parent().height() - 30) / 2;
            this.containner.css('padding-top', fixCenter + 'px');
        }

        /**
         * 暴露页数接口
         * @return 将所跳转的页数暴露出去,请用鼠标事件以及键盘事件监听此接口
         */
        export () {
            return this.scope.query.currentPage;
        }
    }
    return pager;
});
