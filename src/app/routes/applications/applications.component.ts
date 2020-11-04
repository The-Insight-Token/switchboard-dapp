import { Component, OnInit, ViewChild } from '@angular/core';
import { NewOrganizationComponent } from './new-organization/new-organization.component';
import { MatDialog } from '@angular/material';
import { NewApplicationComponent } from './new-application/new-application.component';
import { NewRoleComponent } from './new-role/new-role.component';
import { GovernanceListComponent } from './governance-list/governance-list.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  @ViewChild('listOrg', undefined ) listOrg: GovernanceListComponent;
  @ViewChild('listApp', undefined ) listApp: GovernanceListComponent;
  @ViewChild('listRole', undefined ) listRole: GovernanceListComponent;

  isAppShown = false;
  isRoleShown = false;

  isFilterShown: boolean = false;

  constructor(public dialog: MatDialog) { }

  openNewOrgComponent(): void {
    const dialogRef = this.dialog.open(NewOrganizationComponent, {
      width: '600px',data:{},
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

      if (result) {
        this.listOrg.getList();
      }
    });
  }

  openNewAppComponent(): void {
    const dialogRef = this.dialog.open(NewApplicationComponent, {
      width: '600px',data:{},
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.listApp.getList();
      }
    });
  }

  openNewRoleComponent(): void {
    const dialogRef = this.dialog.open(NewRoleComponent, {
      width: '600px',data:{},
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.listRole.getList();
      }
    });
  }

  ngOnInit() {
  }

  showMe(i: any) {
    if (i.index === 1) {
      if (this.isAppShown) {
        this.listApp.getList();
      }
      else {
        this.isAppShown = true;
      }
    }
    else if (i.index === 2) {
      if (this.isRoleShown) {
        this.listRole.getList();
      }
      else {
        this.isRoleShown = true;
      }
    }
    else {
      this.listOrg.getList();
    }
  }

  toggleFilter() {

    this.isFilterShown = ! this.isFilterShown;
    
    }
}

export interface OrganizationsLists {
  imageUrl: string;
  orgNameSpace: string;
  orgName: string;
  websiteURL: string;
  actions: string;
}

const ORGANIZATIONS_DATA: OrganizationsLists[] = [
  {imageUrl: 'https://www.energyweb.org/wp-content/uploads/2019/04/logo-knockout.png', orgNameSpace: 'organization1 namespace', orgName: 'Organization Name 1', websiteURL: 'www.organizations1.com', actions: ''},
  {imageUrl: 'https://www.energyweb.org/wp-content/uploads/2019/04/logo-knockout.png', orgNameSpace: 'organization2 namespace', orgName: 'Organization Name 2', websiteURL: 'www.organizations2.com', actions: ''},
  {imageUrl: 'https://www.energyweb.org/wp-content/uploads/2019/04/logo-knockout.png', orgNameSpace: 'organization3 namespace', orgName: 'Organization Name 3', websiteURL: 'www.organizations3.com', actions: ''},
];

export interface EnrollmentRoles {
  creationDate: string;
  roleType: string;
  roleName: string;
  ensName: string;
  actions: string;
}

const ROLE_DATA: EnrollmentRoles[] = [
  {creationDate: '01/28/2020', roleType: 'Custom Role', roleName: 'Device Owner', ensName: 'device.roles.switchboard.ewc', actions: ''},
  {creationDate: '02/01/2020', roleType: 'Custom Role', roleName: 'Trader', ensName: 'trader.roles.switchboard.ewc', actions: ''},
  {creationDate: '03/16/2020', roleType: 'Custome Role', roleName: 'Admin', ensName: 'admin.roles.switchboard.ewc', actions: ''},

];
