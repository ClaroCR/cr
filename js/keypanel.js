$(document).ready(function () {
    $(document).on('keydown', function (event) {
        if (event.key === "Escape") {  // 使用 event.key 来判断是否按下了 "Escape" 键
            $('#inputArrayStart, #inputInput, #inputArrayEnd, #inputArrayAmount, #inputArrayExtraPrize,#inputDoubleExtraPrize,#inputDoubleAmount,#inputHeadNumber,#inputHeadExtraPrize,#inputHeadAmount,#inputEndNumber,#inputEndExtraPrize,#inputEndAmount,#inputSingleId,#inputSingleIdExtraPrize,#inpuntSingleIdAmount,#inputEditExtraPrize,#inputTotal').val('');
            $('#checkboxSingleIdAmount').prop('checked', false).trigger('change');
            $('#modalBackdrop, #addInpuntPanel, #addArrayPanel,#addDoublePanel,#addHeadPanel,#addEndPanel,#addEndPanel,#addSingleIdPanel,#addReventadoPanel,#addTotalPanel').hide();
            $('#outTotal').text('0');
            $('#inputNumber').focus().select();
        }
    });
    $('input.tab-array').keydown(function (e) {
        if (e.key === "Tab" || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab切换行为
            // 每次按键时，动态获取当前所有「可见」的 tab-array 输入框
			var $visibleInputs = $('input.tab-array:visible');

			var idx = $visibleInputs.index(this);
			var nextIdx = (idx + 1) % $visibleInputs.length; // 循环到第一个

			var $next = $visibleInputs.eq(nextIdx);
			$next.focus().select();
        }
    });

    $('input.tab-double').keydown(function (e) {
        if (e.key === "Tab" || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab切换行为
             // 每次按键时，动态获取当前所有「可见」的 tab-array 输入框
			var $visibleInputs = $('input.tab-double:visible');

			var idx = $visibleInputs.index(this);
			var nextIdx = (idx + 1) % $visibleInputs.length; // 循环到第一个

			var $next = $visibleInputs.eq(nextIdx);
			$next.focus().select();
        }
    });

    $('input.tab-head').keydown(function (e) {
        if (e.key === "Tab" || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab切换行为
			var $visibleInputs = $('input.tab-head:visible');

			var idx = $visibleInputs.index(this);
			var nextIdx = (idx + 1) % $visibleInputs.length; // 循环到第一个

			var $next = $visibleInputs.eq(nextIdx);
			$next.focus().select();
        }
    });

    $('input.tab-end').keydown(function (e) {
        if (e.key === "Tab" || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab切换行为
			var $visibleInputs = $('input.tab-end:visible');

			var idx = $visibleInputs.index(this);
			var nextIdx = (idx + 1) % $visibleInputs.length; // 循环到第一个

			var $next = $visibleInputs.eq(nextIdx);
			$next.focus().select();
        }
    });

  
});
