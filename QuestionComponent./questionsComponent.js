import { LightningElement, wire } from 'lwc';
import setResult from '@salesforce/apex/OptionsApex.setExamResults';
import getQuestions from '@salesforce/apex/QuestionsApex.fetchQuestions';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserEmail from '@salesforce/schema/User.Username';
export default class QuestionsComponent extends NavigationMixin(LightningElement) {
    quelst;
    examresplst = [];
    selOpt;
    seloptId;
    marks = 0;
    correct_counter = 0;
    examId;
    grade;
    quelen;
    currentPageReference;
    options = new Map();
    //By CurrentPageReference we can get page important parameters like the recordId, URL parameters, etc. 
    //Get a reference to the current page in Salesforce.
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log(this.currentPageReference);
    }
    userId = Id;
    @wire(getRecord, { recordId: Id, fields: [UserEmail]}) 
    currentUserInfo({error, data}) {
    if (data) {
            this.userEmail = data.fields.Username.value;
        } else if (error) {
            this.error = error ;
        }
    }
    async connectedCallback() {
        console.log('inside question ' + this.userId +' ' + this.userEmail);
        
        this.examId = this.currentPageReference?.state?.c__regId; // ?. it checks its is if null then it will not throw error.
        console.log('questions exam Id: '+this.examId)
        try {
            const res = await getQuestions({examId:this.examId});
            this.quelst = res;
            console.log('len '+ this.quelst.length);
        }
        catch(err) {
            console.log('Question Fetching Error' + err);
        }
    }

    handleOptions(event) {
        this.seloptId = event.target.name;
        this.selOpt = event.target.value;
        console.log('options'+this.selOpt);
        this.options.set(this.seloptId, this.selOpt);
    }
    async handleSubmit() {
        this.quelen = this.quelst.length;
        for (let i = 0; i < this.quelst.length; i++) {
            let examresp = { 'sobject': 'Exam_Result__c' };
            examresp.Correct_Option__c = this.quelst[i].Correct_Option__c;
            examresp.Selected_Option__c = this.options.get(this.quelst[i].Id);
            examresp.SelQuesId__c = this.quelst[i].Id;
            examresp.Question__c = this.quelst[i].Question_Desc__c;
            examresp.ExamId__c = this.quelst[i].ExamQuesRel__c;
            // console.log(examresp.ExamId__c);
            if (examresp.Correct_Option__c === examresp.Selected_Option__c) {
                this.marks = 0;
                this.marks += 1;
                this.correct_counter +=1;
                examresp.Score__c = this.marks;
            }
            else {
                examresp.Score__c = 0;
            }
            this.examresplst.push(examresp);
        }
        if(this.correct_counter < (this.quelen/2)){
            this.grade = 'Failed';
        }
        else{
             this.grade = 'Pass';
        }
        console.log('que grade ' + this.grade);
        console.log(JSON.parse(JSON.stringify(this.examresplst)));
        try {
                    await setResult({ res: this.examresplst });
                    const successToast = new ShowToastEvent({
                            title: 'Success!',
                            message: 'Submitted Successfully',
                            variant: 'success'
                        });
                    this.dispatchEvent(successToast);
                
        }
        catch (err) {
            console.log(err);
        }
        // Navigate to the new component
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name : 'submission__c'
            },
            state: {
                c__regId : this.examId, 
                c__grade : this.grade
            }
        });
    }

}