const NUMBARS = 50;
const BARSIZE = 400 / NUMBARS;

const normal = x => Math.exp(-x * x / 2) / (Math.sqrt(2 * Math.PI));

const app = new Vue({
    el: '#main',
    data: {
        values: [...Array(NUMBARS).keys()].map(i => Math.round(normal(((i + 0.5) * BARSIZE - 200) / 80) * 200)),
        dragging: false,
        sampleSize: 10,
        sample: Array(NUMBARS).fill(0)
    },
    computed: {
        popMax() {
            return this.max(this.values);
        },
        sampMax() {
            return this.max(this.sample);
        }
    },
    methods: {
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
                if (idx < s) return i;
                s += v;
            }
            return NUMBARS - 1;
        },
        sampleMany(values, size) {
            const sample = Array(NUMBARS).fill(0);
            for (let i = 0; i < size; i++) {
                sample[this.sampleOne(values)]++;
            }
            return sample;
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

                const idx = Math.floor(x / BARSIZE);
                if (x >= 0 && x < 400) {
                    this.$set(this.values, idx, Math.max(Math.min(y, 200), 0))
                }
            }
        }
    },
    mounted() {
        window.addEventListener('mouseup', this.stopDrag)
    },
});
