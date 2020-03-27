var agent = $("#agent").val();
var telNumber = $("#telNumber").val();
console.log(agent);
console.log(telNumber);
var config = {
    uri: 'sip:'+agent+'@47.93.117.234:7799',
    ws_servers:'wss://47.93.117.234:7443',
    authorizationUser:'1009',
    password:'710709099',
    transportOptions: {
        wsServers: ['wss://47.93.117.234:7443']
    },
    hackWssInTransport: true,
    registerOptions: {
        expires: 300,
       // registrar: 'sip:'+agent+'@47.93.117.234:7799',
    },
}
$("#registerSip").on("click",function () {
    var ua= new SIP.UA(config);
    $("#status").val("当前状态：在线");

    var Ring={
        /**
         * 振铃
         */
        startRingTone: function () {
            console.log("start ring!!!!");
            let play = document.getElementById("ringtone").play();
            play.then(()=>{

            }).catch((err)=>{

            });
        },
        /**
         * 停止振铃
         */
        stopRingTone: function () {
            console.log("stop ring!!!!");
            document.getElementById("ringtone").pause();
        },
        startRingbackTone: function () {
            let play = document.getElementById("ringbacktone").play();
            play.then(()=>{
            }).catch((err)=>{
            });
        },
        stopRingbackTone: function () {
            document.getElementById("ringbacktone").pause();
        }
    };

    function bindEvent(obj, ev, fn) {
        if (obj.attachEvent) {
            obj.attachEvent("on" + ev, fn);
        }
        else {
            obj.addEventListener(ev, fn, false);
        }
    }

    $("#startCall").on("click",function () {
        var telNumber = $("#telNumber").val();

        var sessionall = ua.invite(telNumber,{
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: true,
                    video: false
                },
                alwaysAcquireMediaFirst: true // 此参数是sip.js官方修复在firefox遇到的bug所设置
            }
        });
        Ring.startRingTone();
        var remoteVideo = document.getElementById('remoteVideo');
        var localVideo = document.getElementById('localVideo');
        sessionall.on("accepted", function (response, cause) {
            console.log(response);
            Ring.stopRingTone();
            var pc = this.sessionDescriptionHandler.peerConnection;
            var remoteStream;
            if (pc.getReceivers) {
                remoteStream = new window.MediaStream();
                pc.getReceivers().forEach(function (receiver) {
                    var track = receiver.track;
                    if (track) {
                        remoteStream.addTrack(track);
                    }
                });
            } else {
                remoteStream = pc.getRemoteStreams()[0];
            }
            remoteVideo.srcObject = remoteStream;
            remoteVideo.play();
            var localStream_1;
            if (pc.getSenders) {
                localStream_1 = new window.MediaStream();
                pc.getSenders().forEach(function (sender) {
                    var track = sender.track;
                    if (track && track.kind === "video") {
                        localStream_1.addTrack(track);
                    }
                });
            }
            else {
                localStream_1 = pc.getLocalStreams()[0];
            }
            localVideo.srcObject = localStream_1;
            localVideo.play();
        });

        sessionall.on('progress', function (response, cause) {
            console.log(response);
            Ring.stopRingbackTone();
            console.warn('开始振铃！。。');
            console.warn(response.statusCode);

            if (response.statusCode === 183) {
                sessionall.createDialog(response,'UAC');
                sessionall.hasAnswer = true;
                sessionall.status = 11;
                sessionall.sessionDescriptionHandler.setDescription(response.body)
                    .catch(function (exception) {
                        sessionall.logger.warn(exception);
                        sessionall.failed(response, C.causes.BAD_MEDIA_DESCRIPTION);
                        sessionall.acceptAndTerminate({status_code: 488, reason_phrase: 'Bad Media Description'});
                    });

            }});



        //每次收到成功的最终（200-299）响应时都会触发。
        sessionall.on("accepted", function (response, cause) {
            console.log(response);
            Ring.stopRingbackTone();
            var pc = this.sessionDescriptionHandler.peerConnection;
            var remoteStream;

            if (pc.getReceivers) {
                remoteStream = new window.MediaStream();
                pc.getReceivers().forEach(function (receiver) {
                    var track = receiver.track;
                    if (track) {
                        remoteStream.addTrack(track);
                    }
                });
            } else {
                remoteStream = pc.getRemoteStreams()[0];
            }
            remoteVideo.srcObject = remoteStream;


            var localStream_1;
            if (pc.getSenders) {
                localStream_1 = new window.MediaStream();
                pc.getSenders().forEach(function (sender) {
                    var track = sender.track;
                    if (track && track.kind === "video") {
                        localStream_1.addTrack(track);
                    }
                });
            }
            else {
                localStream_1 = pc.getLocalStreams()[0];
            }
            localVideo.srcObject = localStream_1;
        })

        //挂机时会触发
        sessionall.on("bye", function (response, cause) {
            Ring.stopRingbackTone();
            console.log(response);
        })

        //请求失败时触发，无论是由于最终响应失败，还是由于超时，传输或其他错误。
        sessionall.on("failed", function (response, cause) {
            Ring.stopRingbackTone();
            console.log(response);
        })

        /**
         *
         */
        sessionall.on("terminated", function (message, cause) {
            Ring.stopRingbackTone();
        })

        /**
         * 对方拒绝
         */
        sessionall.on('rejected', function (response, cause) {
            Ring.stopRingbackTone();
        })

    });

});








$("#quitSip").on("click",function () {
    $("#status").val("当前状态：离线");
});
$("#audioPlay").on("click",function () {
    document.getElementById("ringtone").play();
})
$("#audioPause").on("click",function () {
    document.getElementById("ringtone").pause();
})
