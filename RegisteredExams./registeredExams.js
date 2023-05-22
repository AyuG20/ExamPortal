import { LightningElement, wire } from 'lwc';
import { NavigationMixin,CurrentPageReference} from 'lightning/navigation';
import getRegisteredExams from '@salesforce/apex/ExamRegisteredApex.fetchExamRegistered';
import getExamState from '@salesforce/apex/ExamRegisteredApex.updateExamState';
import getScheduleDate from '@salesforce/apex/ExamRegisteredApex.updateExamUpcoming';
import getOverdue from '@salesforce/apex/ExamRegisteredApex.updateExamMissed';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';

export default class RegisteredExams extends NavigationMixin(LightningElement) {
    regExam;
    examId;
    schedDate;
    userId = Id;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        // console.log('resref ' + this.currentPageReference);
    }
    async connectedCallback() {
        this.grade = this.currentPageReference?.state?.c__grade;
        try {
            const result = await getRegisteredExams({ userId: this.userId });
            
            this.regExam = result;
        }
        catch (err) {
            console.log(err);
        }
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if(day<10){
            day = '0' + day;
        }
        if(month<10){
            month = '0'+ month;
        }
        let currentDate = `${year}-${month}-${day}`;
        
        for(let k=0;k < this.regExam.length;k++){
            console.log('curr'+currentDate);
            console.log('hello'+this.regExam[k].Exam_Scheduled_Date__c);           
            if(currentDate == this.regExam[k].Exam_Scheduled_Date__c){
                await getScheduleDate({examId:this.regExam[k].ExamId__c,userId:this.userId});
            }
            if(currentDate > this.regExam[k].Exam_Scheduled_Date__c)
                await getOverdue({examId:this.regExam[k].ExamId__c,userId:this.userId});
        }
    }
    
    async handleAttempt(event) {
        if(event.target.label !== 'Attempted' && event.target.label !== 'Upcoming'){
            const regId = event.target.title;
            for(let j=0;j<this.regExam.length;j++){
                // console.log(this.regExam.isSubmitted__c);
                if(regId === this.regExam[j].Id){
                    this.examId = this.regExam[j].ExamId__c;
                }
            }
            try{
                await getExamState({examId:this.examId,userId:this.userId});
            }
            catch(err){
                console.log(err);
            }
        // Navigate to the new component
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: "questions__c"
            },
            state: {
                c__regId: this.examId,
                c__grade: this.grade
            }
        });
    }
    else if(event.target.label === 'Upcoming'){
          const toastEvent = new ShowToastEvent({
                title: 'Alert!',
                message: 'Exam is yet to start!!',
                variant: 'info'
            });
            this.dispatchEvent(toastEvent);
    }
    else{
            const toastEvent = new ShowToastEvent({
                title: 'Alert!',
                message: 'You have already attempted this exam!!',
                variant: 'info'
            });
            this.dispatchEvent(toastEvent);
       }

    }
    async handleResult(){
        const regId = event.target.title;
        for(let i = 0;i<this.regExam.length;i++){
            if(regId === this.regExam[i].Id){
                this.examId = this.regExam[i].ExamId__c;
            }
        }
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes : {
                name: 'result__c'
            },
            state:{
                c__regId : this.examId
            }
        });
    }
}