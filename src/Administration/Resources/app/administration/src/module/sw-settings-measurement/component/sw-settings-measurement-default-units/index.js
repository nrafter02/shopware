import template from './sw-settings-measurement-default-units.html.twig';

/**
 * @sw-package inventory
 * @private
 */
export default {
    template,

    data() {
        return {
            systemUnit: 'metric',
            dimensionUnit: 'meter',
            weightUnit: 'kilogram',
        };
    },

    computed: {
        systemUnitOptions() {
            return [
                {
                    label: this.$t('sw-settings-measurement.defaultUnits.system.metric'),
                    value: 'metric',
                },
                {
                    label: this.$t('sw-settings-measurement.defaultUnits.system.imperial'),
                    value: 'imperial',
                },
            ];
        },

        dimensionUnitOptions() {
            const metricUnits = [
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.meter'), value: 'meter' },
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.centimeter'), value: 'centimeter' },
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.millimeter'), value: 'millimeter' },
            ];

            const imperialUnits = [
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.inch'), value: 'inch' },
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.foot'), value: 'foot' },
                { label: this.$t('sw-settings-measurement.defaultUnits.dimension.yard'), value: 'yard' },
            ];

            return this.systemUnit === 'metric' ? metricUnits : imperialUnits;
        },

        weightUnitOptions() {
            const metricUnits = [
                { label: this.$t('sw-settings-measurement.defaultUnits.weight.kilogram'), value: 'kilogram' },
                { label: this.$t('sw-settings-measurement.defaultUnits.weight.gram'), value: 'gram' },
                { label: this.$t('sw-settings-measurement.defaultUnits.weight.milligram'), value: 'milligram' },
            ];

            const imperialUnits = [
                { label: this.$t('sw-settings-measurement.defaultUnits.weight.pound'), value: 'pound' },
                { label: this.$t('sw-settings-measurement.defaultUnits.weight.ounce'), value: 'ounce' },
            ];

            return this.systemUnit === 'metric' ? metricUnits : imperialUnits;
        },
    },

    watch: {
        systemUnit: {
            handler() {
                this.dimensionUnit = this.systemUnit === 'metric' ? 'meter' : 'inch';
                this.weightUnit = this.systemUnit === 'metric' ? 'kilogram' : 'pound';
            },
            immediate: true,
        },
    },
};
