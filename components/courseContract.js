'use strict';

const { Contract } = require('fabric-contract-api');

class CourseContract extends Contract {
    async initLedger(ctx) {
        console.info('Ledger başlatılıyor...');
        return 'Init Success';
    }


    async createCourse(ctx, courseCode, courseName, quota) {
        const exists = await this._courseExists(ctx, courseCode);
        if (exists) {
            throw new Error(`HATA: ${courseCode} kodlu ders zaten mevcut.`);
        }

        const course = {
            code: courseCode,
            name: courseName,
            quota: parseInt(quota),
            enrolled: 0,
            active: true
        };


        await ctx.stub.putState(courseCode, Buffer.from(JSON.stringify(course)));

        console.info(`Event Fırlatılıyor: CourseCreatedEvent -> ${courseCode}`);
        ctx.stub.setEvent('CourseCreatedEvent', Buffer.from(JSON.stringify(course)));

        return JSON.stringify(course);
    }

    async registerStudent(ctx, courseCode, studentId) {
        const courseBytes = await ctx.stub.getState(courseCode);
        if (!courseBytes || courseBytes.length === 0) {
            throw new Error(`HATA: ${courseCode} kodlu ders bulunamadı!`);
        }

        const course = JSON.parse(courseBytes.toString());

        // BURAYA ASIL KONTROLLER GELİCEK ŞUANLIK SADECE BASİT KONTROLLER 
        if (!course.active) {
            throw new Error(`HATA: ${courseCode} dersi kayıtlara kapalı.`);
        }

        if (course.enrolled >= course.quota) {
            throw new Error(`HATA: ${courseCode} dersinin kontenjanı dolu! (${course.enrolled}/${course.quota})`);
        }

        course.enrolled += 1;

        await ctx.stub.putState(courseCode, Buffer.from(JSON.stringify(course)));

        const eventData = {
            courseCode: courseCode,
            studentId: studentId,
            currentEnrolled: course.enrolled
        };
        console.info(`Event Fırlatılıyor: StudentRegisteredEvent -> ${JSON.stringify(eventData)}`);
        
        ctx.stub.setEvent('StudentRegisteredEvent', Buffer.from(JSON.stringify(eventData)));

        return JSON.stringify({ status: "SUCCESS", course: course });
    }

    async _courseExists(ctx, courseCode) {
        const courseBytes = await ctx.stub.getState(courseCode);
        return courseBytes && courseBytes.length > 0;
    }
}

module.exports = CourseContract;