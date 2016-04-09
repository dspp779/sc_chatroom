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

var constraints = {
    audio: false,
    video: true
};

$(function() {
    $('#pic_capture').click(function(){
        if($(this).hasClass('camera')) {
            capture_camera();
        } else {
            openCamera()
        }
        $(this).toggleClass('camera');
    });
});

function openCamera() {
    navigator.getUserMedia(constraints, successCallback, errorCallback);
}

function closeCamera() {
    window.stream.getVideoTracks()[0].stop();
    $('#pic_capture > .hint').text('Click to turn on camera');
}

function capture_camera() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    // stop camera stream
    closeCamera();
}

function successCallback(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
    $('#pic_capture > .hint').text('Click to take a photo');
}

function errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
    $('#pic_capture > .hint').text('Unable to open camera');
}
