const db = require("./Database");

//college login
module.exports.CollegeLogin = async (email, password) => {
    try {
        const [result] = await db.promise().query("SELECT * FROM College WHERE email = ? AND password = ?", [email, password]);
        if (result.length > 0) {
            console.log('a');
            return result[0];
        } else {
            console.log('b');
            return null;
        }
    } catch (err) {
        throw err;
    }
};



// module.exports.AddQuestionPapers = (examId, subjectId, year, collegeId, paperType) => {

// }
