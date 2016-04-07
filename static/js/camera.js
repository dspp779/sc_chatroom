/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');
var initialized = false;

function capture_camera() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    $('#pic_capture > .hint').text('Click to turn on camera');
}

var constraints = {
    audio: false,
    video: true
};

function successCallback(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
}

function errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
}

function init_camera() {
    if(initialized) return;
    
    navigator.getUserMedia(constraints, successCallback, errorCallback);
    $('#pic_capture').click(function(){
        if($(this).hasClass('camera')) {
            capture_camera();
        } else {
            init_hint();
        }
        $(this).toggleClass('camera');
    });
    initialized = true;
}

function init_hint() {
    $('.pic_capture > .hint').text('Click to take a photo');
}
