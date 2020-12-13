import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ENSNamespaceTypes } from 'iam-client-lib';
import { ToastrService } from 'ngx-toastr';
import { ListType } from 'src/app/shared/constants/shared-constants';
import { IamService } from 'src/app/shared/services/iam.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ConfirmationDialogComponent } from '../../widgets/confirmation-dialog/confirmation-dialog.component';
import { GovernanceViewComponent } from '../governance-view/governance-view.component';
import { NewApplicationComponent } from '../new-application/new-application.component';
import { NewOrganizationComponent, ViewType } from '../new-organization/new-organization.component';
import { NewRoleComponent, RoleType } from '../new-role/new-role.component';
import { RemoveOrgAppComponent } from '../remove-org-app/remove-org-app.component';
import { TransferOwnershipComponent } from '../transfer-ownership/transfer-ownership.component';

const OrgColumns: string[] = ['logoUrl', 'name', 'namespace', 'actions'];
const AppColumns: string[] = ['logoUrl', 'name', 'namespace', 'actions'];
const RoleColumns: string[] = ['name', 'type', 'namespace', 'actions'];

@Component({
  selector: 'app-governance-list',
  templateUrl: './governance-list.component.html',
  styleUrls: ['./governance-list.component.scss']
})
export class GovernanceListComponent implements OnInit {
  @Input('list-type') listType: string;
  @Input('isFilterShown') isFilterShown: boolean;
  @Input() defaultFilterOptions: any;
  @Output() updateFilter = new EventEmitter<any>();

  ListType        = ListType;
  RoleType        = RoleType;
  dataSource      = [];
  origDatasource  = [];
  displayedColumns: string[];
  listTypeLabel   : string;
  ensType         : any;

  filterForm      : FormGroup;
  
  constructor(private loadingService: LoadingService,
      private iamService: IamService,
      private dialog: MatDialog,
      private fb: FormBuilder,
      private toastr: ToastrService
    ) { 
      this.filterForm = fb.group({
        organization: '',
        application: '',
        role: ''
      });
    }

  async ngOnInit() {
    // console.log('listType', this.listType);
    switch (this.listType) {
      case ListType.ORG:
        this.displayedColumns = OrgColumns;
        this.listTypeLabel = 'Organization';
        this.ensType = ENSNamespaceTypes.Organization;
        break;
      case ListType.APP:
        this.displayedColumns = AppColumns;
        this.listTypeLabel = 'Application';
        this.ensType = ENSNamespaceTypes.Application;
        break;
      case ListType.ROLE:
        this.displayedColumns = RoleColumns;
        this.listTypeLabel = 'Role';
        this.ensType = ENSNamespaceTypes.Roles;
        break;
    }

    await this.getList(this.defaultFilterOptions);
  }

  public async getList(filterOptions?: any) {
    this.loadingService.show();
    const $getOrgList = await this.iamService.iam.getENSTypesByOwner({
      type: this.ensType,
      owner: this.iamService.accountAddress
    });

    this.origDatasource = $getOrgList;

    // Setup Filter
    if (filterOptions) {
      this.filterForm.patchValue({ 
        organization: filterOptions.organization || '',
        application: filterOptions.application || '',
        role: ''
      });
      // console.log('setting up filter', this.filterForm.value);
    }
    this.filter();

    // console.log($getOrgList);
    this.loadingService.hide();
  }

  view(type: string, data: any) {
    // console.log('type', type);
    // console.log('data', data);
    const dialogRef = this.dialog.open(GovernanceViewComponent, {
      width: '600px',data:{
        type: type,
        definition: data
      },
      maxWidth: '100%',
      disableClose: true
    });
  }

  viewApps(type: string, data: any) {
    this.updateFilter.emit({
      listType: ListType.APP,
      organization: data.namespace.split('.iam.ewc')[0]
    });
  }

  viewRoles(type: string, data: any) {
    let org = undefined;
    let app = undefined;

    if (type === ListType.ORG) {
      org = data.namespace.split('.iam.ewc')[0];
    }
    else {
      let arr = data.namespace.split('.iam.ewc')[0].split('.');
      org = arr[arr.length - 1];
    }

    if (type === ListType.APP) {
      app = data.namespace.split(`.${ENSNamespaceTypes.Application}.`)[0];
    }

    this.updateFilter.emit({
      listType: ListType.ROLE,
      organization: org,
      application: app
    });
  }

  edit(type: string, data: any) {
    // console.log('type', type);
    // console.log('data', data);

    let component = undefined;

    switch (type) {
      case ListType.ORG:
        component = NewOrganizationComponent;
        break;
      case ListType.APP:
        component = NewApplicationComponent;
        break;
      case ListType.ROLE:
        component = NewRoleComponent;
        break;
    }

    if (component) {
      const dialogRef = this.dialog.open(component, {
        width: '600px',data:{
          viewType: ViewType.UPDATE,
          origData: data
        },
        maxWidth: '100%',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(async (res: any) => {
        if (res) {
          await this.getList();
        }
      });
    }
  }

  transferOwnership(type: any, data: any) {
    // console.log('data', data);
    const dialogRef = this.dialog.open(TransferOwnershipComponent, {
      width: '600px',data:{
        namespace: data.namespace,
        type: type
      },
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');

      if (result) {
        this.getList();
      }
    });
  }

  private constructEnrolmentUrl(listType: string,roleDefinition: any) {
    let name = roleDefinition.name;
    let arr = roleDefinition.namespace.split(`.${ENSNamespaceTypes.Roles}.`);
    let namespace = '';

    if (arr.length > 1) {
      namespace = arr[1];
    }

    return `${location.origin}/#/enrol?${listType}=${namespace}&roleName=${name}`;
  }

  copyToClipboard(listType: string, roleDefinition: any) {
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", this.constructEnrolmentUrl(listType, roleDefinition));
      e.preventDefault();
    }

    document.addEventListener("copy", listener, false)
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);

    this.toastr.success('Role Enrolment URL is copied to clipboard.');
  }

  async remove(listType: string, roleDefinition: any) {
    // Make sure that user confirms the removal of this namespace
    let isConfirmed = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      maxHeight: '195px',
      data: {
        header: 'Remove ' + (listType === ListType.APP ? 'Application' : 'Organization'),
        message: 'Do you wish to continue?'
      },
      maxWidth: '100%',
      disableClose: true
    }).afterClosed().toPromise();

    if (await isConfirmed) {
      // Get Removal Steps
      let steps = await this.getRemovalSteps(listType, roleDefinition);

      if (steps) {
        // Launch Remove Org / App Dialog
        let isRemoved = this.dialog.open(RemoveOrgAppComponent, {
          width: '600px',data:{
            namespace: roleDefinition.namespace,
            listType: listType,
            steps: steps
          },
          maxWidth: '100%',
          disableClose: true
        }).afterClosed().toPromise();

        // Refresh the list after successful removal
        if (await isRemoved) {
          await this.getList();
        }
      }
    }
  }

  async newApp(roleDefinition: any) {
    const dialogRef = this.dialog.open(NewApplicationComponent, {
      width: '600px',data:{
        viewType: ViewType.NEW,
        organizationNamespace: roleDefinition.namespace
      },
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (res: any) => {
      if (res) {
        // Redirect to Application List
        this.viewApps(ListType.ORG, roleDefinition);
      }
    });
  }

  async newRole(listType: string, roleDefinition: any) {
    const dialogRef = this.dialog.open(NewRoleComponent, {
      width: '600px',data:{
        viewType: ViewType.NEW,
        namespace: roleDefinition.namespace,
        listType: listType
      },
      maxWidth: '100%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (res: any) => {
      if (res) {
        // Redirect to Role List
        this.viewRoles(listType, roleDefinition);
      }
    });
  }

  private async getRemovalSteps(listType: string, roleDefinition: any) {
    this.loadingService.show();
    try {
      if (this.listType === ListType.ORG) {
        return await this.iamService.iam.deleteOrganization({
          namespace: roleDefinition.namespace,
          returnSteps: true
        });
      }
      else if (this.listType === ListType.APP) {
        return await this.iamService.iam.deleteApplication({
          namespace: roleDefinition.namespace,
          returnSteps: true
        });
      }
    }
    catch (e) {
      console.error(e);
      this.toastr.error(e, 'Delete ' + (this.listType === ListType.ORG ? 'Organization' : 'Application'));
    }
    finally {
      this.loadingService.hide();
    }
  }

  filter() {
    let tmpData = JSON.parse(JSON.stringify(this.origDatasource));
    
    // Trim Filters
    this.filterForm.get('organization').setValue(this.filterForm.value.organization.trim());
    this.filterForm.get('application').setValue(this.filterForm.value.application.trim());
    this.filterForm.get('role').setValue(this.filterForm.value.role.trim());

    // Filter By Org
    if (this.filterForm.value.organization) {
      tmpData = tmpData.filter((item: any) => {
        let arr = item.namespace.split('.iam.ewc');
        arr = arr[0].split('.');
        return (arr[arr.length - 1].toUpperCase().indexOf(this.filterForm.value.organization.toUpperCase()) >= 0);
      });
    }

    // Filter By App
    if (this.filterForm.value.application) {
      tmpData = tmpData.filter((item: any) => {
        let arr = item.namespace.split(`.${ENSNamespaceTypes.Application}.`);
        arr = arr[0].split('.');
        return (arr[arr.length - 1].toUpperCase().indexOf(this.filterForm.value.application.toUpperCase()) >= 0);
      });
    }

    this.dataSource = tmpData;
  }

  resetFilter() {
    this.filterForm.patchValue({
      organization: '',
      application: '',
      role: ''
    });

    this.dataSource = JSON.parse(JSON.stringify(this.origDatasource));
  }
}
