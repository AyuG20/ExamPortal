import { LightningElement,wire} from 'lwc';
import getExamType from '@salesforce/apex/ExamTypeApex.fetchExamType';
import getExamDate from '@salesforce/apex/ExamScheduleApex.fetchExamDate';
import setStudent from '@salesforce/apex/RegisteredStudentApex.setStudent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserEmail from '@salesforce/schema/User.Username';
export default class StudentExamRegistration extends LightningElement {
    examtypelst;
    userEmail;
    examId;
    selectedExam;
    selectedDate;
    getStartDate;
    getEndDate;
    // onChangeMail(event){
    //     this.mail = event.target.value;
    // }

    userId=Id;
    @wire(getRecord, { recordId: Id, fields: [UserEmail]}) 
    currentUserInfo({error, data}) {
    if (data) {
            this.userEmail = data.fields.Username.value;
        } else if (error) {
            this.error = error ;
        }
    }
    onChangeSelExam(event) {
        console.log('user '+ this.userId + 'email: ' + this.userEmail) ;
        this.selectedExam = event.target.value;
        for(let i=0;i<this.examtypelst.length;i++){
            if(this.examtypelst[i].Name === this.selectedExam){
                this.examId = this.examtypelst[i].Id;
            }
    }
    try{
        getExamDate({name:this.selectedExam})
            .then(result => {
                if (Array.isArray(result)) {
                    // result is an array of records
                    console.log('result' + result);
                    result.forEach(res =>{
                        this.getStartDate = res.Available_Start_Date__c;
                        this.getEndDate = res.Available_End_Date__c;
                    });
                } 
                
            })
            .catch(error => {
                console.log(error);
            });
    }
    catch(err){
        console.log(err);
    }
}

    onChangeExamDate(event) {
        this.selectedDate = event.target.value;
    }
    //Fetching Exam Type by calling Apex
    async connectedCallback() {
        try {
            const res = await getExamType();
            this.examtypelst = res;
            console.log(this.examtypelst);
            // this.examId = res.Id;
            // console.log(this.examId);
        }
        catch (err) {
            alert('Error');
        }
    }

   async saveStudent(){
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
        let studentdata = {'sobject':'Exam_Registration__c'};
        studentdata.Student_Email__c = this.userEmail ;
        studentdata.Exam_Type__c = this.selectedExam;
        studentdata.Exam_Scheduled_Date__c = this.selectedDate;
        studentdata.Exam_Status__c = 'Registered';
        studentdata.ExamId__c = this.examId;
        studentdata.isSubmitted__c = 0;
        studentdata.isUpcoming__c = 1;
        studentdata.isOverdue__c = 0;
        console.log(studentdata.ExamId__c); 
        try{
            console.log('stureg'+currentDate);
            if((this.selectedDate >= currentDate && this.selectedDate <= this.getEndDate) && (this.selectedExam) ) {
                await setStudent({stu:studentdata,userId:this.userId});
                const toastEvent = new ShowToastEvent({
                        title:'Success!',
                        message:'Registered Successfully',
                        variant:'success'
                    });
                this.dispatchEvent(toastEvent); 
            }
            else{
                    const errorEvent = new ShowToastEvent({
                        title:'Alert!!',
                        message:'Fill all the fields or check the Scheduled Date',
                        variant:'info'
                    });
                this.dispatchEvent(errorEvent); 
            }
        }
        catch(err){
                const errorEvent = new ShowToastEvent({
                        title:'Alert!!',
                        message:'You have already appeared for this exam',
                        variant:'error'
                    });
                this.dispatchEvent(errorEvent); 
        }
    }
}