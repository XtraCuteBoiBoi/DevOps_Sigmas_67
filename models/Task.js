class Task {
    constructor(name, categoryId, subjectId, priorityId,statusId, month, year, hour) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);

        this.id = "t" + timestamp + "" + random.toString().padStart(3, '0');
        this.name = name;
        this.categoryId = categoryId;
        this.subjectId = categoryId == '2' ? subjectId : null;
        this.priorityId = priorityId;
        this.statusId = statusId;
        this.month = month;
        this.year = year;
        this.hour = hour;

    }
}

module.exports = {Task};