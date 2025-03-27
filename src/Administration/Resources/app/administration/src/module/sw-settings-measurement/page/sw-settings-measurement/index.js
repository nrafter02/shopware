import template from './sw-settings-measurement.html.twig';

/**
 * @sw-package inventory
 * @private
 */
export default {
    template,

    inject: ['acl'],

    metaInfo() {
        return {
            title: this.$createTitle(),
        };
    },
};
