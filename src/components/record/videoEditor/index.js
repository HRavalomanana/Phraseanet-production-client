require('./style/main.scss');
import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import videoScreenCapture from './videoScreenCapture';
import videoRangeCapture from './videoRangeCapture';
import * as Rx from 'rx';

const humane = require('humane-js');

const recordVideoEditorModal = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    let $dialog = null;
    let toolsStream = new Rx.Subject();

    toolsStream.subscribe((params) => {
        switch (params.action) {
            case 'refresh':
                openModal.apply(null, params.options);
                break;
            default:
        }
    })
    const openModal = (datas, activeTab) => {
        $dialog = dialog.create(services, {
            size: 'Custom',
            customWidth: 770,
            customHeight: 650,
            title: localeService.t('videoEditor'),
            loading: true
        });

        return $.get(`${url}prod/tools/videoEditor`
            , datas
            , function (data) {
                $dialog.setContent(data);
                $dialog.setOption('contextArgs', datas);
                _onModalReady(data, window.toolsConfig, activeTab);
                return;
            }
        );
    };


    const _onModalReady = (template, data, activeTab) => {

        var $scope = $('#prod-tool-box');
        var tabs = $('#tool-tabs', $scope).tabs();
        if (activeTab !== false) {
            tabs.tabs('option', 'active', activeTab);
        }

        // available if only 1 record is selected:
        if (data.selectionLength === 1 && data.isVideo === "true") {
            videoScreenCapture(services).initialize({$container: $scope, data});
            videoRangeCapture(services).initialize({$container: $('.video-range-editor-container'), data, services});
        }else {
            let confirmationDialog = dialog.create(services, {
                size: 'Alert',
                title: localeService.t('warning'),
                closeOnEscape: true
            }, 3);

            let content = $('<div />').css({
                'text-align': 'center',
                width: '100%',
                'font-size': '14px'
            }).append(localeService.t('error video editor'));
            confirmationDialog.setContent(content);
            $dialog.close();
        }
    };

    return {openModal};
};

export default recordVideoEditorModal;
