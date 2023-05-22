import { LightningElement,wire} from 'lwc';
import { NavigationMixin,CurrentPageReference} from 'lightning/navigation';
import getResult from '@salesforce/apex/SubmissionResultApex.fetchResult';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserEmail from '@salesforce/schema/User.Username';
export default class ResultsComponent extends NavigationMixin(LightningElement) {
    resultlst;
    examId;
    grade;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('resref ' + this.currentPageReference);
    }
    userId=Id;
    @wire(getRecord, { recordId: Id, fields: [UserEmail]}) 
    currentUserInfo({error, data}) {
    if (data) {
            this.userEmail = data.fields.Username.value;
        } else if (error) {
            this.error = error ;
        }
    }
    async connectedCallback() {
        try {
            this.examId = this.currentPageReference?.state?.c__regId;
            this.grade = this.currentPageReference?.state?.c__grade;
            console.log('res' + this.examId);
            console.log('grade res ' + this.grade);
            const res = await getResult({examId:this.examId,userId:this.userId});
            this.resultlst = res;
            console.log(this.resultlst);
        }
        catch (err) {
            console.log(err);
        }
    }
    handleBack(){
         this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                  name: "RegisteredExam__c"
                },
                state : {
                    c__grade : this.grade
                }
            });
            
        }
}