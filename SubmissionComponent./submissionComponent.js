import { LightningElement,wire} from 'lwc';
import { NavigationMixin,CurrentPageReference } from 'lightning/navigation';


export default class SubmissionComponent extends NavigationMixin(LightningElement) {
    examId;
    grade;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
    }
    connectedCallback() {
      this.examId = this.currentPageReference?.state?.c__regId;
      this.grade = this.currentPageReference?.state?.c__grade;
      console.log('sub' + this.examId);
      console.log('grade ' + this.grade);
    }
  handleCheckResult(){
        this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                name : 'result__c'
                },
                state:{
                  c__regId : this.examId,
                  c__grade : this.grade
                }
        });
  }
}