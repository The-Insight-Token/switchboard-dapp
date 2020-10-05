import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { IamService } from 'src/app/shared/services/iam.service';
import { DialogData } from './dialog-user-data';

@Component({
    selector: 'dialog-user',
    templateUrl: 'dialog-user.component.html',
    styleUrls: ['../header.component.scss']
})
export class DialogUser implements OnInit {
    public exampleHeader    = '';
    public profileForm      : FormGroup;
    public maxDate          : Date;
    public isSaving         = false;

    constructor(
        public dialogRef: MatDialogRef<DialogUser>,
        private fb: FormBuilder,
        private iamService: IamService,
        private toastr: ToastrService) {

        this.profileForm = fb.group({
            name: ['', Validators.compose([
                Validators.maxLength(256),
                Validators.required
            ])],
            birthdate: ['', Validators.required],
            address: ['', Validators.compose([
                Validators.maxLength(500),
                Validators.required
            ])]
        });

        let today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        this.maxDate = today;
    }

    async ngOnInit() {
        let data = await this.iamService.iam.getUserClaims();
        console.log('profile data', data);
        let diddoc = await this.iamService.iam.getDidDocument();
        console.log('diddoc', diddoc)
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async save() {
        if (this.profileForm.valid) {
            this.isSaving = true;
            console.log(this.profileForm.getRawValue());

            let data = this.profileForm.getRawValue();
            delete data.birthdate;
            try {
                await this.iamService.iam.createSelfSignedClaim({
                    data: data
                });
                this.toastr.success('Identity is updated.', 'Success');
                this.dialogRef.close();
            }
            catch (e) {
                console.error('Saving Identity Error', e);
                this.toastr.error(e.message, 'System Error')
            }
            finally {
                this.isSaving = false;
            }
        }
    }
}