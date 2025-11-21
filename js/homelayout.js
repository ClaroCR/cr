$(document).ready(function () {
    $('#modalBackdrop, #addInpuntPanel, #addArrayPanel, #addDoublePanel, #addHeadPanel,#addEndPanel,#addSingleIdPanel,#addReventadoPanel,#addTotalPanel').hide();//隐藏快捷键界面
    
    var selectedCountry = $.cookie('selectedCountry'); // 使用getCookie函数获取cookie中的国家名
    // 页面加载时设置激活状态
    if (selectedCountry) {
        setActiveLink(selectedCountry);
    } else {
        var firstCountry = $('.nav-link').first().data('country');
        $.cookie('selectedCountry', firstCountry, { expires: 7, path: '/' });
        setActiveLink(firstCountry);
    }
    //日期值改变时
    $('#someDate').change(function () {
        $('#inputAmount').focus().select();
    });
    //场次时间改变值，更改换input参数值
    $('#someSelect').change(function () {
        $(this).find('option').removeAttr('selected');
        $(this).find('option:selected').attr('selected', 'selected');
        var selectedTime = $(this).find('option:selected').data('some-time');
        $('#someTime').val(selectedTime);
        $('#inputAmount').focus().select();
    });

    //绑定点击事件到所有带有 'nav-link' 类的链接
    $('.nav-link').click(function (e) {
        var country = $(this).data('country'); // 从 data-country 属性获取
        $.cookie('selectedCountry', country, { expires: 7, path: '/' }); // 设置cookie
    });
    function setActiveLink(country) {
        $('.nav-pills .active').removeClass('active');
        $('.nav-link').each(function () {
            if ($(this).data('country') === country) {
                $(this).parent('li').addClass('active');
            }
        });
    }
    // 当点击 amountLink 链接时
    $('.amountLink').click(function (e) {
        e.preventDefault(); // 阻止<a>标签的默认行为
        var amount = $(this).data('amount'); // 获取data-amount属性的值
        var inputAmount = parseInt($('#inputAmount').val(),10);
       if (inputAmount === amount) {
            $('#inputExtraPrize').val(amount);
        } else {
           $('#inputAmount').val(amount);
           $('#inputExtraPrize').val('');

        }

        $('#inputNumber').focus().select();
    });

   
});