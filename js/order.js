


var currentCountry = null;

var regexInteger = /^[0-9]+$/;
var upperLimit = 20000;
var lowerLimit = 100;
var extraPrizeUpperLimit = 5000;
var edittd;
var isExtraPrize = false;

 var localizedStrings = {
        reventado: 'Reventado',
        quantity: 'Cantidad',
        total: 'Total',
        Msg_SessionDateInvalid: 'La fecha límite ha pasado!',
        Msg_BanNumber: ' es un numero prohibido y no se puede vender',
        Msg_WrongFormatAmount: 'Formato de monto incorrecto',
        Msg_MiniMumAmount: 'el monto no alcanza el límite inferior:',
        Msg_MaximumAmount: 'El monto máximo es:',
        Msg_MaximumAvailableAmount: 'El monto máximo disponible es:',
        Msg_WrongFormatReventado: 'Formato de reventado incorrecto',
        Msg_ReventadoGreaterAmount: 'Reventado es mayor que Monto!',
        Msg_MiniMumReventado: 'el reventado no alcanza el límite inferior:',
        Msg_MaximumAvailableReventado: 'El monto máximo reventado es:',
        Msg_SubmitFail: 'Envío fallido',
        Msg_WrongFormatNumber: 'Formato de número incorrecto',
        Msg_EmptyStartNumber: 'El número desde no puede estar vacío',
        Msg_EmpryEndNumber: 'El número hasta no puede estar vacío',
        Msg_WrongFormatStartNumber: 'Formato de número desde incorrecto',
        Msg_WrongFormatEndNumber: 'Formato de número hasta incorrecto',
        Msg_StartGreaterEnd: 'El número desde no puede ser mayor que el número hasta',
        Msg_ErrorNumbers: ':Estos números no se pueden ingresar',
        Msg_NullOrder: 'El orden no existe!',
        Msg_MaximumReventado: 'es el límite superior para los bonos y no se puede exceder',
        Msg_WrongFormat: 'Error de formato'
    };

var allConfigs = [
    {
        country: "Nica",
		isExtraPrize: false,
        sessions: [
            { some: "12AM", cutTime: "11:50" },
            { some: "3PM",  cutTime: "14:50" },
            { some: "6PM",  cutTime: "17:50" },
            { some: "9PM",  cutTime: "20:50" }
        ]
    },
    {
        country: "Tica",
		isExtraPrize: true,
        sessions: [
            { some: "1:00", cutTime: "12:50" },
            { some: "4:30", cutTime: "16:20" },
            { some: "7:30", cutTime: "19:20" }
        ]
    }
];

// 重建 Sesión 下拉框
function applyCountrySessions(country) {
    currentCountry = country;

    var cfg = allConfigs.find(x => x.country === country);
    if (!cfg) return;

    var $select = $('#someSelect');
    $select.empty();

    var now = new Date();
    var selectedSome = null;

    cfg.sessions.forEach(function (s) {
        // 计算今天的截止时间
        var today = new Date();
        var parts = s.cutTime.split(':');
        today.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);

        // 找到第一个未来场次
        if (selectedSome === null && now < today) {
            selectedSome = s.some;
        }

        // 加入 option
        var $opt = $('<option>')
            .val(s.some)
            .text(s.some)
            .attr('data-some-time', s.cutTime);

        $select.append($opt);
    });

    // 如果没有未来场次 → 默认选第一条
    if (!selectedSome && cfg.sessions.length > 0) {
        selectedSome = cfg.sessions[0].some;
    }

    // 选中目标场次
    $select.val(selectedSome);
}

$(function () {
    // ① 设置今天日期
    (function setToday() {
        var d = new Date();
        var yyyy = d.getFullYear();
        var mm = ('0' + (d.getMonth() + 1)).slice(-2);
        var dd = ('0' + d.getDate()).slice(-2);
        $('#someDate').val(yyyy + '-' + mm + '-' + dd);
    })();
	// 限制不以小于今天的日期
	(function setDateLimit() {
		var d = new Date();
		var yyyy = d.getFullYear();
		var mm = ('0' + (d.getMonth() + 1)).slice(-2);
		var dd = ('0' + d.getDate()).slice(-2);
		var todayStr = yyyy + "-" + mm + "-" + dd;

		// 限制日期不能比今天小
		$('#someDate').attr('min', todayStr);
	})();

    // ② 读取上次国家
    var savedCountry = localStorage.getItem('selectedCountry');
    var $activeLink = $('.nav-pills li.active > a.country-link');
    var defaultCountry = $activeLink.data('country') || 'Tica';

    var initCountry = savedCountry || defaultCountry;

    // ③ 初始化 isExtraPrize（依国家）
    var cfg0 = allConfigs.find(function (x) { return x.country === initCountry; });
    if (cfg0) {
        isExtraPrize = !!cfg0.isExtraPrize;
    } else {
        isExtraPrize = false;
    }

    // 初始化 Reventado 输入区 & 表头
    if (isExtraPrize) {
        $('.extraPrize-group').css('visibility', 'visible');
        if ($('th[data-col="extraPrize"]').length === 0) {
            $('thead tr th:nth-child(1)').after(
                '<th class="text-center" data-col="extraPrize">Reventado</th>'
            );
        }
    } else {
        $('.extraPrize-group').css('visibility', 'hidden');
        $('#inputExtraPrize').val('');
        $('th[data-col="extraPrize"]').remove();
        $('td[data-extraPrize-number]').remove();
    }

    // ④ 设置选中的 tab 背景
    $('.nav-pills li').removeClass('active');
    $('.nav-pills a.country-link').each(function () {
        if ($(this).data('country') === initCountry) {
            $(this).parent('li').addClass('active');
        }
    });

    // ⑤ 构建该国家的场次
    applyCountrySessions(initCountry);

    // ⑥ 点击国家 tab：切换国家 + isExtraPrize + 场次
    $('.nav-pills').on('click', 'a.country-link', function (e) {
        e.preventDefault();

        var country = $(this).data('country');
        if (!country || country === currentCountry) return;

        $('.nav-pills li').removeClass('active');
        $(this).parent('li').addClass('active');

        // 记住选中国家
        localStorage.setItem('selectedCountry', country);

        // 找配置，更新 isExtraPrize
        var cfg = allConfigs.find(function (x) { return x.country === country; });
        if (cfg) {
            isExtraPrize = !!cfg.isExtraPrize;
        } else {
            isExtraPrize = false;
        }

        // 控制 Reventado 输入区 + 表头 + 行
        if (isExtraPrize) {
            $('.extraPrize-group').css('visibility', 'visible');

            if ($('th[data-col="extraPrize"]').length === 0) {
                $('thead tr th:nth-child(1)').after(
                    '<th class="text-center" data-col="extraPrize">Reventado</th>'
                );
            }

            // 已有行补上加奖列（默认 0）
            $('#numberList tr').each(function () {
                var $row = $(this);
                var $amountTd = $row.find('td[data-amount-number]');
                if ($amountTd.length && $row.find('td[data-extraPrize-number]').length === 0) {
                    var number = $amountTd.data('amount-number');
                    var amount = parseInt($amountTd.text(), 10) || 0;
                    var $extraTd = $('<td>')
                        .attr('data-extraPrize-number', number)
                        .attr('data-extraPrize-amount', amount)
                        .attr('onclick', 'editExtraPrize(this)')
                        .text('0');
                    $amountTd.before($extraTd);
                }
            });

        } else {
            $('.extraPrize-group').css('visibility', 'hidden');
            $('#inputExtraPrize').val('');
            $('th[data-col="extraPrize"]').remove();
            $('td[data-extraPrize-number]').remove();
        }

        // 重建该国家场次
        applyCountrySessions(country);
		toTotal();
    });
});

function toTotal() {
    totalAmount = 0;

    $('td[data-amount-number]').each(function () {
        var amount = parseInt($(this).text(), 10);
        if (!isNaN(amount)) { // 确保转换为数字成功
            totalAmount += amount;
        }
    });
    $('td[data-extraprize-number]').each(function () {
        var amount = parseInt($(this).text(), 10);
        if (!isNaN(amount)) { // 确保转换为数字成功
            totalAmount += amount;
        }
    });
    var trLength = $("#numberList tr").length;
    $('#orderCount').text(localizedStrings.quantity + ':' + trLength);
    $('#orderTotal').text(localizedStrings.total + ':' + totalAmount);
}

// 点击单元格时触发的函数，将单元格内容替换为可编辑的输入框
function editExtraPrize(td) {
    $('#modalBackdrop, #addReventadoPanel').fadeIn();
    var number = td.getAttribute('data-extraPrize-number');
    edittd = td;
    $('#panelReventado').text("（" + number + "）" + localizedStrings.reventado);
    var value = td.innerText;
    $('#inputEditExtraPrize').val(value);
    $('#inputEditExtraPrize').focus().select();

}

//编辑加奖方法
function editAddExtraPrize() {
    var number = edittd.getAttribute('data-extraPrize-number');
    var amount = edittd.getAttribute('data-extraPrize-amount');
    var extraPrize = $('#inputEditExtraPrize').val();
    if (!regexInteger.test(extraPrize)) {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_WrongFormatReventado);
        setTimeout(function () {
            $('#inputEditExtraPrize').focus().select();
        }, 0);

        return;
    }
    var extraPrizeInt = parseInt(extraPrize, 10);
    var amountInt = parseInt(amount, 10);
    if (extraPrizeInt > amountInt) {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_ReventadoGreaterAmount);
        setTimeout(function () {
            $('#inputEditExtraPrize').focus().select();
        }, 0);
        return;
    }
    if (lowerLimit > extraPrizeInt && extraPrizeInt != '0') {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_MiniMumReventado + lowerLimit);
        setTimeout(function () {
            $('#inputEditExtraPrize').focus().select();
        }, 0);

        return;
    }

    if (extraPrizeUpperLimit < extraPrizeInt) {
        $('#audioWrong')[0].play();
        alert(extraPrizeUpperLimit + "--" + localizedStrings.Msg_MaximumReventado);
        setTimeout(function () {
            $('#inputEditExtraPrize').focus().select();
        }, 0);

        return;
    }

    edittd.innerText = extraPrizeInt;
    $('#inputEditExtraPrize').val('');
    $('#modalBackdrop, #addReventadoPanel').hide();
    toTotal();

}


//将数据添加到列表
function addNumberToList(number, amount, extraPrize) {
    var amountInt = parseInt(amount, 10) || 0; // 获取新输入的amount并转换为整数，如果无效则默认为0
    var extraPrizeInt = parseInt(extraPrize, 10) || 0; // 同理处理extraPrize


    var found = false;  // 标记是否找到匹配的旧行
    // 遍历所有行，查找与输入的 number 匹配的行
    $('#numberList tr').each(function () {
        var existingNumber = $(this).find('td[data-amount-number]').data('amount-number') + "";//注意后面，不然是一个number类型，无法对比

        if (existingNumber === number) {
            var existingAmount = parseInt($(this).find('td[data-amount-number]').text(), 10) || 0;
            amountInt += existingAmount;  // 将旧行的amount加到新输入的amount上

            if (isExtraPrize) {
                var existingExtraPrize = parseInt($(this).find('td[data-extraPrize-number]').text(), 10) || 0;
                extraPrizeInt += existingExtraPrize;  // 同理处理extraPrize
            }

            $(this).remove();  // 删除旧行
            found = true;
            return false;  // 找到后跳出循环
        }
    });
    // 构建并添加新行
    var newRow = '<tr>' +
        '<td name="number">' + number + '</td>' +
        // 为 data-extraPrize-number 列添加点击事件
        (isExtraPrize ? '<td data-extraPrize-number="' + number + '" data-extraPrize-amount="' + amountInt + '" onclick="editExtraPrize(this)">' + extraPrizeInt + '</td>' : '') +
        '<td data-amount-number="' + number + '">' + amountInt + '</td>' +
        '<td><button class="delete-row-btn"><i class="fa fa-trash"></i></button></td>' +
        '</tr>';

    $('#numberList').prepend(newRow);  // 将新行添加到表格的顶部
    $('#inputNumber').val('');
    $('#inputNumber').focus();
    toTotal();

    // 触发音乐播放
    $('#audioSuccessfully')[0].play();


}
//判断时间是否过期
function isDate() {
    var someDate = $('#someDate').val();
    var someTime = $('#someSelect option:selected').data('some-time'); // ⭐ 从当前选中的场次取截止时间
    if (!someDate || !someTime) return ""; // 防御一下

    var currentDate = new Date();
    var dateTimeString = someDate + ' ' + someTime;
    var dateFromStr = new Date(dateTimeString);

    if (isNaN(dateFromStr.getTime())) {
        return ""; // 时间解析错误就当没过期（你也可以这里直接给错误提示）
    }

    if (dateFromStr.getTime() <= currentDate.getTime()) {
        return localizedStrings.Msg_SessionDateInvalid;
    }
    return "";
}


//检查是否可以添加数字
function isAddNumber(number, amount, extraPrize) {


    var numberInt = parseInt(number, 10);
    if (!regexInteger.test(number) || numberInt >= 100 || number.length === 3) {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_WrongFormatNumber);
        setTimeout(function () {
            $('#inputNumber').focus().select();
        }, 0);

        return false;
    }


    //判断时间是否过期

    var isOKDate = isDate()
    if (isOKDate != "") {
        $('#audioWrong')[0].play();
        alert(isOKDate);
        return false;
    }

    //////////////////////金额上限和限制号码金额检查

    if (!regexInteger.test(amount)) {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_WrongFormatAmount);
        setTimeout(function () {
            $('#inputAmount').focus().select();
        }, 0);

        return false;
    }

    var amountInt = parseInt(amount, 10);//转换为整数，防止金额01 02 那些数
    if (lowerLimit > amountInt) {//判断是否小于下限
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_MiniMumAmount + lowerLimit);
        setTimeout(function () {
            $('#inputAmount').focus().select();
        }, 0);


        return false;
    }
    $('#inputAmount').val(amountInt);//转换为整数，防止金额01 02 那些数




    if (amountInt > upperLimit) {
        $('#audioWrong')[0].play();
        alert(localizedStrings.Msg_MaximumAmount + upperLimit);
        setTimeout(function () {
            $('#inputAmount').focus().select();
        }, 0);

        return false;
    }

    var listAmount = 0;//如果号码已经在列表中，合计金额
    //检查号码已在列表存在
    $('td[data-amount-number]').each(function () {
        var amountNumber = $(this).attr('data-amount-number');
        // 这里可以添加你的条件判断逻辑
        if (amountNumber === number) {
            var value = parseInt($(this).text(), 10);
            listAmount += value;
            return false;//跳出循环
        }
    });



    
if ((listAmount + amountInt) > upperLimit) {
        $('#audioWrong')[0].play();
        //在这里可以告诉客户还有多少金额可以填写
        alert(localizedStrings.Msg_MaximumAvailableAmount + (upperLimit - listAmount));
        setTimeout(function () {
            $('#inputAmount').focus().select();
        }, 0);

        return false;
    }


    //////////////////////////////加奖限制检查

    if (isExtraPrize) {
        if (extraPrize != '' && extraPrize !== '0') {

            if (!regexInteger.test(extraPrize)) {
                $('#audioWrong')[0].play();
                alert(localizedStrings.Msg_WrongFormatReventado);
                setTimeout(function () {
                    $('#inputExtraPrize').focus().select();
                }, 0);

                return false;
            }
            

		var extraPrizeInt = parseInt(extraPrize, 10);
            if (extraPrizeInt > amountInt) {
                $('#audioWrong')[0].play();
                alert(localizedStrings.Msg_ReventadoGreaterAmount);
                setTimeout(function () {
                    $('#inputExtraPrize').focus().select();
                }, 0);

                return false;
            }

            if (lowerLimit > extraPrizeInt) {
                $('#audioWrong')[0].play();
                alert(localizedStrings.Msg_MiniMumReventado + lowerLimit);
                setTimeout(function () {
                    $('#inputExtraPrize').focus().select();
                }, 0);

                return false;
            }

            $('#inputExtraPrize').val(extraPrizeInt);//转换为整数，防止金额01 02 那些数

            //检查加奖上限
            if (extraPrizeUpperLimit < extraPrizeInt) {
                $('#audioWrong')[0].play();
                alert(extraPrizeUpperLimit + "--" + localizedStrings.Msg_MaximumReventado);
                setTimeout(function () {
                    $('#inputExtraPrize').focus().select();
                }, 0);

                return false;
            }
            var listExtraPrize = 0;//合计列表某个号码加奖金额
            $('td[data-extraprize-number]').each(function () {
                var extraprizeNumber = $(this).attr('data-extraprize-number');
                // 这里可以添加你的条件判断逻辑
                if (extraprizeNumber === number) {
                    var value = parseInt($(this).text(), 10);
                    listExtraPrize += value;

                    return false;//跳出循环
                }
            });

       

            if ((listExtraPrize + extraPrizeInt) > extraPrizeUpperLimit) {
                $('#audioWrong')[0].play();
                alert(localizedStrings.Msg_MaximumAvailableReventado + (extraPrizeUpperLimit - listExtraPrize));
                setTimeout(function () {
                    $('#inputExtraPrize').focus().select();
                }, 0);

                return false;
            }
        }

    }

   

    return true;
}

function isAddNumberArray(number, amount, extraPrize) {
    var numberInt = parseInt(number, 10);
    if (!regexInteger.test(number) || numberInt >= 100 || number.length === 3) {
        return localizedStrings.Msg_WrongFormatNumber;
    }

    $('#inputNumber').val(number);


    if (!regexInteger.test(amount)) {
        return localizedStrings.Msg_WrongFormatAmount;
    }

    var amountInt = parseInt(amount, 10);
    if (lowerLimit > amountInt) {
        return localizedStrings.Msg_MiniMumAmount + lowerLimit;
    }
    if (amountInt > upperLimit) {
        return localizedStrings.Msg_MaximumAmount + upperLimit;
    }

    $('#inputAmount').val(amountInt);

    var listAmount = 0;
    $('td[data-amount-number]').each(function () {
        if ($(this).attr('data-amount-number') === number) {
            listAmount += parseInt($(this).text(), 10);
            return false;
        }
    });



    if (listAmount + amountInt > upperLimit) {
        return localizedStrings.Msg_MaximumAvailableAmount + (upperLimit - listAmount);
    }

    if (isExtraPrize && extraPrize && extraPrize !== '0') {
        if (!regexInteger.test(extraPrize)) {
            return localizedStrings.Msg_WrongFormatReventado;
        }

        var extraPrizeInt = parseInt(extraPrize, 10);
        if (extraPrizeInt > amountInt) {
            return localizedStrings.Msg_ReventadoGreaterAmount;
        }
        if (lowerLimit > extraPrizeInt) {
            return localizedStrings.Msg_MiniMumReventado + lowerLimit;
        }

        $('#inputExtraPrize').val(extraPrizeInt);

        if (extraPrizeUpperLimit < extraPrizeInt) {
            return extraPrizeUpperLimit + "--" + localizedStrings.Msg_MaximumReventado;
        }

        var listExtraPrize = 0;
        $('td[data-extraprize-number]').each(function () {
            if ($(this).attr('data-extraprize-number') === number) {
                listExtraPrize += parseInt($(this).text(), 10);
                return false;
            }
        });

        var dateExtraPrizeNumberTotal = 0;

        if ((listExtraPrize + extraPrizeInt) > extraPrizeUpperLimit) {
            return localizedStrings.Msg_MaximumAvailableReventado + (extraPrizeUpperLimit - listExtraPrize);
        }

      
    }

    return ""; // 空字符串表示通过验证
}

function addArrayToList() {
    var isOKDate = isDate()
    if (isOKDate != "") {
        alert(isOKDate);
        return false;
    }
    var button = $('#addArray'); // 获取按钮
    button.prop('disabled', true); // 禁用按钮，防止重复点击

    var start = $('#inputArrayStart').val().trim();
    var end = $('#inputArrayEnd').val().trim();
    if (start === "") {
        alert(localizedStrings.Msg_EmptyStartNumber);
        setTimeout(function () {
            $('#inputArrayStart').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    if (end === '') {
        alert(localizedStrings.Msg_EmpryEndNumber);
        setTimeout(function () {
            $('#inputArrayEnd').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    var startInt = parseInt(start, 10);
    if (isNaN(startInt) || startInt >= 100) {
        alert(localizedStrings.Msg_WrongFormatStartNumber);
        setTimeout(function () {
            $('#inputArrayStart').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    var endInt = parseInt(end, 10);
    if (isNaN(endInt) || endInt >= 100) {
        alert(localizedStrings.Msg_WrongFormatEndNumber);
        setTimeout(function () {
            $('#inputArrayEnd').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    if (startInt >= endInt) {
        alert(localizedStrings.Msg_StartGreaterEnd);
        setTimeout(function () {
            $('#inputArrayStart').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }

    var amount = $('#inputArrayAmount').val();
    var amountInt = parseInt(amount, 10);
    if (!amountInt) {
        alert(localizedStrings.Msg_WrongFormatAmount);
        setTimeout(function () {
            $('#inputArrayAmount').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    var extraPrize = $('#inputArrayExtraPrize').val();
    if (isExtraPrize) {
        if (extraPrize != '' && extraPrize !== '0') {
            var extraPrizeInt = parseInt(extraPrize, 10);
            if (!extraPrizeInt) {
                alert(localizedStrings.Msg_WrongFormatReventado);
                setTimeout(function () {
                    $('#inputArrayExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
            if (extraPrizeInt > amountInt) {
                alert(localizedStrings.Msg_ReventadoGreaterAmount);
                setTimeout(function () {
                    $('#inputArrayExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
        }
    }

    var errorMsgs = [];
    for (var i = startInt; i <= endInt; i++) {
        var number = i < 10 ? "0" + i : "" + i;
        var errorMsg = isAddNumberArray(number, amount, extraPrize);
        if (errorMsg === "") {
            addNumberToList(number, amount, extraPrize);
        } else {
            errorMsgs.push(number + "：" + errorMsg);
        }
    }
    button.prop('disabled', false); // 重新启用按钮
    if (errorMsgs.length > 0) {
        $('#audioWrong')[0].play();
        alert(errorMsgs.join('\n'));
        setTimeout(function () {
            $('#inputArrayAmount').focus().select();
        }, 0);
        return false;
    }

    $('#inputArrayStart, #inputArrayEnd, #inputArrayAmount, #inputArrayExtraPrize').val('');
    $('#modalBackdrop, #addArrayPanel').hide();


}


function addHeadToList() {
    var isOKDate = isDate()
    if (isOKDate != "") {
        alert(isOKDate);
        return false;
    }
    var button = $('#addHead'); // 获取按钮
    button.prop('disabled', true); // 禁用按钮，防止重复点击

    var number = $('#inputHeadNumber').val().trim();
    var amount = $('#inputHeadAmount').val().trim();
    var amountInt = parseInt(amount, 10);
    var numberInt = parseInt(number, 10);

    if (numberInt === undefined || number.length > 1) {
        alert(localizedStrings.Msg_WrongFormatNumber);
        setTimeout(function () {
            $('#inputHeadNumber').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }
    if (!amountInt) {
        alert(localizedStrings.Msg_WrongFormatAmount);
        setTimeout(function () {
            $('#inputHeadAmount').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }

    var extraPrize = $('#inputHeadExtraPrize').val();

    if (isExtraPrize) {
        if (extraPrize != '' && extraPrize !== '0') {
            var extraPrizeInt = parseInt(extraPrize, 10);
            if (!extraPrizeInt) {
                alert(localizedStrings.Msg_WrongFormatReventado);
                setTimeout(function () {
                    $('#inputHeadExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
            if (extraPrizeInt > amountInt) {
                alert(localizedStrings.Msg_ReventadoGreaterAmount);
                setTimeout(function () {
                    $('#inputHeadExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
        }
    }

    var value = "";
    var errorMsgs = [];
    for (var i = 0; i < 10; i++) {
        value = number + i;
        var errorMsg = isAddNumberArray(value, amount, extraPrize);
        if (errorMsg === "") {
            addNumberToList(value, amount, extraPrize);
        } else {
            errorMsgs.push(value + "：" + errorMsg);
        }
    }

    button.prop('disabled', false); // 重新启用按钮
    if (errorMsgs.length > 0) {
        $('#audioWrong')[0].play();
        alert(errorMsgs.join('\n'));
        setTimeout(function () {
            $('#inputHeadAmount').focus().select();
        }, 0);
        return false;
    }

    $('#inputHeadNumber,#inputHeadExtraPrize,#inputHeadAmount').val('');
    $('#modalBackdrop, #addHeadPanel').hide();


}

function addDoubleToList() {
    var isOKDate = isDate()
    if (isOKDate != "") {
        alert(isOKDate);
        return false;
    }
    var button = $('#addDouble'); // 获取按钮
    button.prop('disabled', true); // 禁用按钮，防止重复点击

    var amount = $('#inputDoubleAmount').val().trim();
    var amountInt = parseInt(amount, 10);

    if (!amountInt) {
        alert(localizedStrings.Msg_WrongFormatAmount);
        setTimeout(function () {
            $('#inputDoubleAmount').focus().select();
        }, 0);
        button.prop('disabled', false); // 恢复按钮
        return false;
    }

    var extraPrize = $('#inputDoubleExtraPrize').val();
    if (isExtraPrize) {
        if (extraPrize != '' && extraPrize !== '0') {
            var extraPrizeInt = parseInt(extraPrize, 10);
            if (!extraPrizeInt) {
                alert(localizedStrings.Msg_WrongFormatReventado);
                setTimeout(function () {
                    $('#inputDoubleExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
            if (extraPrizeInt > amountInt) {
                alert(localizedStrings.Msg_ReventadoGreaterAmount);
                setTimeout(function () {
                    $('#inputDoubleExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
        }
    }

    var numbers = ["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"];
    var errorMsgs = [];

    $.each(numbers, function (index, value) {
        var errorMsg = isAddNumberArray(value, amount, extraPrize);
        if (errorMsg === "") {
            addNumberToList(value, amount, extraPrize);
        } else {
            errorMsgs.push(value + "：" + errorMsg);
        }
    });

    button.prop('disabled', false); // 重新启用按钮
    if (errorMsgs.length > 0) {
        $('#audioWrong')[0].play();
        alert(errorMsgs.join('\n'));
        setTimeout(function () {
            $('#inputArrayAmount').focus().select();
        }, 0);
        return false;
    }


    $('#inputDoubleExtraPrize,#inputDoubleAmount').val('');
    $('#modalBackdrop, #addDoublePanel').hide();

}

function addEndToList() {
    var isOKDate = isDate()
    if (isOKDate != "") {
        alert(isOKDate);
        return false;
    }
    var button = $('#addEnd'); // 获取按钮
    button.prop('disabled', true); // 禁用按钮，防止重复点击

    var number = $('#inputEndNumber').val().trim();
    var amount = $('#inputEndAmount').val().trim();
    var amountInt = parseInt(amount, 10);
    var numberInt = parseInt(number, 10);

    if (isNaN(numberInt) || number.length > 1) {  // 修正 numberInt === "undefined" 的错误
        alert(localizedStrings.Msg_WrongFormatNumber);
        setTimeout(function () {
            $('#inputEndNumber').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }

    if (!amountInt) {
        alert(localizedStrings.Msg_WrongFormatAmount);
        setTimeout(function () {
            $('#inputEndAmount').focus().select();
        }, 0);

        button.prop('disabled', false); // 恢复按钮
        return false;
    }


    var extraPrize = $('#inputEndExtraPrize').val();

    if (isExtraPrize) {
        if (extraPrize != '' && extraPrize !== '0') {
            var extraPrizeInt = parseInt(extraPrize, 10);
            if (!extraPrizeInt) {
                alert(localizedStrings.Msg_WrongFormatReventado);
                setTimeout(function () {
                    $('#inputEndExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
            if (extraPrizeInt > amountInt) {
                alert(localizedStrings.Msg_ReventadoGreaterAmount);
                setTimeout(function () {
                    $('#inputEndExtraPrize').focus().select();
                }, 0);

                button.prop('disabled', false); // 恢复按钮
                return false;
            }
        }
    }

    var value = "";
    var errorMsgs = [];
    for (var i = 0; i < 10; i++) {
        value = i + number;
        var errorMsg = isAddNumberArray(value, amount, extraPrize);
        if (errorMsg === "") {
            addNumberToList(value, amount, extraPrize);
        } else {
            errorMsgs.push(value + "：" + errorMsg);
        }
    }
    button.prop('disabled', false); // 重新启用按钮
    if (errorMsgs.length > 0) {
        $('#audioWrong')[0].play();
        alert(errorMsgs.join('\n'));
        setTimeout(function () {
            $('#inputArrayAmount').focus().select();
        }, 0);
        return false;
    }
    $('#inputEndNumber,#inputEndExtraPrize,#inputEndAmount').val('');
    $('#modalBackdrop, #addEndPanel').hide();

}




$(document).ready(function () {


    $('#inputAmount').on('keydown', function (e) {
        if (e.key === 'Tab' || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab行为
            //$('#inputExtraPrize').length ? $('#inputExtraPrize').focus().select() : $('#inputNumber').focus().select();
            $('#inputNumber').focus().select();
        } else if (e.key === '*') {
            e.preventDefault(); // 阻止默认Tab行为
            $('#inputExtraPrize').focus().select();
        }
    });

    $('#inputExtraPrize').on('keydown', function (e) {
        if (e.key === 'Tab' || e.key === '+') {
            e.preventDefault(); // 阻止默认Tab行为
            $('#inputNumber').focus().select();
        } else if (e.key === '*') {
            e.preventDefault(); // 阻止默认Tab行为
            $('#inputExtraPrize').focus().select();
        }
    });

    $('#inputNumber').on('keydown', function (e) {
        if (e.key === 'Tab' || e.key === '+') {
            e.preventDefault();
            // 阻止默认Tab行为
            $('#inputAmount').focus().select();
        } else if (e.key === '*') {
            e.preventDefault(); // 阻止默认Tab行为
            $('#inputExtraPrize').focus().select();
        } else if (e.key === 'Enter' || e.keyCode === 13) {
            var trLength = $("#numberList tr").length;
            var str = $('#inputNumber').val();
            if (str === '' && trLength > 0) {
                $('#modalBackdrop, #addTotalPanel').fadeIn();
                $('#panelTotal').text(totalAmount);
                $('#inputTotal').val(totalAmount);
                $('#inputTotal').focus().select();
            } else {
                $('span[name="add-number"]').click();
            }


        } else if (e.key === 'Delete' || e.keyCode === 46) {
            $('#numberList tr:first').remove();  // 删除列表中的第一行
            toTotal();
        } else if (e.key === '/') {
            e.preventDefault(); // ⭐️ 阻止 / 输入框写入
            // 获取第一行的加奖 <td>
            var td = $('#numberList tr:first td[data-extraPrize-number]');
            if (td.length > 0) {
                editExtraPrize(td[0]);  // 调用方法并传入原生DOM对象
            }
        }
    });

    //清空
    $('#clear-numberList').click(function () {
        $('#numberList').empty(); // 清空#numberList的内容
        $('#orderCount').text(localizedStrings.quantity);
        $('#orderTotal').text(localizedStrings.total);
        $('#inputAmount').focus().select();
    });

    //删除某个数字
    $('#numberList').on('click', '.delete-row-btn', function () {
        $(this).closest('tr').remove(); // 删除这个按钮所在的行
        toTotal();//计算订单
        $('#inputNumber').focus().select();

    });

    //添加按键
    $('span[name="add-number"]').click(function () {
        var number = $('#inputNumber').val();
        var amount = $('#inputAmount').val();
        var extraPrize = $('#inputExtraPrize').val();//加奖输入框
        if (number.length === 1) {
            number = '0' + number;
        }
        
        if (!isAddNumber(number, amount, extraPrize)) {//监听添加按钮的点击事件
            return false;
        }
       
        addNumberToList(number, amount, extraPrize);


    });

    //inputNumber输入时触发
    $('#inputNumber').on('input', function () {
        // 检查输入值是否是两位数且小于100
        if ($(this).val().length > 1) {
            // 触发span中name为'add-number'的元素的点击事件
            $('span[name="add-number"]').click();
        }
    });


    // 监听 document 的 keydown 事件
    $(document).keydown(function (e) {
        if (e.keyCode == 119 || e.key === '-') {
            e.preventDefault();//阻止触发其它事件
            // 触发提交按钮的点击事件
            $("#submit-button").trigger('click');

        } else if (e.key === "F10") {
            e.preventDefault();
            $('#keyEnd').trigger('click');
        } else if (e.key === "F9") {
            e.preventDefault();
            $('#keyHead').trigger('click');
        } else if (e.key === "F7") {
            e.preventDefault();
            $('#keyDouble').trigger('click');
        } else if (e.key === "F6") {
            e.preventDefault(); // 阻止默认 F11 行为（例如浏览器全屏）
            $('#keyArray').trigger('click');
        } 
    });

    $('#cancelInput').click(function (event) {
        event.preventDefault();
        $('#inputInput').val('');
        $('#modalBackdrop, #addInpuntPanel').hide();
    });

    


    //编辑加奖
    $('#cancelReventado').click(function (event) {
        event.preventDefault();
        $('#inputEditExtraPrize').val('');
        $('#modalBackdrop, #addReventadoPanel').hide();
    });
    //确定编辑加奖
    $('#editReventado').click(function (event) {
        event.preventDefault();
        editAddExtraPrize();
        $('#inputNumber').focus();

    });

    //编辑加奖
    $('#inputEditExtraPrize').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault(); // 阻止默认Tab行为
            editAddExtraPrize();
            $('#inputNumber').focus();
        }
    });

    // 快捷键数组事件

    // 数组添加事件
    $('#keyArray').click(function (event) {
        event.preventDefault();
        $('#modalBackdrop, #addArrayPanel').fadeIn();
		// ⭐ 根据 extraPrizeExists 判断是否显示 Reventado
		if (isExtraPrize) {
			$('#arrayReventadoRow').show();
		} else {
			$('#arrayReventadoRow').hide();
			$('#inputArrayExtraPrize').val(''); // 清空避免影响
		}
        $('#inputArrayStart').focus();
    });
    //隐藏
    $('#cancelAddArray').click(function (event) {
        event.preventDefault();
        $('#inputArrayStart, #inputArrayEnd, #inputArrayAmount, #inputArrayExtraPrize').val('');
        $('#modalBackdrop, #addArrayPanel').hide();
    });

    $('#addArray').click(function (event) {
        event.preventDefault();
        addArrayToList();

    });
    $('#inputArrayAmount').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  // 阻止默认行为，防止表单提交
            addArrayToList();
        }
    });


    // 数组添加事件END

    // 对数添加事件
    $('#keyDouble').click(function (event) {
        event.preventDefault();
        $('#modalBackdrop, #addDoublePanel').fadeIn();
		// ⭐ 根据 extraPrizeExists 判断是否显示 Reventado
		if (isExtraPrize) {
			$('#doubleReventadoRow').show();
		} else {
			$('#doubleReventadoRow').hide();
			$('#inputDoubleExtraPrize').val(''); // 清空避免影响
		}
        $('#inputDoubleAmount').focus();
    });
    //隐藏
    $('#cancelAddDouble').click(function (event) {
		event.preventDefault();
		$('#inputDoubleExtraPrize, #inputDoubleAmount').val(''); // ⭐ 用逗号连接两个选择器
		$('#modalBackdrop, #addDoublePanel').hide();
	});


    $('#addDouble').click(function (event) {
        event.preventDefault();
        addDoubleToList();

    });
    $('#inputDoubleAmount').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  // 阻止默认行为，防止表单提交
            addDoubleToList();
        }
    });


    // 对数添加事件END


    // 字头
    $('#keyHead').click(function (event) {
        event.preventDefault();
        $('#modalBackdrop, #addHeadPanel').fadeIn();
		if (isExtraPrize) {
			$('#headReventadoRow').show();
		} else {
			$('#headReventadoRow').hide();
			$('#inputHeadExtraPrize').val(''); // 清空避免影响
		}
        $('#inputHeadNumber').focus();
    });
    //隐藏
    $('#cancelAddHead').click(function (event) {
        event.preventDefault();
        $('#inputHeadNumber,#inputHeadExtraPrize,#inputHeadAmount').val('');
        $('#modalBackdrop, #addHeadPanel').hide();
    });

    $('#addHead').click(function (event) {
        event.preventDefault();
        addHeadToList();

    });
    $('#inputHeadAmount').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  // 阻止默认行为，防止表单提交
            addHeadToList();
        }
    });
    //只能输入一个号码
    $('#inputHeadNumber').on('input', function () {
        if (this.value.length > 1) {
            this.value = this.value.charAt(1); // 保留第二个字符
        }
    });
    //字头END


    // 字尾
    $('#keyEnd').click(function (event) {
        event.preventDefault();
        $('#modalBackdrop, #addEndPanel').fadeIn();
		if (isExtraPrize) {
			$('#endReventadoRow').show();
		} else {
			$('#endReventadoRow').hide();
			$('#inputEndExtraPrize').val(''); // 清空避免影响
		}
        $('#inputEndNumber').focus();
    });
    //隐藏
    $('#cancelAddEnd').click(function (event) {
        event.preventDefault();
        $('#inputEndNumber,#inputEndExtraPrize,#inputEndAmount').val('');
        $('#modalBackdrop, #addEndPanel').hide();
    });

    $('#addEnd').click(function (event) {
        event.preventDefault();
        addEndToList();

    });
    $('#inputEndAmount').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  // 阻止默认行为，防止表单提交
            addEndToList();
        }
    });
    //只能输入一个号码
    $('#inputEndNumber').on('input', function () {
        if (this.value.length > 1) {
            this.value = this.value.charAt(1); // 保留第二个字符
        }
    });

    //字尾END

    //有焦点全选
    $('#inputAmount').on('focus', function () {
        $(this).select(); // 选中内容
    });
    //有焦点全选
    $('#inputExtraPrize').on('focus', function () {
        $(this).select(); // 选中内容
    });
    //有焦点全选
    $('#inputNumber').on('focus', function () {
        $(this).select(); // 选中内容
    });


// ===============================
//  V4：金额 / 100 的二维码编码器
//  支持金额最高 25500
//  Nica: 2 bytes / Tica: 3 bytes
// ===============================
function encodeOrderToQR_V4(country, dateStr, session, list) {
    var C = (country === "Tica") ? "T" : "N";

    var d = dateStr.replace(/-/g, "").slice(2);

    var S = session;

    var bytes = [];

    list.forEach(function (it) {
        var num = parseInt(it.number, 10);
        var amt = parseInt(it.amount, 10);
        var ex  = parseInt(it.extraPrize || 0, 10);

        if (num < 0) num = 0;
        if (num > 255) num = 255;
        if (amt < 0) amt = 0;
        if (amt > 65535) amt = 65535;
        if (ex < 0) ex = 0;
        if (ex > 65535) ex = 65535;

        var amtHi = (amt >> 8) & 0xFF;
        var amtLo = amt & 0xFF;

        bytes.push(num & 0xFF);
        bytes.push(amtHi);
        bytes.push(amtLo);

        if (C === "T") {
            var exHi = (ex >> 8) & 0xFF;
            var exLo = ex & 0xFF;
            bytes.push(exHi);
            bytes.push(exLo);
        }
    });

    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    var b64 = btoa(binary);

    return C + " " + d + " " + S + " " + b64;
}





$("#submit-button").click(function () {

    var country = currentCountry;
    var date = $('#someDate').val();
    var session = $('#someSelect').val();

    var list = [];
    $('#numberList tr').each(function () {
        list.push({
            number: $(this).find('td[name="number"]').text(),
            amount: $(this).find('td[data-amount-number]').text(),
            extraPrize: isExtraPrize
                ? $(this).find('td[data-extraPrize-number]').text()
                : 0
        });
    });

    var qrString = encodeOrderToQR_V4(country, date, session, list);
	//console.log(qrString);

    $("#qrBox").empty();

    new QRCode(document.getElementById("qrBox"), {
        text: qrString,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.M
    });

    $("#qrOverlay").show();

    $("#mainContent").addClass("hidden");
});


$("#closeQR").click(function () {
     $("#qrOverlay").hide();              // 隐藏二维码层
    $("#mainContent").removeClass("hidden"); // 恢复主界面       
});

$(document).keydown(function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
        // 触发关闭按钮
        $("#closeQR").click();
    }
});


});




$('#inputAmount').focus();




