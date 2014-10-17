(function ($) {
  $.fn.simpleCarousal = function (options) {

    var doInitPlugin = function(__this){
      var $this = $(__this),
          _defaults = {
            autoPlay : true,
            animateDuration : 600,
            interval : 5000,
            itemsSelector : "ul>li",
            itemsContainerSelector : "ul",
            forwardSelector : "",
            backSelector : "",
            showKeys : false,
            dots : false
          },
          _settings = $.extend(_defaults, options || {}),
          _autoPlay = _settings.autoPlay,
          _interval = _settings.interval,
          _animateDuration = _settings.animateDuration,
          _itemsSelector = _settings.itemsSelector,
          _forwardSelector = _settings.forwardSelector,
          _backSelector = _settings.backSelector,
          _showKeys = _settings.showKeys,
          _itemsContainerSelector = _settings.itemsContainerSelector,
          _itemWidth = _settings.itemWidth,
          _isSupportCss3 = (function(){
             var $div = $("<div></div>"),
                  _div = $div[0];
                  _flag = ("transform" in _div.style);
              $div.remove();
              return _flag;
          })(),
          _isSupportCss3 = false,
          $itemsContainer = $this.find(_itemsContainerSelector),
          $items = $this.find(_itemsSelector),
          $forward = $(_forwardSelector),
          $back = $(_backSelector),
          _itemCount = $items.size(),
          _currentIndex = 0,
          _intervalCnt,
          _isAnimation = false,
          _isInterval = false,
          _isHandOperate = false; 

      if(_itemCount === 0){
        return;
      }    

      var _methods = {

        "doInit" : function(){

          var _this = this;

          _this.doInitItems();
          _this.doInitKeys();
          _this.doInitDots();
          _this.doInitCarousalSize();
          _this.setItemsPosition();
          _this.addEventListener();
          if(_autoPlay === true){
            _this.doInitInterval();  
          }

        },
        "doInitInterval" : function(){

          var _this = this;

          _isInterval = true;
          _this.actInterval();

        },
        "actInterval" : function(){

          var _this = this;

          var doAnimationTimeout = function(func, duration){
              _intervalCnt = setTimeout(function(){
                func();
                clearTimeout(_intervalCnt);
                doAnimationTimeout(func, duration);
            }, duration);
          }

          doAnimationTimeout(function(){
            _this.doAnimation();
          }, _interval)  

        },
        "clearInterval" : function(){
            clearTimeout(_intervalCnt);              
        },
        "doInitItems" : function(){

          var _this = this,
              $headClone = $($items[0]).clone(),
              $tailClone = $($items[$items.size() - 1]).clone();

          $headClone.insertAfter($items[$items.size() - 1]);
          $tailClone.insertBefore($items[0]);
          $items = $this.find(_itemsSelector);
          _itemCount = $items.size();
          _currentIndex = 1;

        },
        "doInitCarousalSize" : function(){

          _itemWidth =  _itemWidth || $this.width(),
          _totalWidth =  _itemWidth * _itemCount;
          
          $itemsContainer.css({
            "width" : _totalWidth + "px"
          });
          $this.css({
            "width" : _itemWidth + "px"
          });
          $items.css({
            "width" : _itemWidth + "px"
          });

        },
        "doInitDots" : function(){

          var _this = this,

          $ol = $("<ol class='dots'></ol>");
          for(var i = 1 ; i < _itemCount - 1 ; i++){
            var $li = $("<li data-index='" + i + "' ></li>");
            $ol.append($li);
          }
          $this.append($ol);

          _this.setDotActive(1);

        },
        "doInitKeys" : function(){

          if($back.size() === 0 && _showKeys === true){
            $back = $("<button class='back'>&lt;&lt;</button>");
            $this.append($back);
          }

          if($forward.size() === 0 && _showKeys === true){
            $forward = $("<button class='forward'>&gt;&gt;</button>");
            $this.append($forward);
          }

        },
        "setDotActive" : function(index){

          if(isNaN(index)){
            index = 1;
          }
    
          $this.find(".dots li").removeClass("active");
          $this.find(".dots li[data-index = " + index + "]").addClass("active");

        },
        "setTransition" : function(){

          $itemsContainer.css({
            "transition" : "all " + _animateDuration + "ms"
          });

        },
        "clearTransition" : function(){

          $itemsContainer.css({
            "transition" : "none"
          });

        },
        "addEventListener" : function(){

          var _this = this;

          $forward.click(function(){
            _isHandOperate = true;
            _this.doAnimation("forward");
          });
          $back.click(function(){
            _isHandOperate = true;
            _this.doAnimation("back");
          });

          $this.find("ol.dots>li").click(function(){
            var _index = $(this).data("index");
            _isHandOperate = true;
            _this.slideTo(_index);
          });

        },
        "setItemsPosition" : function(index){

          if(index === undefined){
            index = _currentIndex;
          }

          var _this = this, 
              _offsetX = - index * _itemWidth;

          if(_isSupportCss3){
            $itemsContainer.css({
              "transform" : "translate3d(" + _offsetX + "px,0,0)"
            });
          } else {
            $itemsContainer.css({
              "position" : "relative",
              "left" : _offsetX + "px"
            });
          }

        },
        "doAnimation" : function(orientation){

          if(_isAnimation === true){
            return;
          }

          var _this = this;

          if(orientation === "back"){
            _this.slideTo(_currentIndex - 1);  
          } else {
            _this.slideTo(_currentIndex + 1);  
          }

        },
        "slideTo" : function(index){

          if(index === _currentIndex){
            return;
          }

          var _this = this;

          if(_isHandOperate === true){
            _this.clearInterval();
          }

          var callBack = function(){
            if(_isSupportCss3 === true){
              _this.clearTransition();
            }
            _this.setItemsPosition(_currentIndex);
            _isAnimation = false;
            if(_isInterval === true && _isHandOperate === true){
              _this.actInterval();
              _isHandOperate = false;
            }
          };

          _isAnimation = true; 
          _currentIndex = index;

          if(index === 0){
            _currentIndex = _itemCount - 2;
          }
          if(index === _itemCount - 1){
            _currentIndex = 1;
          }

          _this.setDotActive(_currentIndex);

          if(_isSupportCss3){
            _this.setTransition();
            _this.setItemsPosition(index);
            _this.afterTransition(callBack);
          } else {
            $itemsContainer.animate({
              "left" : - index * _itemWidth
            }, callBack);
          }

        },
        "afterTransition" : function(func){
          $itemsContainer.off("transitionend");
          $itemsContainer.on("transitionend", func);
        }
      };

      _methods.doInit();
    
    }

    this.each(function(){
      doInitPlugin(this); 
    });

  }

})(jQuery);
