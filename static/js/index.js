// jQuery to collapse the navbar on scroll
// $(window).scroll(function() {
//     if ($(".navbar").offset().top > 50) {
//         $(".navbar-fixed-top").addClass("top-nav-collapse");
//     } else {
//         $(".navbar-fixed-top").removeClass("top-nav-collapse");
//     }
// });
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

// jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('html, body').scrollTop(0)
    $('a.page-scroll').on('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
    
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    initMsgTextbox();
    initContent();
});

function initContent() {
    $('#login-form').on("submit", function(event){
        event.preventDefault();
        enter_chatroom();
    });
}

function initMsgTextbox() {
    $('div.msg-area').on('keydown', function(event) {
        if(event.keyCode == 13 && !event.shiftKey) {
            msg = $(this).text().trim()
            if(msg.length > 0) {
                sendMsg(msg)
                $(this).text('')
            }
            event.preventDefault();
        }
    });
    $('div.msg-area').on('input', function(event) {
        hasWord = $(this).text().length > 0 ? true:false;
        $(this).siblings(".msg-placeholder").text(hasWord ? '':'enter message...');
    });
    $('div.msg-area').on('input', function(event) {
        hasWord = $(this).text().length > 0 ? true:false;
        $(this).siblings(".msg-placeholder").text(hasWord ? '':'enter message...');
    });
    $('div.msg-area').on('paste', function(event) {
        hasWord = $(this).text().length > 0 ? true:false;
        $(this).siblings(".msg-placeholder").text(hasWord ? '':'enter message...');
        event.preventDefault();
    });
}

    
// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

function enter_chatroom() {
    $('body').removeClass('loaded');
    // 
    $('html, body').stop().animate({
        scrollTop: $('#chat-room').offset().top
    }, 1500, 'easeInOutExpo');
    login();
}

function login() {
    logindata = {};
    test = $('#login-form').serializeArray()
    for(obj in test) {
        t = test[obj];
        logindata[t.name] =t.value;
    }
    $.ajax({
        type: "POST",
        url: 'im/login/',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(logindata),
        dataType: 'json'
    }).done(onLogin);
}

myId = '';
function onLogin(logindata) {
    $('body').addClass('loaded');
    myId = logindata.id;
    console.log('login as ' + logindata.name);
    getReceiver();
}

receiverid = '';
function getReceiver() {
    $.ajax({
        type: "GET",
        url: 'im/login/'
    }).done(function(data) {
        receiver = data.receiver;
        if(receiver != '') setProfile(receiver);
        getMsg();
    });
}

function getMsg(data) {
    var p1 = new Promise(
        // The resolver function is called with the ability to resolve or
        // reject the promise
        function(resolve, reject) {
            $.ajax({
                type: "GET",
                url: 'im/message/'
            }).done(resolve);
        });
    p1.then(function(data) {
        getMsg();
        onNewMessage(data);
    });
}

function sendMsg(msg) {
    if(receiverid.length <= 0) {
        $('div.msg-placeholder').html('<span style="color:red;">Not Connected</span>');
        return;
    }
    msg = {
        msg_type: 'text',
        sender: myId,
        receiver: receiverid,
        content: msg
    }
    $.ajax({
        type: "POST",
        url: 'im/message/', 
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(msg),
        dataType: 'json'
    }).done(onNewMessage);
}

function onNewMessage(msg) {
    switch (msg.msg_type) {
        case 'receiver':
            console.log('talking to '+msg.sender.name);
            setProfile(msg.sender);
            // setTimeout(function(){ sendMsg("Hello, too!"); }, 1000);
            console.log('send to '+msg.sender.name+'\n'+msg.content+'\n'+msg.timestamp);
            break;
        case 'text':
            console.log(msg.content + ' from ' + msg.sender.name +'\n' + msg.timestamp);
            lastMsgGroup = $('div.conversation > div:last-child');
            if(msg.sender.id == myId) {
                if(!lastMsgGroup.hasClass('rMsg')) {
                    $('div.conversation').append('<div class="rMsg"></div>');
                }
            } else {
                if(!lastMsgGroup.hasClass('lMsg')) {
                    $('div.conversation').append('<div class="lMsg"></div>');
                }
            }
            $('div.conversation > div:last').append('<div class="msg-block"><div class="message"></div></div>')
                .find('.message:last').text(msg.content);
            $("div.conversation").animate({ scrollTop: $('div.conversation').height() }, "slow");
            // setTimeout(function(){ sendMsg("Hello, too!"); }, 3000);
        default:
            break;
    }
}

function setProfile(receiver) {
    $('span.profile_name').text(receiver.name).siblings('.profile_age').text(receiver.age);
    receiverid = receiver.id;
    hasWord = $('.msg-area').text().length > 0 ? true:false;
    $(".msg-placeholder").text(hasWord ? '':'enter message...');
}
