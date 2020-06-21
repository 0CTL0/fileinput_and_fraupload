//bug:多个实例，show方法失的self被复；图片排序没有对内存文件起作用，即没有改变files_all
//没有实现的功能：清空files_all


//jquery插件一般有三种开发方式
  //通过$.extend()来扩展jQuery  
  //通过$.fn 向jQuery添加新的方法
  //通过$.widget()应用jQuery UI的部件工厂方式创建
  //第一种$.extend()相对简单，一般很少能够独立开发复杂插件，第三种是一种高级的开发模式不做介。二种则是一般插件开发用的方式。


/*FraUpload 文件上传插件模型*/

// 立即执行函数：(function(){})()。这是一个自调函数，函数定义好之后自。
//（function(){}）表示一个匿名函数，而后面紧跟着的（）表示立即调用此函数。而且（）也是向函数传递参数的地
//使用此函数的好处是，不会产生任何全局变量。缺点是无法重复执行。对于插件来说，是最合适不过的了。不会产生任何全局变量，同时一次引用就够了。
(function($,undefined){  //形成闭包，将作用域进行限定。(插件的固定格式)
    
    $.fn.FraUpload = function(options,param)
         // 所以这里做的事情就是把参数列表的第1个以后的参数全部作为一个数组获取出
        var otherArgs = Array.prototype.slice.call(arguments, 1);   //将函数传入的参数转换为数组对象。// arguments 是所有传入的参数的列表，是类数组，但不是数组
        if (typeof options == 'string') {    //判断 options 是字符串
            var fn = this[0][options];       //这里的this是jQuery的一个实例，它是一个类数组的对象，this[0] 就是jquery匹配到的第一个DOM元素，fn = this[0][options] 这里应该是获满足条件的第一个DOM元素上的一个方法的引用，
            if($.isFunction(fn)){            //判断 fn 是函数
                return fn.apply(this, otherArgs); // 以otherArgs为参数列表，并且以当前jQuery实例作为this调用fn
            }else{
                throw ("FraUpload - No such method: " + options);
            }
        }
        if(! (typeof browserMD5File != 'undefined' && browserMD5File instanceof Function) ){
            console.error("请引用md5lib库");
            return false;
        }

   
          // return this.each(function() {
            //     $(this).append(' - ' + $(this).data('x'));
            // });
  // 等价于
            // var objs = this;
            // for (var i=0; i<objs.length; i++) {
            //     var obj = objs[i];
            //     $(obj).append(' - ' + $(obj).data('x'));
            // };
            // return this; 
        return this.each(function(){        //遍历匹配的元素，此处的this表示为jquery对象，而不是dom对象。jquery对象是类数组对象！！！
                                  
        var para = {};    // 保留参数
        var self = this;  // 保存组件对象
        var input = null; // input/
        var view_DOM = null; //视图ul DOM对象
        var view_id = null; //视图ul DOM对象
        var self_sortable = null; //视图 插件对象
        // 初始化参数
        var defaults = {
            view        : "", //视图渲染对象
            url         : "",   //上传url
           fetch       : 'img', //视图分为三种,img:图片视图 , file:文件视图 ,none或者其他未知: 不渲染上传视图
            debug       : false,
            /* 提供给外部的接口方法 */
            onLoad          : function(e){},// 初始化完成后调用
            breforePort     : function (e) {}, //发送前调用,return false则不发送数据; return form对象则发送修改后的form对象
            successPort     : function (e) {},  //
            errorPort       : function (e) {},
            deletePost      : function(e){},
            deletePost      : function(e){},
            sort            : function(e){},
            error           : function (e){alert(e)},
        };
       

           
  //$.extend( [deep ], target, object1 [, objectN ] )  合并默认值和选项，不修改默认对象。这是常用的插件开发模式。通过这种方式，我们可以为全局对象jQuery添加新的函数指定了一个参数，则意味着参数target被省略。此时，target就是jQuery对象本身。deep 是否深度合并对象，默认为false。
        var para = $.extend(defaults,options);
        self.para = $.extend(defaults,options);
   //区别：把jQuery看成了一个类，。jQuery.extend()，是扩展的jQuery这个类。jQuery.fn.extend() 这个拓展的是jQuery.fn的方法。
       //    两者调用方式不同：
       //        jQuery.extend(),为扩展jquery类本身.为类添加新的方法，一般由传入的全局函数来调用，如$.init()，$.ajax();
       //        jQuery.fn.extend(),一般由具体的实例对象来调用，可以用来拓展个选择器，例如$.fn.each();
       //    4.2、两者的主要功能作用不同：
       //        jQuery.extend(object); 为扩展jQuery类本身，为自身添加新的方法。
       //        jQuery.fn.extend(object);给jQuery对象添加方法
       //    4.3、大部分插件都是用jQuery.fn.extend()
            


        //图片队列
        this.files_all = {}; 
        
        //初始化对象
        this.init = function(){
            this.createHtml();  // 创建组件html
            para.onLoad(this); //初始化完成会掉
        };
        
        /**
         * 功能：初始化html
         * 参数: 无
         * 返回: 无
         */
        this.createHtml = function(){
            //添加按钮
            var num = Math.ceil(Math.random()*10000000);
            var input_id = "input_"+num;
            view_id = "view_"+num;
            $(self).after('<input type="file" id="'+input_id+'" style="display:none" />');
            input = $("#"+input_id);
            // 初始化上传列表
            if(para.fetch=="img" || para.fetch == "file"){
                $(para.view).addClass("file-preview")
                $(para.view).append('<ul id="'+view_id+'" class="FraUpload_imglist" /></ul>');
                view_DOM = $("#"+view_id);
            }else{
                //不渲染
            }
            // 初始化html之后绑定按钮的点击事件
            this.addEvent();
        };
        
        /**
         * 功能：判断是否定义
         * 参数: 无
         * 返回: boolen
         */
        this.empty = function(e){
            if(e==undefined || e==null || e==false || e==0 || e=='' || e==[] || e=={} ){
                return true
            }else{
                return false
            }
        }

        /**
         *  生成文件大小
         * @param $byte int 文件大小单位byte
         * @return string 文件大小字符串
         */
        this.getsize = function($byte){
            $KB = 1024;
            $MB = 1024 * $KB;
            $GB = 1024 * $MB;
            $TB = 1024 * $GB;
            if(self.empty($byte)){
                return "未知";
            }
            $byteold = $byte;
            $byte = parseInt($byte);
            if ($byte < $KB) {
                return $byte + "B";
            } else if ($byte < $MB) {
                return ($byte / $KB).toFixed(2) + "KB";
            } else if ($byte < $GB) {
                return ($byte / $MB).toFixed(2) + "MB";
            } else if ($byte < $TB) {
                return ($byte / $GB).toFixed(2) + "GB";
            } else {
                return ($byte / $TB).toFixed(2) + "TB";
            }
        }
        
        /**
         *  获取对象长度
         * @param obj obj 文件队列
         * @return int
         */
        this.objLength = function (obj){
            var count = 0;
            for(var i in obj){
                count ++;
            }
            return count;
        }

        /**
         *  判断文件是否在队列中
         * @param md5 string 刚传入的文件md5
         * @return boolean
         */
        this.file_isIn = function (md5){
            var files  = self.files_all;
            for(let key in files){
                if(files[key]['md5']==md5){
                    return true;
                }
            }
            return false;
        }

        this.deletefile= function (e){

        }
        /**
         * 功能：绑定事件
         * 参数: 无
         * 返回: 无
         */
        this.addEvent = function(){
            // 点击按钮则触发该时间
            $(self).bind("click", function(e){
                self.msg("this click...")
                input.attr("multiple","multiple");//多选
                input.click()    
            });

            // input选择完文件则触发该事件
            input.change(function () {
                // 如果value不为空，调用文件加载方
                if($(this).val() != ""){
                    // 获取文件列表
                    var files = $(this).prop('files');
                    // return false;
                    for(let key in files){
                        if(typeof files[key] == 'object'){
                            // 获取md5
                            browserMD5File(files[key], function (err, md5) {
                                // 判断是否存在相同文件
                                if(self.file_isIn(md5)){
                                    para.error("文件已选择");
                                    return false;
                                }
                                //将文件加入对象
                                var objKey = self.objLength(self.files_all);
                                self.files_all[objKey] = {
                                    filename: files[key].name,
                                    size: files[key].size,
                                    type: files[key].type,
                                    obj: files[key],
                                    md5: md5,
                                    is_upload: '',
                                    ajax:{},
                                }
                                //渲染视图队列
                                if(String(files[key].type).search("image")==0){
                                    var reader = new FileReader();
                                    reader.readAsDataURL(files[key]);
                                    reader.onload=function(e){
                                        var html =  '<li data-md5="'+md5+'">'+
                                                        '<img src=""/>'+
                                                        "<div class='file-tit'>"+
                                                            "<div title='"+files[key].name+"'>"+files[key].name+"</div>"+
                                                            "<div>"+self.getsize(files[key].size)+"</div>"+
                                                        "</div>"+
                                                        '<div class="file-footer-buttons">'+
                                                            '<span class="icon-loading" title="正在上传..."></span>'+
                                                            '<span class="iconfont icon-delete" title="删除文件"></span>'+
                                                            '<span class="iconfont icon-icon-test" title="查看详情"></span>'+
                                                        '</div>'+
                                                    '</li>';
                                    $(view_DOM).append(html);
                                    $(view_DOM).find("li[data-md5='"+md5+"'] img:eq(0)").attr('src',this.result)
                                    }
                                }else{
                                    para.error("请选择图片");
                                    return false;
                                }
                                self.upLoad(self.files_all[objKey]);
                            });
                        }   
                    }
                }
            })
            //删除事件
            $('.file-preview').on('click','.icon-delete',function(){
                var id = $(this).parent().parent('li');
                var this_file = {};
                var this_id = '';
                var md5 = id.data('md5');
                all = self.files_all;
                for(let key in all){
                    if(all[key]['md5']==md5){
                        this_file = all[key];
                        this_id = key;
                        break;
                    }
                }
                delete self.files_all[this_id]; 
                id.remove();
                para.deletePost(this_file);

            })

            if(para.fetch=="img"){
                self.imgfetch();
                var foo = document.getElementById(view_id);
                Sortable.create(foo, { group: "name" 
                , onAdd: function (evt){ //拖拽时候添加有新的节点的时候发生该事件
                   // console.log('onAdd.foo:', [evt.item, evt.from]); 
                },
                  onUpdate: function (evt){ //拖拽更新节点位置发生该事件
                   // console.log('onUpdate.foo:', [evt.item, evt.from]); 
                },
                  onRemove: function (evt){ //删除拖拽节点的时候促发该事件
                   // console.log('onRemove.foo:', [evt.item, evt.from]); 
                },
                  onStart:function(evt){ //开始拖拽出发该函数
                   // console.log('onStart.foo:', [evt.item, evt.from]);
                },
                  onSort:function(evt){ //发生排序发生该事件
                   // console.log('onSort.foo:', [evt.item, evt.from]);
                },
                  onEnd: function(evt){ //拖拽完毕之后发生该事件
                    // 生成排序
                    var bind_arr = [];
                    for(var i=0, len=evt.from.children.length; i<len; i++){
                        bind_arr.push($(evt.from.children[i]).data('md5'));
                    }
                    // 生成排序后的数据
                    var res = {};
                    var back = self.files_all;
                    for(let key in bind_arr){
                        for(let k2 in back){
                            if(bind_arr[key]==back[k2]['md5']){
                                res[key] = back[k2];
                                continue;
                            }
                        }
                    }
                    // 保存
                    self.files_all = res;
                    para.sort();
                }
            });
            }else if(para.fetch == "file"){
                self.filefetch()
            }else{
                //不渲染
            }
            // 如果是图片?
        };

        /**
         * 功能：类库消息机制
         * 参数: 无
         * 返回: 无
         */
        this.msg = function (e) {
            if(para.debug==true){
                console.log(e);
            }
        }

        /**
         * 功能：上传文件
         * 参数: 无
         * 返回: 无
         */
        this.upLoad = function (file_type) {
            // 创建一个formData对象
            // 确认选择的文件是图片      
            var data = new FormData();
            var file_one = file_type['obj'];
            data.append('file', file_one);

            // 发送之前 回调 自定义 form数据
            self.msg("breforePort...");
            var backData = data;
            var data = para.breforePort(data);
            if(data==false){
                return false;
                self.msg("cancelPort...")
            }else if(data==undefined){
                data = backData;
            }

            // 提交数据
            $.ajax({
                url: para.url,
                type: 'POST',
                data: data,
                processData: false,//  告诉jQuery不要去处理发送的数据
                contentType: false, //  告诉jQuery不要去设置Content-Type请求头
                // beforeSend: function () {
                // },
                success: function (responseStr) {

                    // 11成功后的动作
                    self.msg("successPort...");
                    self.msg(responseStr);

                    // 成功后修改属性和状态

                    delete file_type['ajax'];
                    file_type['ajax'] = responseStr;
                    delete file_type['is_upload'];
                    file_type['is_upload'] = '1';
                    // console.log(file_type);
                    
                    //如果结果返回给了前台,但是还是找不到DOM对象说明:返回回来,DOM还没有添加进去,这里做个sleep等待 1ms ,3ms ,5ms(用于应对特殊情况)
                    self.setView(file_type,1,'icon-success','上传完成');
                    para.successPort(responseStr);

                },
                error : function (responseStr) {
                    //12出错后的动作
                    self.msg("errorPort...");
                    self.msg(responseStr);
                    self.setView(file_type,1,'icon-error','上传失败');
                    para.errorPort(responseStr);
                }
            });
        }
        this.setView = function (file_type,times,icon,title){
            if(times>=5){
                return false;
            }
            key = null;
            //获取是第几个
            for(let i in self.files_all){
                if(self.files_all[i]['md5'] == file_type['md5']){
                    key = i;
                    break;
                }
            }
            if(key!==null){
                delete self.files_all[key];
                self.files_all[key] = file_type;
                // 渲染到视图:
                var md5 = file_type['md5'];
                htm = $(view_DOM).find("li[data-md5='"+md5+"']").find('.file-tit>div:eq(1)').html();
                if(htm==undefined){
                    setTimeout(function(){
                        console.log('sleep'+times*1000)
                        self.setView(file_type,times+2,icon,title);
                    },times*1000);
                }else{
                    var li_dom = $(view_DOM).find("li[data-md5='"+md5+"']").find('.icon-loading');
                    li_dom.addClass(icon).attr("title",title).removeClass('icon-loading');
                    // 渲染视图
                    self.fetch();
                }
            }
        }

        /**
         * 功能：视图渲染功能分流器
         * 参数: 无
         * 返回: 无
         */
        this.fetch = function () {
            if(para.fetch=="img"){
                self.imgfetch();
            }else if(para.fetch == "file"){
                self.filefetch()
            }else{
                //不渲染
            }
        }

        /**
         * 功能：图片渲染功能
         * 参数: 无
         * 返回: 无
         */
        this.imgfetch = function () {

         }

        /**
         * 功能：文件渲染功能
         * 参数: 无
         * 返回: 无
         */
        this.filefetch = function () {

         }

        //对外开放接口

        /**
         * 功能：返回文件队列
         * 参数: 无
         * 返回: 无
         */
        $.fn.FraUpload.show = function (){   //暴露公共方法供外部调用

            var this_val =self.files_all
            var all = {};
            for(let k in this_val){
                all_val = {
                    ajax:this_val[k]['ajax'],
                    filename:this_val[k]['filename'],
                    is_upload:this_val[k]['is_upload'],
                    md5:this_val[k]['md5'],
                    obj:this_val[k]['obj'],
                    size:this_val[k]['size'],
                    type:this_val[k]['type'],
                }
                all[k] = all_val;
            }
            return all;
        }

        /**
         * 功能：返回类库对象
         * 参数: 无
         * 返回: 无
         */
        $.fn.FraUpload.self = function (){
            return self;
        }

        /**
         * 功能：初始化上传控制层插件
         * 参数: 无
         * 返回: 无
         */
         this.init();
     });
};
})(jQuery);



/*
Jquery的工作原理与插件：https://blog.csdn.net/qq_37939251/article/details/86743400

（1）使用jquery方法
                 $( "a" ).css( "color", "red" );
这是一些非常基本的jQuery代码，但你知道幕后发生了什么吗？每当您使用该$函数选择元素时，它都会返回一个jQuery对象。这个对象包含了所有的你已经使用（方法.css()，.click()等）和所有适合你的选择要素。jQuery对象从对象中获取这些方法$.fn（什么意思，从原型对象中获取这些方法？）。该对象包含所有jQuery对象方法，如果我们想编写自己的方法，则还需要包含这些方法。

（2）添加一个Jquery方法
            $.fn.greenify = function() {
                this.css( "color", "green" );
              };
           $( "a" ).greenify(); // Makes all the links green.


*/
