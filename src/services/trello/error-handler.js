const { KeyAndApi } = require('../../config/constants');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// const filePath = path.join(KeyAndApi.serverFolder, 'status.json');


function handleError(state, cardId, content, content2) {
    var type = ""
    if (state == "addNewCardXlsx") type = "create"
    else if (state == "uploadFileToTrello") type = "file"
    const postData = {
        state: state,
        cardId: cardId,
        content: content,
        linkFile: content2
    };

    axios.post('http://192.168.1.220:3333/' + type, postData)
        .then(response => {
            console.log('db.json: ', response.data);
        })
        .catch(error => {
            console.error('loi post db.json:', error);
        });
}

module.exports = handleError;