'use strict';

// Sadece senin logic dosyanı çağırıyoruz
const CourseContract = require('./components/courseContract');

// Ve dışarıya bir paket olarak sunuyoruz.
// fabric-chaincode-node sunucusu burayı okur ve çalıştırır.
module.exports.contracts = [ CourseContract ];