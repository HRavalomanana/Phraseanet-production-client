import $ from 'jquery';
const humane = require('humane-js');
;

const videoSubtitleCapture = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const initialize = (params, userOptions) => {
        let {$container, data} = params;
        var initialData = data;
        var videoSource = "/embed/?url=/datafiles/" + initialData.databoxId + "/" + initialData.recordId + "/preview/%3Fetag";

        function loadVideo() {
            $('.video-subtitle-right .video-subtitle-wrapper').html('');
            if (initialData.records[0].sources.length > 0) {
                $('.video-subtitle-right .video-subtitle-wrapper').append("<iframe src=" + videoSource + " width='100%' scrolling='no' marginheight='0' frameborder='0' allowfullscreen='' height='420'></iframe>");
            }else {
                $('.video-subtitle-right .video-subtitle-wrapper').append("<img  src='/assets/common/images/icons/substitution/video_webm.png'>");
            }
        }
        loadVideo();

        $container.on('click', '.add-subtitle-vtt', function (e) {
            e.preventDefault();
            addSubTitleVtt();
            setDiffTime();

        });
        let startVal = 0;
        let endVal = 0;
        let diffVal = 0;
        let leftHeight = 300;

        // Set height of left block
        leftHeight = $('.video-subtitle-left-inner').closest('#tool-tabs').height();
        $('.video-subtitle-left-inner').css('height', leftHeight - 178);
        $('.video-request-left-inner').css('height', leftHeight);


        $('.endTime').on('keyup change', function (e) {
            setDefaultStartTime();
            endVal = stringToseconde($(this).val());
            startVal = stringToseconde($(this).closest('.video-subtitle-item').find('.startTime').val());
            diffVal = millisecondeToTime(endVal - startVal);
            $(this).closest('.video-subtitle-item').find('.showForTime').val(diffVal);
        });
        $('.startTime').on('keyup change', function (e) {
            setDefaultStartTime();
            startVal = stringToseconde($(this).val());
            endVal = stringToseconde($(this).closest('.video-subtitle-item').find('.endTime').val());
            diffVal = millisecondeToTime(endVal - startVal);
            $(this).closest('.video-subtitle-item').find('.showForTime').val(diffVal);
        });
        function setDefaultStartTime(e) {

            var DefaultStartT = $('.video-subtitle-item:last .endTime').val();
            DefaultStartT = stringToseconde(DefaultStartT) + 1;
            DefaultStartT = millisecondeToTime(DefaultStartT);

            var DefaultEndT = stringToseconde(DefaultStartT) + 2000;
            DefaultEndT = millisecondeToTime(DefaultEndT);

            $('#defaultStartValue').val(DefaultStartT);
            $('#defaultEndValue').val(DefaultEndT);

        }

        function setDiffTime(e) {
            $('.endTime').on('keyup change', function (e) {
                setDefaultStartTime();
                endVal = stringToseconde($(this).val());
                startVal = stringToseconde($(this).closest('.video-subtitle-item').find('.startTime').val());
                diffVal = millisecondeToTime(endVal - startVal);
                $(this).closest('.video-subtitle-item').find('.showForTime').val(diffVal);
            });
            $('.startTime').on('keyup change', function (e) {
                setDefaultStartTime();
                startVal = stringToseconde($(this).val());
                endVal = stringToseconde($(this).closest('.video-subtitle-item').find('.endTime').val());
                diffVal = millisecondeToTime(endVal - startVal);
                $(this).closest('.video-subtitle-item').find('.showForTime').val(diffVal);

            });
        }

        function stringToseconde(time) {
            let tt = time.split(":");
            let sec = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
            return sec * 1000;
        }

        function millisecondeToTime(duration) {
            var milliseconds = parseInt((duration % 1000 / 100) * 100),
                seconds = parseInt((duration / 1000) % 60),
                minutes = parseInt((duration / (1000 * 60)) % 60),
                hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            // if(isNaN(hours) && isNaN(minutes) && isNaN(seconds) && isNaN(milliseconds) ) {
            return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
            //}

        }

        $container.on('click', '.remove-item', function (e) {
            e.preventDefault();
            $(this).closest('.video-subtitle-item').remove();
        });

        $('#submit-subtitle').on('click', function (e) {
            e.preventDefault();
            buildCaptionVtt('save');
        });

        $('#copy-subtitle').on('click', function (event) {
            event.preventDefault();
            buildCaptionVtt('copy');
            /* $('#submit-subtitle').trigger('click');
             return copyElContentClipboard('record-vtt');*/
        });

        function buildCaptionVtt(btn) {
            try {
                let allData = $('#video-subtitle-list').serializeArray();
                allData = JSON.parse(JSON.stringify(allData));
                allData = JSON.parse(JSON.stringify(allData));
                let metaStructId = $('#metaStructId').val();

                let countSubtitle = $('.video-subtitle-item').length;
                if (allData) {
                    var i = 0;
                    var captionText = "WEBVTT\n\n";
                    while (i <= countSubtitle * 3) {
                        captionText += allData[i].value + " --> " + allData[i + 1].value + "\n" + allData[i + 2].value + "\n\n";
                        i = i + 3;
                        if (i == (countSubtitle * 3) - 3) {
                            $('#record-vtt').val(captionText);
                            console.log(captionText);
                            if (btn == 'save') {
                                //send data
                                $.ajax({
                                    type: 'POST',
                                    url: url + 'prod/tools/metadata/save/',
                                    dataType: 'json',
                                    data: {
                                        databox_id: data.databoxId,
                                        record_id: data.recordId,
                                        meta_struct_id: metaStructId,
                                        value: captionText
                                    },
                                    success: function success(data) {
                                        if (!data.success) {
                                            humane.error(localeService.t('prod:videoeditor:subtitletab:messsage:: error'));
                                        } else {
                                            humane.info(localeService.t('prod:videoeditor:subtitletab:messsage:: success'));
                                            loadVideo();
                                        }
                                    }
                                });
                            }
                            if (btn == 'copy') {
                                return copyElContentClipboard('record-vtt');
                            }
                        }
                    }
                    ;
                }

            } catch (err) {
                return;
            }
        }

        var copyElContentClipboard = function copyElContentClipboard(elId) {
            var copyEl = document.getElementById(elId);
            copyEl.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
            } catch (err) {
                console.log('unable to copy');
            }
        };


        const addSubTitleVtt = () => {
            let countSubtitle = $('.video-subtitle-item').length;
            if($('.alert-error').length) {
                $('.alert-error').remove();
            }
            if(countSubtitle > 1) {
                setDefaultStartTime();
            }
            let item = $('#default-item').html();
            $('.fields-wrapper').append(item);
            $('.video-subtitle-item:last .time').attr('pattern', '[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9]{3}$');
            $('.video-subtitle-item:last .startTime').attr('name', 'startTime' + countSubtitle).addClass('startTime' + countSubtitle).val($('#defaultStartValue').val());
            $('.video-subtitle-item:last .endTime').attr('name', 'endTime' + countSubtitle).addClass('endTime' + countSubtitle).val($('#defaultEndValue').val());
            $('.video-subtitle-item:last .number').html(countSubtitle);
            //setDiffTime();
        };


        // Edit subtitle
        var fieldvalue = '';
        var ResValue = '';
        var captionValue = '';
        var captionLength = '';
        var timeValue = '';

        //Show default caption to edit
        fieldvalue = $('#caption_' + $('#metaStructId').val()).val();
        editCaptionByLanguage(fieldvalue);


        $('#metaStructId').on('keyup change', function (e) {
            fieldvalue = $('#caption_' + $(this).val()).val();
            editCaptionByLanguage(fieldvalue);
            $('.editing > .caption-label').click(function (e) {
                $(this).next('.video-subtitle-item').toggleClass('active');
                $(this).toggleClass('caption_active');
            })
        });

        $('.editing >p').click(function (e) {
            $(this).next('.video-subtitle-item').toggleClass('active');
            $(this).toggleClass('caption_active');
        })

        function editCaptionByLanguage(fieldvalue) {
            $('.fields-wrapper').html('');
            if (fieldvalue != '') {
                ResValue = fieldvalue.split("WEBVTT\n\n");
                captionValue = ResValue[1].split("\n\n");
                captionLength = captionValue.length - 1;
                var item = $('#default-item').html();
                for (var i = 0; i < captionLength; i++) {
                    console.log(captionValue[i]);
                    timeValue = captionValue[i].split(" --> ");
                    timeValue = captionValue[i].split(" --> ");
                    $('.fields-wrapper').append('<div class="item_' + i + ' editing"></div>')
                    $('.fields-wrapper .item_' + i + '').append('<p class="caption-label">' + captionValue[i] + '</p>');
                    $('.fields-wrapper .item_' + i + '').append(item);
                    $('.item_' + i + ' .video-subtitle-item ').find('.number').text(i + 1);
                    $('.item_' + i + ' .video-subtitle-item ').find('.startTime').val(timeValue[0]);
                    timeValue = timeValue [1].split("\n")
                    $('.item_' + i + ' .video-subtitle-item ').find('.endTime').val(timeValue[0]);
                    if (timeValue[1] != '') {
                        $('.item_' + i + ' .video-subtitle-item ').find('.captionText').val(timeValue[1]);
                    }
                }
                console.log(captionValue);
            } else {
                var errorMsg = $('#no_caption').val();
                $('.fields-wrapper').append('<p class="alert alert-error">'+errorMsg+'</p>');
            }
        }


        //Subtitle Request Tab
        $('#submit-subtitle-request').on('click', function (e) {
            e.preventDefault();
            try {
                var requestData = $('#video-subtitle-request').serializeArray();
                requestData = JSON.parse(JSON.stringify(requestData));
                console.log(requestData)

            } catch (err) {
                return;
            }
        });
    }

    /*    const render = (initData) => {
     let record = initData.records[0];
     if (record.type !== 'video') {
     return;
     }
     options.frameRates = {};
     options.ratios = {};
     const coverUrl = '';
     let generateSourcesTpl = (record) => {
     let recordSources = [];
     _.each(record.sources, (s, i) => {
     recordSources.push(`<source src="${s.src}" type="${s.type}" data-frame-rate="${s.framerate}">`)
     options.frameRates[s.src] = s.framerate;
     options.ratios[s.src] = s.ratio;
     });

     return recordSources.join(' ');
     };
     let sources = generateSourcesTpl(record);
     $('.video-subtitle-right .video-subtitle-wrapper').html('');
     $('.video-subtitle-right .video-subtitle-wrapper').append(
     `<video id="embed-video" class="thumb_video embed-resource video-js vjs-default-skin vjs-big-play-centered" data-ratio="{{ prevRatio }}" controls
     preload="none" width="100%" height="100%" poster="${coverUrl}" data-setup='{"language":"${localeService.getLocale()}"}'>${sources}
     <track kind="captions" src=${$('#record-vtt').val()} srclang="en" label="English" default>
     </video>`);
     };*/

    return {
        initialize
    }
}


export default videoSubtitleCapture;