

module.exports = function() {
    const filePath = './logFile.txt'
    const fs = require('fs');
    const NEW_LINE_CHARACTERS = ["\n"];
    const readFromChar = function(statInfo, file, currentCharacterCount) {
        return fs.read(file, Buffer.alloc(1), 0, 1, statInfo.size - 1 - currentCharacterCount)
        .then((bytesReadAndBuffer) => {
            return String.fromCharCode(bytesReadAndBuffer[1][0]);
        });
    };

    return new Promise((resolve, reject) => {
        let thisObj = {
            statInfo: null,
            file: null,
        };

        let chars = 0;
        let lineCount = 0;
        let lines = "";
        let promises = [];

        promises.push(
            fs.stat(filePath, function(err, stats) {
                console.log("Error", err)
                thisObj.statInfo = stats
            })
        )

        promises.push(
            fs.open(filePath, "r")
                .then(file => thisObj.file = file));

        return Promise.all(promises)
        .then(() => {
            const fileIteration = function() {
                if (lineCount >= 10) {
                    fs.close(thisObj.file);
                    return resolve(Buffer.from(lines, "binary").toString('utf8'));
                }

                return readFromChar(thisObj.statInfo, thisObj.file, chars)
                .then((nextCharacter) => {
                    lines = nextCharacter + lines;
                    if (NEW_LINE_CHARACTERS.includes(nextCharacter) && lines.length > 1) {
                        lineCount++;
                    }
                    chars++;
                })
                .then(fileIteration);
            };
            return fileIteration();
        }).catch((err) => {
            return reject(err);
        });
    });
};
