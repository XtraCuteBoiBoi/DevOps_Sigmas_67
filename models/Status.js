class Status {
    constructor(state) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);

        this.id = "s" + timestamp + "" + random.toString().padStart(3, '0');
        this.state = state;
    }
}

module.exports = {Status};