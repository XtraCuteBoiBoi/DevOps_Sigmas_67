class Priority {
    constructor(level) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);

        this.id = "p" + timestamp + "" + random.toString().padStart(3, '0');
        this.level = level;
    }
}

module.exports = {Priority};