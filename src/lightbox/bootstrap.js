import $ from 'jquery';
import ConfigService from './../components/core/configService';
import LocaleService from '../components/locale';
import defaultConfig from './config';
import Emitter from '../components/core/emitter';
import lightbox from './../components/lightbox/index';
import mainMenu from './../components/mainMenu';
import merge from 'lodash.merge';
require('phraseanet-common/src/components/tooltip');
require('phraseanet-common/src/components/vendors/contextMenu');

class Bootstrap {
    app;
    configService;
    localeService;
    appServices;
    appLightbox;

    constructor(userConfig) {

        const configuration = merge({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
        this.configService = new ConfigService(configuration);

        this.localeService = new LocaleService({
            configService: this.configService
        });

        this.localeService.fetchTranslations()
            .then(() => {
                this.onConfigReady();
            });

        return this;
    }

    onConfigReady() {
        this.appServices = {
            configService: this.configService,
            localeService: this.localeService,
            appEvents: this.appEvents
        };

        window.bodySize = {
            x: 0,
            y: 0
        };

        /**
         * add components
         */

        $(document).ready(() => {
            let $body = $('body');
            window.bodySize.y = $body.height();
            window.bodySize.x = $body.width();

            lightbox(this.appServices).initialize({$container: $body});
            mainMenu(this.appServices).initialize({$container: $body});

            let isReleasable = this.configService.get('releasable');

            if (isReleasable !== null) {
                this.appLightbox.setReleasable(isReleasable);
            }
        });

    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
