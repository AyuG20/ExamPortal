import { LightningElement,wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserName from '@salesforce/schema/User.Name';
import {NavigationMixin} from 'lightning/navigation';
import IMAGES from "@salesforce/resourceUrl/examportal";
export default class ExamHome extends LightningElement {
    examPortalImg = IMAGES + '/examportal/images/examportal.png';
    name;
    userId=Id;
    @wire(getRecord, { recordId: Id, fields: [UserName]}) 
    currentUserInfo({error, data}) {
        if (data) {
            this.name = data.fields.Name.value;
        } else if (error) {
            this.error = error ;
        }
    }
    handleReg(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes : {
                name: "availableexams__c"
            }
        });
    }
}