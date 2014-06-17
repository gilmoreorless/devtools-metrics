(function (root) {

    var cheat = root.cheat = {};

    // DOM NODES

    var ref = document.querySelector('#ref');
    var transRoot = document.querySelector('#transform2d');
    var transBase = document.querySelector('.trans-base');
    var transDisplay = document.querySelector('.trans-elem');
    var transOrigin = transBase.querySelector('.origin');
    var propTrans  = document.querySelector('#t2d-prop-transform .value');
    var propOrigin = document.querySelector('#t2d-prop-transform-origin .value');
    var btnsContainer = document.querySelector('.trans-actions');
    var btn = {};
    ['rotate', 'scale', 'skew', 'translate'].forEach(function (trans) {
        btn[trans] = btnsContainer.querySelector('[data-action=' + trans + ']');
    });


    // STATE

    var curTrans = 'none';
    var curTransObj = new TransformBuilder();
    var curOrigin = '50% 50%';
    var curMode = '';
    var curPartIdx;
    var dragStart = null;
    var units = 'deg';
    // Mousemove normalisers
    var pxPerSkew = 2;
    var pxPerScale = 50;


    // PRIVATE METHODS

    function setup() {
        btnsContainer.addEventListener('click', function (e) {
            var action = e.target.getAttribute('data-action');
            if (action) {
                var mode = action === curMode ? '' : action;
                cheat.setMode(mode);
            }
        }, false);
        transRoot.addEventListener('mousedown', actionMousedown, false);
    }

    function eachAction(callback) {
        ['rotate', 'scale', 'skew', 'translate'].forEach(function (action) {
            callback.call(this, action, btn[action]);
        });
    }

    function actionMousedown(e) {
        if (e.target.classList.contains('trans-action')) {
            return;
        }
        dragStart = {
            x: e.pageX,
            y: e.pageY,
            values: [],
            isNewPart: false
        };
        var lastPart = curTransObj.getLastPart();
        if (!lastPart || lastPart.type !== curMode) {
            lastPart = curTransObj.addPart(curMode);
            dragStart.isNewPart = true;
        }
        curPartIdx = curTransObj.parts.length - 1;
        dragStart.values = [].concat(lastPart.values); // Make sure it's a clone and not a reference

        document.addEventListener('mousemove', actionMousemove, false);
        document.addEventListener('mouseup', actionMouseup, false);
        transRoot.classList.add('dragging');
    }

    function actionMousemove(e) {
        if (!dragStart) {
            return;
        }
        if (dragHandlers[curMode]) {
            var x = e.pageX;
            var y = e.pageY;
            var dx = x - dragStart.x;
            var dy = y - dragStart.y;
            // var transform = dragHandlers[curMode].call(this, e, dx, dy);
            // cheat.setTransform(transform);
            curTransObj.setPart(curPartIdx, dragHandlers[curMode].call(this, e, dx, dy));
            cheat.refresh();
        }
    }

    function actionMouseup(e) {
        if (dragStart.isNewPart && dragStart.x === e.pageX && dragStart.y === e.pageY) {
            curTransObj.popPart();
        }
        dragStart = null;
        document.removeEventListener('mousemove', actionMousemove, false);
        document.removeEventListener('mouseup', actionMouseup, false);
        transRoot.classList.remove('dragging');
        cheat.refresh();
    }

    var dragHandlers = {
        rotate: function (e, dx, dy) {
            // console.log(dx, dy, Math.sin(dx), Math.cos(dy), );
            var rad = -Math.atan2(-dx, -dy);
            var angle = Math.round(rad * 180 / Math.PI % 360);
            return [angle + units];
        },
        scale: function (e, dx, dy) {
            var absx = Math.abs(dx);
            var absy = Math.abs(dy);
            var dist = absx > absy ? dx : -dy;
            var scale = dist / pxPerScale + (parseFloat(dragStart.values[0]) || 1);
            return [scale];
        },
        skew: function (e, dx, dy) {
            var skewX = Math.round(-dx / pxPerSkew) + (parseFloat(dragStart.values[0]) || 0);
            return [skewX + units, 0];
        },
        translate: function (e, dx, dy) {
            dx += parseFloat(dragStart.values[0]) || 0;
            dy += parseFloat(dragStart.values[1]) || 0;
            return [dx + 'px', dy + 'px'];
        }
    };


    // PUBLIC METHODS

    cheat.refresh = function () {
        var curTrans = curTransObj + '';
        ref.style.webkitTransform = curTrans;
        ref.style.webkitTransformOrigin = curOrigin;
        transDisplay.style.webkitTransform = curTrans;
        transDisplay.style.webkitTransformOrigin = curOrigin;
        var xy = curOrigin.split(' ');
        transOrigin.style.left = xy[0];
        transOrigin.style.top = xy[1];
        propTrans.textContent = curTrans;
        propOrigin.textContent = curOrigin;
    };

    cheat.setTransform = function (transform) {
        curTrans = transform;
        cheat.refresh();
    };

    cheat.setOrigin = function (origin) {
        curOrigin = origin;
        cheat.refresh();
    };

    cheat.setMode = function (mode) {
        if (!mode) {
            mode = '';
        }
        curMode = mode;
        eachAction(function (action, btn) {
            var add = action === mode;
            btn.classList[add ? 'add' : 'remove']('selected');
        });
        transRoot.setAttribute('data-mode', mode);
    };


    setup();
})(this);

cheat.refresh();
