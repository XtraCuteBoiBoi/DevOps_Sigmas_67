class Subject {
    constructor(name) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);

        this.id = "sub" + timestamp + "" + random.toString().padStart(3, '0');
        this.name = name;
    }
}

module.exports = {Subject};