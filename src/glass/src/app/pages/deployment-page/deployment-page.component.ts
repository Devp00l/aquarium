import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { CephfsModalComponent } from '~/app/pages/deployment-page/cephfs-modal/cephfs-modal.component';
import { DialogComponent } from '~/app/shared/components/dialog/dialog.component';
import { Device, OrchService } from '~/app/shared/services/api/orch.service';
import { PollService } from '~/app/shared/services/api/poll.service';
import { ServiceDesc, ServicesService } from '~/app/shared/services/api/services.service';
import { NotificationService } from '~/app/shared/services/notification.service';

@Component({
  selector: 'glass-deployment-page',
  templateUrl: './deployment-page.component.html',
  styleUrls: ['./deployment-page.component.scss']
})
export class DeploymentPageComponent implements OnInit {
  @ViewChild(MatStepper)
  set stepper(s: MatStepper) {
    this.deploymentStepper = s;
  }

  @BlockUI()
  blockUI!: NgBlockUI;

  nfs = false;
  devices: Device[] = [];
  deploymentStepper!: MatStepper;
  displayInventory = true;
  deploymentSuccessful = true;

  public cephfsList: ServiceDesc[] = [];

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private orchService: OrchService,
    private services: ServicesService,
    private pollService: PollService
  ) {}

  ngOnInit(): void {
    this.getDevices();
    this.updateCephfsList();
  }

  addNfs(): void {
    this.nfs = true;
  }

  getDevices(): void {
    this.startBlockUI('Please wait, fetching device information ...');
    this.orchService
      .devices()
      .pipe(
        this.pollService.poll(
          (hostDevices) => {
            let hasDevices = false;
            Object.values(hostDevices).forEach((v) => {
              if (v.devices.length > 0) {
                hasDevices = true;
              }
            });
            return !hasDevices;
          },
          10,
          'Failed to fetch device information'
        )
      )
      .subscribe(
        (hostDevices) => {
          Object.values(hostDevices).forEach((v) => {
            this.devices = this.devices.concat(v.devices);
          });
          this.stopBlockUI();
        },
        (err) => {
          this.handleError(err);
        }
      );
  }

  chooseDevices(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '35%',
      data: {
        type: 'yesNo',
        icon: 'warn',
        title: 'Choose selected devices',
        message:
          'The step will erase all data on the listed devices. Are you sure you want to continue?'
      }
    });
    dialogRef.afterClosed().subscribe((decision: boolean) => {
      if (decision) {
        this.startAssimilation();
      }
    });
  }

  startAssimilation(): void {
    this.startBlockUI('Please wait, device deployment in progress ...');
    this.orchService.assimilateDevices().subscribe(
      (success) => {
        if (success) {
          this.pollAssimilationStatus();
        } else {
          this.handleError('Failed to start device deployment.');
        }
      },
      (err) => {
        this.handleError(err);
      }
    );
  }

  pollAssimilationStatus(): void {
    this.orchService
      .assimilateStatus()
      .pipe(this.pollService.poll((res) => !res, undefined, 'Failed to deploy disks.'))
      .subscribe(
        (res) => {
          this.deploymentStepper.next();
          this.stopBlockUI();
        },
        (err) => {
          this.handleError(err);
        }
      );
  }

  public openCephfsDialog(): void {
    const ref = this.dialog.open(CephfsModalComponent, {
      width: '60%'
    });
    ref.afterClosed().subscribe({
      next: (result: boolean) => {
        if (result) {
          this.updateCephfsList();
        }
      }
    });
  }

  private updateCephfsList(): void {
    this.services.list().subscribe({
      next: (result: ServiceDesc[]) => {
        this.cephfsList = result;
      }
    });
  }

  private startBlockUI(message?: string): void {
    this.displayInventory = false;
    if (message) {
      this.blockUI.start(message);
    }
  }

  private stopBlockUI(): void {
    this.displayInventory = true;
    this.blockUI.stop();
  }

  private handleError(err: any): void {
    this.deploymentSuccessful = false;
    this.stopBlockUI();
    this.notificationService.show(err.toString(), {
      type: 'error'
    });
  }
}
