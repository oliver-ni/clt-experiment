const NUMBARS = 50;
const BARSIZE = 400 / NUMBARS;

const normal = x => Math.exp(-x * x / 2) / (Math.sqrt(2 * Math.PI));

const app = new Vue({
    el: '#main',
    data: {
        values: [...Array(NUMBARS).keys()].map(i => Math.round(normal(((i + 0.5) * BARSIZE - 200) / 80) * 300)),
        sample: Array(NUMBARS).fill(0),
        sdm: Array(NUMBARS).fill(0),
        dragging: false,
        sampleSize: 10,
        numToRun: 100,
    },
    computed: {
        sampMax() {
            return this.max(this.sample);
        },
        sampTick() {
            return Math.ceil((this.sampMax + 1) / 5);
        },
        sampHeight() {
            return 200 / this.roundTick(this.sampMax + 5, this.sampTick);
        },
        sdmMax() {
            return this.max(this.sdm);
        },
        sdmTick() {
            return Math.ceil((this.sdmMax + 1) / 5);
        },
        sdmHeight() {
            return 200 / this.roundTick(this.sdmMax + 5, this.sdmTick);
        },
        barSizePx() {
            return this.$refs.distr.offsetWidth / NUMBARS;
        }
    },
    methods: {
        clearSample() {
            this.sample = Array(NUMBARS).fill(0);
            this.sdm = Array(NUMBARS).fill(0);
        },
        roundTick(x, tick) {
            return Math.ceil(x / tick) * tick;
        },
        max(values) {
            return values.reduce((t, v) => Math.max(t, v), 0);
        },
        size(values) {
            return values.reduce((t, v) => t + v, 0);
        },
        mean(values) {
            return values.reduce((t, v, i) => t + (i + 0.5) * BARSIZE * v, 0) / this.size(values);
        },
        vari(values) {
            const mean = this.mean(values);
            return values.reduce((t, v, i) => t + v * Math.pow((i + 0.5) * BARSIZE - mean, 2)) / this.size(values);
        },
        sd(values) {
            return Math.sqrt(this.vari(values));
        },
        sampleOne(values) {
            const idx = Math.random() * this.size(values);
            let s = 0;
            for (const [i, v] of values.entries()) {
                s += v;
                if (idx < s) return i;
            }
        },
        sampleMany(values, size) {
            const sample = Array(NUMBARS).fill(0);
            for (let i = 0; i < size; i++) {
                sample[this.sampleOne(values)]++;
            }
            return sample;
        },
        async doSample(set = true) {
            const sample = this.sampleMany(this.values, this.sampleSize);
            if (set) this.sample = sample;
            const idx = Math.floor(this.mean(sample) / BARSIZE);
            this.$set(this.sdm, idx, this.sdm[idx] + 1);
        },
        async doManySamples() {
            let i = 0;
            function step() {
                if (i >= this.numToRun) return;
                this.doSample(i % 10 == 0);
                i++;
                setTimeout(step.bind(this), 10);
            }
            step.bind(this)();
        },
        startDrag() {
            this.dragging = true;
        },
        stopDrag() {
            this.dragging = false;
        },
        doDrag(e) {
            if (this.dragging) {
                const bound = this.$refs.distr.getBoundingClientRect();

                const x = e.pageX - bound.left;
                const y = Math.round(200 - (e.pageY - bound.top));

                const idx = Math.floor(x / this.barSizePx);
                if (x >= 0 && x < this.$refs.distr.offsetWidth) {
                    this.$set(this.values, idx, Math.max(Math.min(y, 200), 0))
                }
            }
        }
    },
    mounted() {
        window.addEventListener('mouseup', this.stopDrag);
    },
});
